import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CustomDatepickerComponent } from '../../shared/components/custom-datepicker/custom-datepicker.component';
import { NotificationService } from '../../core/services/notification.service';
import { TipoComida, TipoMovimiento } from '../../core/models/models';

declare const gsap: any;

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
    private confirmDialog: ConfirmDialogService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.api.getTiposComida().subscribe({
      next: (data) => (this.tiposComida = data),
    });
  }

  ngAfterViewInit() {
    this.applySplitText('.entrada-modal__title');
    gsap.fromTo('.premium-modal', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform' }
    );

    setTimeout(() => {
      gsap.fromTo('.entrada-modal__title .split-char', 
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

  /** Close modal and go back to dashboard */
  cerrar() {
    this.router.navigate(['/dashboard']);
  }

  /** Click on overlay backdrop closes the modal */
  onOverlayClick(event: MouseEvent) {
    this.cerrar();
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
      cancelText: 'Cancelar',
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
          
          // Generate notification
          const foodName = this.selectedTipoComidaNombre;
          this.notificationService.addNotification(
            `Entrada registrada: ${this.form.cantidad} raciones de ${foodName} recibidas vía ${this.form.origen || 'Donación'} por ${this.form.registradoPor}.`,
            'success',
            '/movimientos'
          );

          this.submitting = false;
          this.cerrar();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error al registrar');
          this.submitting = false;
        },
      });
  }
}
