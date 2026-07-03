/** Tipo de movimiento de comida */
export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
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

/** Resumen de inventario para el dashboard */
export interface ResumenInventario {
  inventarioPorTipo: {
    tipoComidaId: string;
    tipoComida: string;
    stockActual: number;
    entradasHoy: number;
    salidasHoy: number;
  }[];
  totalInventario: number;
  entradasHoy: number;
  salidasHoy: number;
  pctEntradas: number;
  pctSalidas: number;
  pctVariedades: number;
  pctStock: number;
  movimientosRecientes: IMovimientoComida[];
}
