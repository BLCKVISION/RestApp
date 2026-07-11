import { Component, OnInit, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CustomDatepickerComponent } from '../../shared/components/custom-datepicker/custom-datepicker.component';
import {
  MovimientoComida,
  TipoMovimiento,
  CentroAcopio,
  TipoComida,
  PaginatedResponse,
} from '../../core/models/models';

declare const gsap: any;

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomDatepickerComponent],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
})
export class MovimientosComponent implements OnInit, AfterViewInit {
  movimientos: MovimientoComida[] = [];
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  total = 0;
  page = 1;
  limit = 15;
  totalPages = 0;
  loading = true;
  overallMovimientos: MovimientoComida[] = [];

  filters = {
    tipo: '' as TipoMovimiento | '',
    centroId: '',
    tipoComidaId: '',
    fechaDesde: '',
    fechaHasta: '',
  };

  isOpenTipo = false;
  isOpenCentro = false;
  isOpenComida = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isOpenTipo = false;
    this.isOpenCentro = false;
    this.isOpenComida = false;
  }

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: (data) => (this.centros = data) });
    this.api.getTiposComida().subscribe({ next: (data) => (this.tiposComida = data) });
    this.loadMovimientos();
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

  loadMovimientos() {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    const allParams: any = { limit: 10000 };

    if (this.filters.tipo) { params.tipo = this.filters.tipo; allParams.tipo = this.filters.tipo; }
    if (this.filters.centroId) { params.centroId = this.filters.centroId; allParams.centroId = this.filters.centroId; }
    if (this.filters.tipoComidaId) { params.tipoComidaId = this.filters.tipoComidaId; allParams.tipoComidaId = this.filters.tipoComidaId; }
    if (this.filters.fechaDesde) { params.fechaDesde = this.filters.fechaDesde; allParams.fechaDesde = this.filters.fechaDesde; }
    if (this.filters.fechaHasta) { params.fechaHasta = this.filters.fechaHasta; allParams.fechaHasta = this.filters.fechaHasta; }

    this.api.getMovimientos(params).subscribe({
      next: (res: PaginatedResponse<MovimientoComida>) => {
        this.movimientos = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cdr.detectChanges(); // Ensure DOM has rendered the cards/tables before starting GSAP

        // Stagger KPI cards and table rows - slowed down to be premium and highly visible
        setTimeout(() => {
          gsap.fromTo('.mov-kpi-card', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.0, stagger: 0.18, ease: 'power3.out', clearProps: 'transform' }
          );
          gsap.fromTo('.filters-card', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform', delay: 0.1 }
          );
          gsap.fromTo('.table-card', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', clearProps: 'transform', delay: 0.2 }
          );
          gsap.fromTo('.table-card tbody tr', 
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.4 }
          );
        }, 150);
      },
      error: () => (this.loading = false),
    });

    // Fetch overall match without pagination limit to calculate totals correctly
    this.api.getMovimientos(allParams).subscribe({
      next: (res) => {
        this.overallMovimientos = res.data;
      }
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadMovimientos();
  }

  clearFilters() {
    this.filters = { tipo: '', centroId: '', tipoComidaId: '', fechaDesde: '', fechaHasta: '' };
    this.page = 1;
    this.loadMovimientos();
  }

  // --- Custom Select Logic ---
  get selectedTipoNombre(): string {
    switch(this.filters.tipo) {
      case TipoMovimiento.ENTRADA: return 'Entrada';
      case TipoMovimiento.SALIDA: return 'Salida';
      default: return 'Todos';
    }
  }

  get selectedCentroFiltroNombre(): string {
    if (!this.filters.centroId) return 'Todos';
    const c = this.centros.find(x => x.id === this.filters.centroId);
    return c ? c.nombre : 'Todos';
  }

  get selectedComidaFiltroNombre(): string {
    if (!this.filters.tipoComidaId) return 'Todos';
    const t = this.tiposComida.find(x => x.id === this.filters.tipoComidaId);
    return t ? t.nombre : 'Todos';
  }

  toggleTipo(event: Event) {
    event.stopPropagation();
    this.isOpenTipo = !this.isOpenTipo;
    this.isOpenCentro = false;
    this.isOpenComida = false;
  }

  selectTipo(val: any) {
    this.filters.tipo = val;
    this.isOpenTipo = false;
    this.applyFilters();
  }

  toggleCentro(event: Event) {
    event.stopPropagation();
    this.isOpenCentro = !this.isOpenCentro;
    this.isOpenTipo = false;
    this.isOpenComida = false;
  }

  selectCentro(val: string) {
    this.filters.centroId = val;
    this.isOpenCentro = false;
    this.applyFilters();
  }

  toggleComida(event: Event) {
    event.stopPropagation();
    this.isOpenComida = !this.isOpenComida;
    this.isOpenTipo = false;
    this.isOpenCentro = false;
  }

  selectComida(val: string) {
    this.filters.tipoComidaId = val;
    this.isOpenComida = false;
    this.applyFilters();
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.loadMovimientos();
    }
  }

  getCentroNombre(id?: string): string {
    if (!id) return '—';
    const c = this.centros.find((c) => c.id === id);
    return c ? c.nombre : '—';
  }

  getTipoComidaNombre(id: string): string {
    const t = this.tiposComida.find((t) => t.id === id);
    return t ? t.nombre : '—';
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-VE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get totalEntradas(): number {
    return this.overallMovimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((acc, m) => acc + m.cantidad, 0);
  }

  get totalSalidas(): number {
    return this.overallMovimientos
      .filter(m => m.tipo === 'SALIDA')
      .reduce((acc, m) => acc + m.cantidad, 0);
  }

  get saldoNeto(): number {
    return this.totalEntradas - this.totalSalidas;
  }
}
