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
  Ingrediente,
  Receta,
  Requisicion,
  NivelMenu,
  EstadoRequisicion,
  Rol,
  Usuario,
  PermisoCatalogo,
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

  // ─── Ingredientes ───────────────────────────────────────────────
  getIngredientes(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(`${API}/ingredientes`);
  }

  crearIngrediente(data: any): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(`${API}/ingredientes`, data);
  }

  actualizarIngrediente(id: string, data: any): Observable<Ingrediente> {
    return this.http.patch<Ingrediente>(`${API}/ingredientes/${id}`, data);
  }

  // ─── Recetas ────────────────────────────────────────────────────
  getRecetas(filters?: { tipoComidaId?: string; nivel?: NivelMenu }): Observable<Receta[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }
    return this.http.get<Receta[]>(`${API}/recetas`, { params });
  }

  getReceta(id: string): Observable<Receta> {
    return this.http.get<Receta>(`${API}/recetas/${id}`);
  }

  crearReceta(data: any): Observable<Receta> {
    return this.http.post<Receta>(`${API}/recetas`, data);
  }

  actualizarReceta(id: string, data: any): Observable<Receta> {
    return this.http.patch<Receta>(`${API}/recetas/${id}`, data);
  }

  // ─── Requisiciones ──────────────────────────────────────────────
  getRequisiciones(filters?: { estado?: EstadoRequisicion }): Observable<Requisicion[]> {
    let params = new HttpParams();
    if (filters?.estado) {
      params = params.set('estado', String(filters.estado));
    }
    return this.http.get<Requisicion[]>(`${API}/requisiciones`, { params });
  }

  resolverRequisicion(
    id: string,
    data: { estado: EstadoRequisicion; resueltoPor: string; nota?: string },
  ): Observable<Requisicion> {
    return this.http.patch<Requisicion>(`${API}/requisiciones/${id}/estado`, data);
  }

  // ─── Roles ──────────────────────────────────────────────────────
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${API}/roles`);
  }

  getRol(id: string): Observable<Rol> {
    return this.http.get<Rol>(`${API}/roles/${id}`);
  }

  getPermisosDisponibles(): Observable<PermisoCatalogo[]> {
    return this.http.get<PermisoCatalogo[]>(`${API}/roles/permisos-disponibles`);
  }

  crearRol(data: any): Observable<Rol> {
    return this.http.post<Rol>(`${API}/roles`, data);
  }

  actualizarRol(id: string, data: any): Observable<Rol> {
    return this.http.patch<Rol>(`${API}/roles/${id}`, data);
  }

  eliminarRol(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/roles/${id}`);
  }

  // ─── Usuarios ───────────────────────────────────────────────────
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API}/usuarios`);
  }

  crearUsuario(data: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${API}/usuarios`, data);
  }

  actualizarUsuario(id: string, data: any): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API}/usuarios/${id}`, data);
  }

  eliminarUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/usuarios/${id}`);
  }
}
