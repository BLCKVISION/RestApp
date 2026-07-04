export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
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
  createdAt: string;
  updatedAt: string;
}

export interface MovimientoComida {
  id: string;
  tipo: TipoMovimiento;
  centroId?: string;
  tipoComidaId: string;
  cantidad: number;
  origen?: string;
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
