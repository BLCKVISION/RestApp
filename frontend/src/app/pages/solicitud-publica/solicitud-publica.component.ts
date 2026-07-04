import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CentroAcopio, TipoComida } from '../../core/models/models';

@Component({
  selector: 'app-solicitud-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitud-publica.component.html',
  styleUrl: './solicitud-publica.component.scss'
})
export class SolicitudPublicaComponent implements OnInit {
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  submitting = false;
  success = false;
  error = false;
  showSummary = false;

  form = {
    centroId: '',
    tipoComidaId: '',
    cantidad: null as number | null,
    nota: '',
    solicitante: '',
    organizacion: '',
    horaEntrega: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: data => this.centros = data });
    this.api.getTiposComida().subscribe({ next: data => this.tiposComida = data });
  }

  get isValid(): boolean {
    return !!this.form.centroId && !!this.form.tipoComidaId && !!this.form.cantidad && this.form.cantidad > 0 && !!this.form.solicitante;
  }

  verResumen() {
    if (!this.isValid) return;
    this.showSummary = true;
  }

  cancelarResumen() {
    this.showSummary = false;
  }

  get selectedTipoComidaNombre(): string {
    const tipo = this.tiposComida.find(t => t.id === this.form.tipoComidaId);
    return tipo ? tipo.nombre : '---';
  }

  async confirmarRegistro() {
    if (!this.isValid || this.submitting) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar solicitud',
      message: '¿Deseas enviar esta solicitud?',
      confirmText: 'Sí, enviar',
      cancelText: 'No',
    });
    if (!confirmado) return;

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
        this.showSummary = false;
        this.success = true;
        this.toast.success('✓ Solicitud enviada exitosamente');
      },
      error: () => {
        this.submitting = false;
        this.error = true;
        this.toast.error('Ocurrió un error al enviar tu solicitud. Intenta de nuevo.');
      }
    });
  }

  reset() {
    this.success = false;
    this.showSummary = false;
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
