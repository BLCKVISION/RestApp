import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
  MovimientoComida,
  TipoMovimiento,
  CentroAcopio,
  TipoComida,
  PaginatedResponse,
} from '../../core/models/models';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
})
export class MovimientosComponent implements OnInit {
  movimientos: MovimientoComida[] = [];
  centros: CentroAcopio[] = [];
  tiposComida: TipoComida[] = [];
  total = 0;
  page = 1;
  limit = 15;
  totalPages = 0;
  loading = true;

  filters = {
    tipo: '' as TipoMovimiento | '',
    centroId: '',
    tipoComidaId: '',
    fechaDesde: '',
    fechaHasta: '',
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCentros().subscribe({ next: (data) => (this.centros = data) });
    this.api.getTiposComida().subscribe({ next: (data) => (this.tiposComida = data) });
    this.loadMovimientos();
  }

  loadMovimientos() {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.filters.tipo) params.tipo = this.filters.tipo;
    if (this.filters.centroId) params.centroId = this.filters.centroId;
    if (this.filters.tipoComidaId) params.tipoComidaId = this.filters.tipoComidaId;
    if (this.filters.fechaDesde) params.fechaDesde = this.filters.fechaDesde;
    if (this.filters.fechaHasta) params.fechaHasta = this.filters.fechaHasta;

    this.api.getMovimientos(params).subscribe({
      next: (res: PaginatedResponse<MovimientoComida>) => {
        this.movimientos = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => (this.loading = false),
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
}
