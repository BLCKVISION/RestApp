import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TipoComida, TipoMovimiento } from '../../core/models/models';
import gsap from 'gsap';

@Component({
  selector: 'app-registrar-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-entrada.component.html',
  styleUrl: './registrar-entrada.component.scss',
})
export class RegistrarEntradaComponent implements OnInit, AfterViewInit {
  tiposComida: TipoComida[] = [];
  submitting = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  form = {
    tipoComidaId: '',
    cantidad: null as number | null,
    origen: '',
    nota: '',
    registradoPor: '',
    fecha: new Date().toISOString().split('T')[0],
  };

  origenes = ['Donación', 'Producción', 'Transferencia', 'Otro'];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getTiposComida().subscribe({
      next: (data) => (this.tiposComida = data),
    });
  }

  ngAfterViewInit() {
    // Fade in intro stagger animation
    gsap.fromTo('.page__title, .page__subtitle', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );

    gsap.fromTo('.form-card', 
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }

  get isValid(): boolean {
    return (
      !!this.form.tipoComidaId &&
      !!this.form.cantidad &&
      this.form.cantidad > 0 &&
      !!this.form.registradoPor
    );
  }

  submit() {
    if (!this.isValid || this.submitting) return;
    this.submitting = true;

    this.api
      .crearMovimiento({
        tipo: TipoMovimiento.ENTRADA,
        tipoComidaId: this.form.tipoComidaId,
        cantidad: this.form.cantidad!,
        origen: this.form.origen || undefined,
        nota: this.form.nota || undefined,
        registradoPor: this.form.registradoPor,
        fecha: this.form.fecha || undefined,
      })
      .subscribe({
        next: () => {
          this.showToast('✓ Entrada registrada exitosamente', 'success');
          this.resetForm();
          this.submitting = false;
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Error al registrar', 'error');
          this.submitting = false;
        },
      });
  }

  private resetForm() {
    this.form = {
      tipoComidaId: '',
      cantidad: null,
      origen: '',
      nota: '',
      registradoPor: this.form.registradoPor,
      fecha: new Date().toISOString().split('T')[0],
    };
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}
