export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
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
  fecha: string;
  createdAt: string;
}

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
