import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CentroAcopio, TipoComida } from '../../core/models/models';

@Component({
  selector: 'app-solicitud-publica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-publica.component.html',
  styleUrl: './solicitud-publica.component.scss'
})
export class SolicitudPublicaComponent implements OnInit {
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  submitting = false;
  success = false;
  error = false;

  form = {
    centroId: '',
    tipoComidaId: '',
    cantidad: null as number | null,
    nota: '',
    solicitante: '',
    organizacion: '',
    horaEntrega: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
  }

  get isValid(): boolean {
    return !!this.form.centroId && !!this.form.tipoComidaId && !!this.form.cantidad && this.form.cantidad > 0 && !!this.form.solicitante;
  }

  submit() {
    if (!this.isValid || this.submitting) return;
    this.submitting = true;
    this.error = false;
    
    this.api.crearSolicitud({
      centroId: this.form.centroId,
      tipoComidaId: this.form.tipoComidaId,
      cantidad: this.form.cantidad,
      solicitante: this.form.solicitante + (this.form.organizacion ? ` (${this.form.organizacion})` : ''),
      nota: this.form.nota,
      horaEntrega: this.form.horaEntrega || 'A convenir'
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
      },
      error: () => {
        this.submitting = false;
        this.error = true;
        alert('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.');
      }
    });
  }

  reset() {
    this.success = false;
    this.form = {
      centroId: '',
      tipoComidaId: '',
      cantidad: null,
      nota: '',
      solicitante: '',
      organizacion: '',
      horaEntrega: ''
    };
  }
}
