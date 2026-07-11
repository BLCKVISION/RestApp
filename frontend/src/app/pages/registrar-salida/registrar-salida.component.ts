import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CustomDatepickerComponent } from '../../shared/components/custom-datepicker/custom-datepicker.component';
import {
  CentroAcopio,
  TipoComida,
  TipoMovimiento,
  ResumenInventario,
  SolicitudComida,
  EstadoSolicitud
} from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import gsap from 'gsap';

@Component({
  selector: 'app-registrar-salida',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatepickerComponent],
  templateUrl: './registrar-salida.component.html',
  styleUrl: './registrar-salida.component.scss',
})
export class RegistrarSalidaComponent implements OnInit, AfterViewInit {
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  resumen: ResumenInventario | null = null;
  submitting = false;
  showSummary = false;

  form = {
    centroId: '',
    tipoComidaId: '',
    cantidad: null as number | null,
    destino: '',
    nota: '',
    registradoPor: '',
    solicitudId: '',
    fecha: new Date().toISOString().split('T')[0],
  };

  isOpenTipoComida = false;
  isOpenCentro = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: (data) => (this.centros = data) });
    this.api.getTiposComida().subscribe({ next: (data) => (this.tiposComida = data) });
    this.api.getResumen().subscribe({ next: (data) => (this.resumen = data) });

    this.route.queryParams.subscribe(params => {
      const solId = params['solicitudId'];
      if (solId) {
        this.api.getSolicitudes().subscribe(solicitudes => {
          const sol = solicitudes.find(s => s.id === solId);
          if (sol) {
            this.form.solicitudId = sol.id;
            this.form.centroId = sol.centroId;
            this.form.cantidad = sol.cantidadSolicitada;
            this.form.registradoPor = sol.responsable;
            this.form.nota = sol.observaciones || '';
            if (sol.tipoComidaId) {
               this.form.tipoComidaId = sol.tipoComidaId;
            }
            const centro = this.centros.find(c => c.id === sol.centroId);
            this.form.destino = centro ? centro.nombre : '';
            setTimeout(() => {
              this.toast.success(`Despacho vinculado al pedido de ${this.form.destino || 'la organización'}`);
            }, 300);
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    this.applySplitText('.page__title');

    setTimeout(() => {
      gsap.fromTo('.page__title .split-char', 
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.0, stagger: 0.08, ease: 'power4.out' }
      );

      gsap.fromTo('.page__subtitle', 
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      gsap.fromTo('.form-card, .summary-card', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.18, ease: 'power3.out', clearProps: 'transform' }
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

  get stockDisponible(): number {
    if (!this.resumen || !this.form.tipoComidaId) return 0;
    const tipo = this.resumen.inventarioPorTipo.find(
      (t) => t.tipoComidaId === this.form.tipoComidaId
    );
    return tipo ? tipo.stockActual : 0;
  }

  get selectedCentroNombre(): string {
    const c = this.centros.find(x => x.id === this.form.centroId);
    return c ? c.nombre : 'Seleccionar centro...';
  }

  get selectedTipoComidaNombre(): string {
    const t = this.tiposComida.find(x => x.id === this.form.tipoComidaId);
    return t ? t.nombre : 'Seleccionar tipo...';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isOpenTipoComida = false;
    this.isOpenCentro = false;
  }

  toggleCentro(event: Event) {
    event.stopPropagation();
    this.isOpenCentro = !this.isOpenCentro;
    this.isOpenTipoComida = false;
  }

  selectCentro(id: string) {
    this.form.centroId = id;
    this.isOpenCentro = false;

    // Buscar si este centro tiene alguna solicitud activa (no entregada)
    this.api.getSolicitudes().subscribe(solicitudes => {
      const activeStates = [
        EstadoSolicitud.PENDIENTE,
        EstadoSolicitud.APROBADA,
        EstadoSolicitud.EN_PREPARACION,
        EstadoSolicitud.LISTA
      ];
      const sol = solicitudes
        .filter(s => s.centroId === id && activeStates.includes(s.estado))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (sol) {
        this.form.solicitudId = sol.id;
        this.form.cantidad = sol.cantidadSolicitada;
        this.form.registradoPor = sol.responsable;
        this.form.nota = sol.observaciones || '';
        if (sol.tipoComidaId) {
          this.form.tipoComidaId = sol.tipoComidaId;
        }
        const centro = this.centros.find(c => c.id === id);
        this.form.destino = centro ? centro.nombre : '';

        this.toast.success(`✓ Pedido #${sol.id.substring(sol.id.length - 6).toUpperCase()} vinculado automáticamente`);
      } else {
        // Limpiar para entrada limpia
        this.form.solicitudId = '';
        this.form.cantidad = null;
        this.form.nota = '';
        this.form.tipoComidaId = '';
        const centro = this.centros.find(c => c.id === id);
        this.form.destino = centro ? centro.nombre : '';
      }
    });
  }

  toggleTipoComida(event: Event) {
    event.stopPropagation();
    this.isOpenTipoComida = !this.isOpenTipoComida;
    this.isOpenCentro = false;
  }

  forzarSalidaEnabled = false;

  selectTipoComida(id: string) {
    this.form.tipoComidaId = id;
    this.isOpenTipoComida = false;
  }

  get excedido(): boolean {
    return (
      !!this.form.cantidad &&
      this.form.cantidad > this.stockDisponible &&
      !!this.form.tipoComidaId
    );
  }

  get isValid(): boolean {
    const basic = (
      !!this.form.centroId &&
      !!this.form.tipoComidaId &&
      !!this.form.cantidad &&
      this.form.cantidad > 0 &&
      !!this.form.registradoPor
    );
    if (!basic) return false;

    // Forzar salida check if stock is exceeded
    if (this.excedido) {
      return this.forzarSalidaEnabled;
    }
    return true;
  }

  verResumen() {
    if (!this.isValid) return;
    this.showSummary = true;
    this.cdr.detectChanges();
    
    // Animate the new summary card
    gsap.fromTo('.summary-card', 
      { opacity: 0, scale: 0.98, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'transform' }
    );
  }

  cancelarResumen() {
    this.showSummary = false;
    this.cdr.detectChanges();
    
    // Animate the form cards back in
    gsap.fromTo('.form-card, .summary-card', 
      { opacity: 0, scale: 0.98, y: -15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }
    );
  }

  async confirmarRegistro() {
    if (!this.isValid || this.submitting) return;

    const confirmado = await this.confirmDialog.confirm({
      title: 'Confirmar registro',
      message: '¿Deseas registrar esta salida en el sistema?',
      confirmText: 'Sí, registrar',
      cancelText: 'No',
    });
    if (!confirmado) return;

    this.submitting = true;

    this.api
      .crearMovimiento({
        tipo: TipoMovimiento.SALIDA,
        centroId: this.form.centroId,
        tipoComidaId: this.form.tipoComidaId,
        cantidad: this.form.cantidad!,
        nota: this.form.nota || undefined,
        solicitudId: this.form.solicitudId || undefined,
        registradoPor: this.form.registradoPor,
        fecha: this.form.fecha || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success('✓ Salida registrada exitosamente');

          // Generate notification based on if it was forced or not
          const foodName = this.selectedTipoComidaNombre;
          if (this.excedido) {
            this.notificationService.addNotification(
              `Alerta: Despacho forzado sin stock suficiente de ${foodName} (${this.form.cantidad} raciones) por ${this.form.registradoPor}.`,
              'warning',
              '/movimientos'
            );
          } else {
            this.notificationService.addNotification(
              `Salida registrada: ${this.form.cantidad} raciones de ${foodName} despachadas a ${this.form.destino || 'Destino'} por ${this.form.registradoPor}.`,
              'success',
              '/movimientos'
            );
          }

          this.resetForm();
          this.showSummary = false;
          this.submitting = false;
          // Reload stock info
          this.api.getResumen().subscribe({ next: (data) => (this.resumen = data) });
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Error al registrar');
          this.submitting = false;
        },
      });
  }

  private resetForm() {
    this.forzarSalidaEnabled = false;
    this.form = {
      centroId: this.form.centroId,
      tipoComidaId: '',
      cantidad: null,
      destino: '',
      nota: '',
      solicitudId: '',
      registradoPor: this.form.registradoPor,
      fecha: new Date().toISOString().split('T')[0],
    };
  }
}
