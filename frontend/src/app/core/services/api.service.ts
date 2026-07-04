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
  DatosGrafico,
  DistribucionCentro,
  SolicitudComida,
  EstadoSolicitud,
} from '../models/models';
import { API_BASE_URL } from '../api.config';

const API = API_BASE_URL;

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
    solicitudId?: string;
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

  getDatosGrafico(rango: string = 'semanal'): Observable<DatosGrafico[]> {
    return this.http.get<DatosGrafico[]>(`${API}/inventario/grafico?rango=${rango}`);
  }

  getDistribucionPorCentro(): Observable<DistribucionCentro[]> {
    return this.http.get<DistribucionCentro[]>(`${API}/inventario/distribucion`);
  }

  // ─── Solicitudes ────────────────────────────────────────────────
  getSolicitudes(): Observable<SolicitudComida[]> {
    return this.http.get<SolicitudComida[]>(`${API}/solicitudes`);
  }

  crearSolicitud(data: any): Observable<SolicitudComida> {
    return this.http.post<SolicitudComida>(`${API}/solicitudes`, data);
  }

  updateSolicitud(id: string, data: any): Observable<SolicitudComida> {
    return this.http.patch<SolicitudComida>(`${API}/solicitudes/${id}`, data);
  }

  updateSolicitudEstado(id: string, estado: EstadoSolicitud): Observable<SolicitudComida> {
    return this.http.patch<SolicitudComida>(`${API}/solicitudes/${id}/estado`, { estado });
  }
}
