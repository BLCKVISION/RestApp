import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SolicitudComida, EstadoSolicitud } from '../../core/models/models';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent implements OnInit {
  solicitudes: SolicitudComida[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading = true;
    this.api.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  aprobar(solicitud: SolicitudComida) {
    this.actualizarEstado(solicitud.id, EstadoSolicitud.APROBADA);
  }

  preparar(solicitud: SolicitudComida) {
    this.actualizarEstado(solicitud.id, EstadoSolicitud.EN_PREPARACION);
  }

  listar(solicitud: SolicitudComida) {
    this.actualizarEstado(solicitud.id, EstadoSolicitud.LISTA);
  }

  private actualizarEstado(id: string, estado: EstadoSolicitud) {
    this.api.updateSolicitudEstado(id, estado).subscribe({
      next: (updated) => {
        const index = this.solicitudes.findIndex(s => s.id === id);
        if (index !== -1) {
          this.solicitudes[index] = updated;
        }
      }
    });
  }
}
