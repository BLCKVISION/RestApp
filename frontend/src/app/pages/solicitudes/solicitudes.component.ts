import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { SolicitudComida, EstadoSolicitud, CentroAcopio, TipoComida } from '../../core/models/models';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent implements OnInit {
  solicitudes: SolicitudComida[] = [];
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  loading = true;

  // Kanban Columns
  pendientes: SolicitudComida[] = [];
  aprobadas: SolicitudComida[] = [];
  enCocina: SolicitudComida[] = [];
  listas: SolicitudComida[] = [];

  // Expanded Column
  expandedColumn: string | null = null;

  // Modal State
  isEditModalOpen = false;
  savingEdit = false;
  solicitudEnEdicion: SolicitudComida | null = null;
  editForm = {
    cantidadSolicitada: 0,
    horaEntrega: '',
    observaciones: '',
    centroId: '',
    tipoComidaId: '',
    responsable: '',
    prioridad: 'MEDIA'
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading = true;
    this.api.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.updateKanbanBoard();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  updateKanbanBoard() {
    this.pendientes = this.solicitudes.filter(s => s.estado === EstadoSolicitud.PENDIENTE).sort(this.sortPrioridad);
    this.aprobadas = this.solicitudes.filter(s => s.estado === EstadoSolicitud.APROBADA).sort(this.sortPrioridad);
    this.enCocina = this.solicitudes.filter(s => s.estado === EstadoSolicitud.EN_PREPARACION).sort(this.sortPrioridad);
    this.listas = this.solicitudes.filter(s => s.estado === EstadoSolicitud.LISTA).sort(this.sortPrioridad);
  }

  sortPrioridad(a: SolicitudComida, b: SolicitudComida): number {
    const val: Record<string, number> = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
    return (val[b.prioridad || 'MEDIA'] || 0) - (val[a.prioridad || 'MEDIA'] || 0);
  }

  toggleExpand(columnName: string) {
    if (this.expandedColumn === columnName) {
      this.expandedColumn = null;
    } else {
      this.expandedColumn = columnName;
    }
  }

  drop(event: CdkDragDrop<SolicitudComida[]>, newEstado: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedItem = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      let nextState: EstadoSolicitud = newEstado as EstadoSolicitud;
      this.api.updateSolicitudEstado(movedItem.id, nextState).subscribe({
        next: (updated) => {
          const index = this.solicitudes.findIndex(s => s.id === updated.id);
          if (index !== -1) this.solicitudes[index] = updated;
          // No need to re-call updateKanbanBoard immediately unless we want to sort, 
          // to avoid flickering after drag drop. The transferArrayItem already handled the UI.
        },
        error: () => {
          // Revert on error
          this.loadSolicitudes();
        }
      });
    }
  }

  // --- Modal Logic ---
  abrirEditar(solicitud: SolicitudComida) {
    this.solicitudEnEdicion = solicitud;
    this.editForm = {
      cantidadSolicitada: solicitud.cantidadSolicitada,
      horaEntrega: solicitud.horaEntrega || '',
      observaciones: solicitud.observaciones || '',
      centroId: solicitud.centroId,
      tipoComidaId: solicitud.tipoComidaId || '',
      responsable: solicitud.responsable,
      prioridad: solicitud.prioridad || 'MEDIA'
    };
    this.isEditModalOpen = true;
  }

  cerrarEditar() {
    this.isEditModalOpen = false;
    this.solicitudEnEdicion = null;
  }

  async guardarEdicion() {
    if (!this.solicitudEnEdicion) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios de este pedido?',
      confirmText: 'Sí, guardar',
      cancelText: 'No',
    });
    if (!confirmado) return;

    this.savingEdit = true;
    this.api.updateSolicitud(this.solicitudEnEdicion.id, this.editForm).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.solicitudes[index] = updated;
          this.updateKanbanBoard();
        }
        this.savingEdit = false;
        this.cerrarEditar();
        this.toast.success('✓ Solicitud actualizada exitosamente');
      },
      error: () => {
        this.savingEdit = false;
        this.toast.error('Ocurrió un error al editar la solicitud.');
      }
    });
  }

  getCentroNombre(id: string): string {
    return this.centros.find(c => c.id === id)?.nombre || id;
  }

  getComidaNombre(id: string): string {
    return this.tiposComida.find(c => c.id === id)?.nombre || id;
  }
}
