import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CustomDatepickerComponent } from '../../shared/components/custom-datepicker/custom-datepicker.component';
import {
  CentroAcopio,
  TipoComida,
  TipoMovimiento,
  ResumenInventario,
  SolicitudComida
} from '../../core/models/models';
import { ActivatedRoute } from '@angular/router';
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
  toast: { message: string; type: 'success' | 'error' } | null = null;

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

  constructor(private api: ApiService, private route: ActivatedRoute) {}

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
            if (sol.tipoComidaId) {
              this.form.tipoComidaId = sol.tipoComidaId;
            }
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    // Staggered entry animation using GSAP
    gsap.fromTo('.page__title, .page__subtitle', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );

    gsap.fromTo('.form-card', 
      { opacity: 0, scale: 0.96, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
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
  }

  toggleTipoComida(event: Event) {
    event.stopPropagation();
    this.isOpenTipoComida = !this.isOpenTipoComida;
    this.isOpenCentro = false;
  }

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
    return (
      !!this.form.centroId &&
      !!this.form.tipoComidaId &&
      !!this.form.cantidad &&
      this.form.cantidad > 0 &&
      !this.excedido &&
      !!this.form.registradoPor
    );
  }

  submit() {
    if (!this.isValid || this.submitting) return;
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
          this.showToast('✓ Salida registrada exitosamente', 'success');
          this.resetForm();
          this.submitting = false;
          // Reload stock info
          this.api.getResumen().subscribe({ next: (data) => (this.resumen = data) });
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Error al registrar', 'error');
          this.submitting = false;
        },
      });
  }

  private resetForm() {
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

  private showToast(message: string, type: 'success' | 'error') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}
