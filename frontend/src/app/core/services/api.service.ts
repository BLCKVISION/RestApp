import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CentroAcopio,
  TipoComida,
  MovimientoComida,
  ResumenInventario,
  PaginatedResponse,
  TipoMovimiento,
  DatosSemana,
  DistribucionCentro,
} from '../models/models';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ─── Centros de Acopio ──────────────────────────────────────────
  getCentros(): Observable<CentroAcopio[]> {
    return this.http.get<CentroAcopio[]>(`${API}/centros-acopio`);
  }

  // ─── Tipos de Comida ────────────────────────────────────────────
  getTiposComida(): Observable<TipoComida[]> {
    return this.http.get<TipoComida[]>(`${API}/tipos-comida`);
  }

  // ─── Movimientos ────────────────────────────────────────────────
  crearMovimiento(data: {
    tipo: TipoMovimiento;
    centroId?: string;
    tipoComidaId: string;
    cantidad: number;
    origen?: string;
    nota?: string;
    registradoPor: string;
    fecha?: string;
  }): Observable<MovimientoComida> {
    return this.http.post<MovimientoComida>(`${API}/movimientos`, data);
  }

  getMovimientos(filters?: {
    tipo?: TipoMovimiento;
    centroId?: string;
    tipoComidaId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<MovimientoComida>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }
    return this.http.get<PaginatedResponse<MovimientoComida>>(`${API}/movimientos`, { params });
  }

  // ─── Inventario / Dashboard ─────────────────────────────────────
  getResumen(): Observable<ResumenInventario> {
    return this.http.get<ResumenInventario>(`${API}/inventario/resumen`);
  }

  getMovimientosSemana(): Observable<DatosSemana[]> {
    return this.http.get<DatosSemana[]>(`${API}/inventario/semana`);
  }

  getDistribucionPorCentro(): Observable<DistribucionCentro[]> {
    return this.http.get<DistribucionCentro[]>(`${API}/inventario/distribucion`);
  }
}
