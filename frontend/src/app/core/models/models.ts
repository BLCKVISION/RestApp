export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

export enum NivelMenu {
  VIP = 'VIP',
  PREMIUM = 'PREMIUM',
  PLATINO = 'PLATINO',
}

export enum EstadoRequisicion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
}

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTA = 'LISTA',
  ENTREGADA = 'ENTREGADA',
}

export interface CentroAcopio {
  id: string;
  nombre: string;
  ubicacion: string;
  operador: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TipoComida {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  disponibleEnPortal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  unidad: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecetaIngrediente {
  ingredienteId: string;
  cantidadPorRacion: number;
  personalizable?: boolean;
  alternativas?: string[];
}

export interface Receta {
  id: string;
  nombre: string;
  tipoComidaId: string;
  nivel: NivelMenu;
  ingredientes: RecetaIngrediente[];
  personalizable: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequisicionItem {
  ingredienteId: string;
  cantidadRequerida: number;
  cantidadDisponible: number;
  cantidadFaltante: number;
}

export interface Requisicion {
  id: string;
  solicitudId: string;
  recetaId: string;
  items: RequisicionItem[];
  estado: EstadoRequisicion;
  resueltoPor?: string;
  notaResolucion?: string;
  createdAt: string;
  resueltoAt?: string;
}

export interface MovimientoComida {
  id: string;
  tipo: TipoMovimiento;
  centroId?: string;
  tipoComidaId: string;
  cantidad: number;
  origen?: string;
  destino?: string;
  nota?: string;
  registradoPor: string;
  solicitudId?: string;
  fecha: string;
  createdAt: string;
}

export interface SolicitudComida {
  id: string;
  centroId: string;
  cantidadSolicitada: number;
  tipoComidaId?: string;
  horaEntrega?: string;
  responsable: string;
  estado: EstadoSolicitud;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  observaciones?: string;
  notasInternas?: string;
  ubicacion?: string;
  nivel?: NivelMenu;
  recetaId?: string;
  personalizacion?: { ingredienteOriginalId: string; ingredienteSustitutoId: string }[];
  requisicionId?: string;
  fechaSolicitada: string;
  createdAt: string;
}

export interface ResumenInventario {
  pedidosPendientes: number;
  pedidosProgramadosHoy: number;
  salidasHoy: number;
  totalInventario: number;
  metaMensualInventario: number;
  pctMetaMensual: number;
  pctPendientes: number;
  pctProgramados: number;
  pctSalidas: number;
  pctInventario: number;

  inventarioPorTipo: {
    tipoComidaId: string;
    tipoComida: string;
    stockActual: number;
    entradasHoy: number;
    salidasHoy: number;
  }[];
  
  solicitudesRecientes: SolicitudComida[];
  solicitudesProgramadas: SolicitudComida[];
  movimientosRecientes: MovimientoComida[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatosGrafico {
  label: string;
  entradas: number;
  salidas: number;
}

export interface DistribucionCentro {
  centroId: string;
  centro: string;
  ubicacion: string;
  operador: string;
  porTipo: {
    tipoComida: string;
    cantidad: number;
  }[];
}

export interface PermisoCatalogo {
  clave: string;
  etiqueta: string;
  modulo: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: string[];
  esSistema: boolean;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rolId: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
