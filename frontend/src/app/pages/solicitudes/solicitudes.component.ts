import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { SolicitudComida, EstadoSolicitud, CentroAcopio, TipoComida } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';

declare const gsap: any;

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent implements OnInit, AfterViewInit {
  solicitudes: SolicitudComida[] = [];
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  loading = true;
  filtroFecha: 'todas' | 'hoy' | 'manana' = 'todas';

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
    notasInternas: '',
    centroId: '',
    tipoComidaId: '',
    responsable: '',
    prioridad: 'MEDIA',
    ubicacion: ''
  };

  isCreateModalOpen = false;
  savingCreate = false;
  createForm = {
    cantidadSolicitada: null as number | null,
    horaEntrega: '',
    observaciones: '',
    notasInternas: '',
    centroId: '',
    tipoComidaId: '',
    responsable: '',
    prioridad: 'MEDIA',
    ubicacion: ''
  };

  // State advancing
  advancingId: string | null = null;

  // Detail modal
  selectedSolicitud: SolicitudComida | null = null;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
    this.loadSolicitudes();
  }

  ngAfterViewInit() {
    // Apply premium SplitText effect to the page title
    this.applySplitText('.page__title');

    setTimeout(() => {
      gsap.fromTo('.page__title .split-char',
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
      );
    }, 100);
  }

  private applySplitText(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el: any) => {
      if (el.querySelector('.split-word')) return;
      const text = el.textContent || '';
      el.innerHTML = text
        .split(' ')
        .map((word: string) => `<span class="split-word" style="display: inline-block; overflow: hidden; vertical-align: bottom;"><span class="split-char" style="display: inline-block;">${word}</span></span>`)
        .join(' ');
    });
  }

  loadSolicitudes() {
    this.loading = true;
    this.api.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.updateKanbanBoard();
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.animateKanbanCards();
        }, 150);
      },
      error: () => (this.loading = false),
    });
  }

  animateKanbanCards() {
    // Stagger column headers
    gsap.fromTo('.kanban-column', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.18, ease: 'power3.out', clearProps: 'transform' }
    );

    // Stagger cards within the columns
    gsap.fromTo('.kanban-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.18, ease: 'power3.out', delay: 0.2, clearProps: 'transform' }
    );
  }

  updateKanbanBoard() {
    let filtered = [...this.solicitudes];
    const today = new Date();

    if (this.filtroFecha === 'hoy') {
      const todayStr = today.toDateString();
      filtered = filtered.filter(s => {
        const d = new Date(s.fechaSolicitada);
        return d.toDateString() === todayStr;
      });
    } else if (this.filtroFecha === 'manana') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();
      filtered = filtered.filter(s => {
        const d = new Date(s.fechaSolicitada);
        return d.toDateString() === tomorrowStr;
      });
    }

    this.pendientes = filtered.filter(s => s.estado === EstadoSolicitud.PENDIENTE).sort(this.sortPrioridad);
    this.aprobadas = filtered.filter(s => s.estado === EstadoSolicitud.APROBADA).sort(this.sortPrioridad);
    this.enCocina = filtered.filter(s => s.estado === EstadoSolicitud.EN_PREPARACION).sort(this.sortPrioridad);
    this.listas = filtered.filter(s => s.estado === EstadoSolicitud.LISTA).sort(this.sortPrioridad);
  }

  cambiarFiltroFecha(filtro: 'todas' | 'hoy' | 'manana') {
    this.filtroFecha = filtro;
    this.updateKanbanBoard();
  }

  sortPrioridad(a: SolicitudComida, b: SolicitudComida): number {
    const val: Record<string, number> = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
    return (val[b.prioridad || 'MEDIA'] || 0) - (val[a.prioridad || 'MEDIA'] || 0);
  }

  toggleExpand(columnName: string) {
    this.expandedColumn = this.expandedColumn === columnName ? null : columnName;
  }

  verDetalle(sol: SolicitudComida) {
    this.selectedSolicitud = sol;
    setTimeout(() => {
      gsap.fromTo('.modal-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo('.premium-modal', 
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }, 50);
  }

  cerrarDetalle() {
    this.selectedSolicitud = null;
  }

  /** Advance a solicitud to the next state via button click */
  getNextState(estado: string): EstadoSolicitud | null {
    const flow: Record<string, EstadoSolicitud> = {
      'PENDIENTE': EstadoSolicitud.APROBADA,
      'APROBADA': EstadoSolicitud.EN_PREPARACION,
      'EN_PREPARACION': EstadoSolicitud.LISTA,
    };
    return flow[estado] || null;
  }

  getNextLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Aprobar',
      'APROBADA': 'A Cocina',
      'EN_PREPARACION': 'Empaquetar',
    };
    return labels[estado] || '';
  }

  async avanzarEstado(sol: SolicitudComida) {
    const nextState = this.getNextState(sol.estado);
    if (!nextState || this.advancingId === sol.id) return;

    this.advancingId = sol.id;
    this.api.updateSolicitudEstado(sol.id, nextState).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id === updated.id);
        if (index !== -1) this.solicitudes[index] = updated;
        this.updateKanbanBoard();
        this.advancingId = null;
        this.toast.success(`✓ Pedido movido a ${nextState.replace('_', ' ')}`);
        
        // Push notification
        const centerName = this.getCentroNombre(updated.centroId);
        this.notificationService.addNotification(
          `Pedido #${updated.id.slice(-6).toUpperCase()} (${centerName}) movido a ${nextState.replace('_', ' ')}.`,
          'success',
          '/solicitudes'
        );
      },
      error: () => {
        this.advancingId = null;
        this.toast.error('Error al actualizar el estado');
      }
    });
  }

  async cambiarEstadoDirecto(sol: SolicitudComida, nuevoEstado: string) {
    if (this.advancingId === sol.id) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Cambiar estado del pedido',
      message: `¿Deseas cambiar manualmente el estado de este pedido a "${nuevoEstado.replace('_', ' ')}"?`,
      confirmText: 'Sí, cambiar',
      cancelText: 'Cancelar',
    });
    if (!confirmado) return;

    this.advancingId = sol.id;
    this.api.updateSolicitudEstado(sol.id, nuevoEstado as any).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id === updated.id);
        if (index !== -1) this.solicitudes[index] = updated;
        this.updateKanbanBoard();
        this.selectedSolicitud = updated; // Update open detail modal
        this.advancingId = null;
        this.toast.success(`✓ Pedido cambiado a ${nuevoEstado.replace('_', ' ')}`);

        // Push notification
        const centerName = this.getCentroNombre(updated.centroId);
        this.notificationService.addNotification(
          `Estado corregido: Pedido #${updated.id.slice(-6).toUpperCase()} (${centerName}) cambiado a ${nuevoEstado.replace('_', ' ')}.`,
          'info',
          '/solicitudes'
        );
      },
      error: () => {
        this.advancingId = null;
        this.toast.error('Error al cambiar el estado del pedido');
      }
    });
  }

  // --- Modal Logic ---
  abrirEditar(sol: SolicitudComida) {
    this.solicitudEnEdicion = sol;
    this.editForm = {
      cantidadSolicitada: sol.cantidadSolicitada,
      horaEntrega: sol.horaEntrega || '',
      observaciones: sol.observaciones || '',
      notasInternas: sol.notasInternas || '',
      centroId: sol.centroId,
      tipoComidaId: sol.tipoComidaId || '',
      responsable: sol.responsable,
      prioridad: sol.prioridad || 'MEDIA',
      ubicacion: sol.ubicacion || ''
    };
    this.isEditModalOpen = true;
    setTimeout(() => {
      gsap.fromTo('.modal-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo('.premium-modal', 
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }, 50);
  }

  cerrarEditar() {
    this.isEditModalOpen = false;
    this.solicitudEnEdicion = null;
    this.cdr.detectChanges();
  }

  async guardarEdicion() {
    if (!this.solicitudEnEdicion) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar cambios',
      message: '¿Deseas guardar los cambios de este pedido?',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    });
    if (!confirmado) return;

    this.savingEdit = true;
    this.api.updateSolicitud(this.solicitudEnEdicion.id, this.editForm).subscribe({
      next: (updated) => {
        this.savingEdit = false;
        const index = this.solicitudes.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.solicitudes[index] = updated;
          this.updateKanbanBoard();
        }
        this.cerrarEditar();
        this.toast.success('✓ Solicitud actualizada exitosamente');
      },
      error: () => {
        this.savingEdit = false;
        this.toast.error('Ocurrió un error al editar la solicitud.');
      }
    });
  }

  abrirCrear() {
    this.createForm = {
      cantidadSolicitada: null,
      horaEntrega: '',
      observaciones: '',
      notasInternas: '',
      centroId: '',
      tipoComidaId: '',
      responsable: '',
      prioridad: 'MEDIA',
      ubicacion: ''
    };
    this.isCreateModalOpen = true;
    setTimeout(() => {
      gsap.fromTo('.modal-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo('.premium-modal', 
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }, 50);
  }

  onCentroChange() {
    const c = this.centros.find(x => x.id === this.createForm.centroId);
    if (c) {
      this.createForm.ubicacion = c.ubicacion;
    }
  }

  onCentroEditChange() {
    const c = this.centros.find(x => x.id === this.editForm.centroId);
    if (c) {
      this.editForm.ubicacion = c.ubicacion;
    }
  }

  cerrarCrear() {
    this.isCreateModalOpen = false;
    this.cdr.detectChanges();
  }

  async guardarCrear() {
    if (!this.createForm.centroId || !this.createForm.tipoComidaId || !this.createForm.cantidadSolicitada || !this.createForm.responsable) {
      this.toast.error('Por favor completa los campos requeridos (*)');
      return;
    }

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar nuevo pedido',
      message: '¿Deseas registrar este nuevo pedido interno?',
      confirmText: 'Sí, crear',
      cancelText: 'Cancelar',
    });
    if (!confirmado) return;

    this.savingCreate = true;

    const payload = {
      centroId: this.createForm.centroId,
      tipoComidaId: this.createForm.tipoComidaId,
      cantidad: this.createForm.cantidadSolicitada,
      solicitante: this.createForm.responsable,
      nota: this.createForm.observaciones,
      notasInternas: this.createForm.notasInternas,
      horaEntrega: this.createForm.horaEntrega,
      ubicacion: this.createForm.ubicacion,
      prioridad: this.createForm.prioridad
    };

    this.api.crearSolicitud(payload).subscribe({
      next: () => {
        this.savingCreate = false;
        this.cerrarCrear();
        this.toast.success('✓ Pedido registrado exitosamente');
        this.loadSolicitudes();
      },
      error: () => {
        this.savingCreate = false;
        this.toast.error('Ocurrió un error al crear la solicitud.');
      }
    });
  }

  getCentroNombre(id: string | undefined): string {
    if (!id) return '';
    return this.centros.find(c => c.id === id)?.nombre || id;
  }

  getComidaNombre(id: string | undefined): string {
    if (!id) return '';
    return this.tiposComida.find(c => c.id === id)?.nombre || id;
  }
}
