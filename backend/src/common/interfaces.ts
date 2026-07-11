/** Tipo de movimiento de comida */
export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

/** Estado de la solicitud de comida */
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTA = 'LISTA',
  ENTREGADA = 'ENTREGADA',
}

/** Interfaz base para Centro de Acopio */
export interface ICentroAcopio {
  id: string;
  nombre: string;
  ubicacion: string;
  operador: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Interfaz base para Tipo de Comida */
export interface ITipoComida {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Interfaz base para Solicitud de Comida */
export interface ISolicitudComida {
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
  fechaSolicitada: Date;
  createdAt: Date;
}

/** Interfaz base para Movimiento de Comida */
export interface IMovimientoComida {
  id: string;
  tipo: TipoMovimiento;
  centroId?: string;
  tipoComidaId: string;
  cantidad: number;
  origen?: string;
  nota?: string;
  registradoPor: string;
  solicitudId?: string;
  fecha: Date;
  createdAt: Date;
}

/** Respuesta paginada genérica */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Resumen de inventario/operativo para el dashboard */
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
  
  solicitudesRecientes: ISolicitudComida[];
  solicitudesProgramadas: ISolicitudComida[];
  movimientosRecientes: IMovimientoComida[];
}
