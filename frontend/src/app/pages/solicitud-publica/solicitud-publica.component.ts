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
    solicitante: ''
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
    
    // Find names for the message
    const centro = this.centros.find(c => c.id === this.form.centroId)?.nombre || 'Centro';
    const comida = this.tiposComida.find(t => t.id === this.form.tipoComidaId)?.nombre || 'Comida';
    
    // Format the message
    const text = `*SOLICITUD DE COMIDA - ACOPIORED*%0A%0A` +
                 `*Centro:* ${centro}%0A` +
                 `*Solicitante:* ${this.form.solicitante}%0A` +
                 `*Tipo de Comida:* ${comida}%0A` +
                 `*Cantidad:* ${this.form.cantidad}%0A` +
                 (this.form.nota ? `*Nota:* ${this.form.nota}%0A` : '') +
                 `%0A_Generado vía AcopioRed Web_`;
                 
    // Replace with the actual WhatsApp number of the central hub
    const phoneNumber = '584140000000'; 
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;

    // Simulate short delay then redirect
    setTimeout(() => {
      this.submitting = false;
      this.success = true;
      window.open(whatsappUrl, '_blank');
    }, 800);
  }

  reset() {
    this.success = false;
    this.form = {
      centroId: '',
      tipoComidaId: '',
      cantidad: null,
      nota: '',
      solicitante: ''
    };
  }
}
