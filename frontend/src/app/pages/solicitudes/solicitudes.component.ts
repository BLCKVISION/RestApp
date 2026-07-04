import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SolicitudComida, EstadoSolicitud, CentroAcopio, TipoComida } from '../../core/models/models';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
    responsable: ''
  };

  constructor(private api: ApiService) {}

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
    this.pendientes = this.solicitudes.filter(s => s.estado === EstadoSolicitud.PENDIENTE);
    this.aprobadas = this.solicitudes.filter(s => s.estado === EstadoSolicitud.APROBADA);
    this.enCocina = this.solicitudes.filter(s => s.estado === EstadoSolicitud.EN_PREPARACION);
    this.listas = this.solicitudes.filter(s => s.estado === EstadoSolicitud.LISTA);
  }

  avanzar(solicitud: SolicitudComida) {
    let nextState: EstadoSolicitud;
    if (solicitud.estado === EstadoSolicitud.PENDIENTE) nextState = EstadoSolicitud.APROBADA;
    else if (solicitud.estado === EstadoSolicitud.APROBADA) nextState = EstadoSolicitud.EN_PREPARACION;
    else if (solicitud.estado === EstadoSolicitud.EN_PREPARACION) nextState = EstadoSolicitud.LISTA;
    else return;

    this.api.updateSolicitudEstado(solicitud.id, nextState).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id === updated.id);
        if (index !== -1) this.solicitudes[index] = updated;
        this.updateKanbanBoard();
      }
    });
  }

  // --- Modal Logic ---
  abrirEditar(solicitud: SolicitudComida) {
    this.solicitudEnEdicion = solicitud;
    this.editForm = {
      cantidadSolicitada: solicitud.cantidadSolicitada,
      horaEntrega: solicitud.horaEntrega,
      observaciones: solicitud.observaciones || '',
      centroId: solicitud.centroId,
      tipoComidaId: solicitud.tipoComidaId,
      responsable: solicitud.responsable
    };
    this.isEditModalOpen = true;
  }

  cerrarEditar() {
    this.isEditModalOpen = false;
    this.solicitudEnEdicion = null;
  }

  guardarEdicion() {
    if (!this.solicitudEnEdicion) return;
    
    if (!confirm('¿Seguro que quieres editar este pedido?')) {
      return;
    }

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
      },
      error: () => {
        this.savingEdit = false;
        alert('Ocurrió un error al editar la solicitud.');
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
