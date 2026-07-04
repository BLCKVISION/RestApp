import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { TipoComida, TipoMovimiento } from '../../core/models/models';
import { CustomDatepickerComponent } from '../../shared/components/custom-datepicker/custom-datepicker.component';
import gsap from 'gsap';

@Component({
  selector: 'app-registrar-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatepickerComponent],
  templateUrl: './registrar-entrada.component.html',
  styleUrl: './registrar-entrada.component.scss',
})
export class RegistrarEntradaComponent implements OnInit, AfterViewInit {
  tiposComida: TipoComida[] = [];
  submitting = false;
  showSummary = false;

  form = {
    tipoComidaId: '',
    cantidad: null as number | null,
    origen: '',
    nota: '',
    registradoPor: '',
    fecha: new Date().toISOString().split('T')[0],
  };

  origenes = ['Donación', 'Producción', 'Transferencia', 'Otro'];
  isOpenTipoComida = false;
  isOpenOrigen = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

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

  get selectedTipoComidaNombre(): string {
    const tipo = this.tiposComida.find(t => t.id === this.form.tipoComidaId);
    return tipo ? tipo.nombre : 'Seleccionar tipo...';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isOpenTipoComida = false;
    this.isOpenOrigen = false;
  }

  toggleTipoComida(event: Event) {
    event.stopPropagation();
    this.isOpenTipoComida = !this.isOpenTipoComida;
    this.isOpenOrigen = false;
  }

  selectTipoComida(id: string) {
    this.form.tipoComidaId = id;
    this.isOpenTipoComida = false;
  }

  toggleOrigen(event: Event) {
    event.stopPropagation();
    this.isOpenOrigen = !this.isOpenOrigen;
    this.isOpenTipoComida = false;
  }

  selectOrigen(origen: string) {
    this.form.origen = origen;
    this.isOpenOrigen = false;
  }

  verResumen() {
    if (!this.isValid) return;
    this.showSummary = true;
  }

  cancelarResumen() {
    this.showSummary = false;
  }

  async confirmarRegistro() {
    if (!this.isValid || this.submitting) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar registro',
      message: '¿Deseas registrar esta entrada en el sistema?',
      confirmText: 'Sí, registrar',
      cancelText: 'No',
    });
    if (!confirmado) return;

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
          this.toast.success('✓ Entrada registrada exitosamente');
          this.resetForm();
          this.showSummary = false;
          this.submitting = false;
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error al registrar');
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
}
