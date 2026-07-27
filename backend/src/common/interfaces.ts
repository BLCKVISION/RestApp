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

/** Nivel del menú ofrecido en el portal público */
export enum NivelMenu {
  VIP = 'VIP',
  PREMIUM = 'PREMIUM',
  PLATINO = 'PLATINO',
}

/** Estado de una requisición de reabastecimiento */
export enum EstadoRequisicion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
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
  disponibleEnPortal?: boolean;
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
  nivel?: NivelMenu;
  recetaId?: string;
  personalizacion?: { ingredienteOriginalId: string; ingredienteSustitutoId: string }[];
  requisicionId?: string;
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

/** Interfaz base para Ingrediente */
export interface IIngrediente {
  id: string;
  nombre: string;
  unidad: string; // "kg", "g", "unidad", "litro", texto libre
  descripcion?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Ingrediente dentro de una receta */
export interface IRecetaIngrediente {
  ingredienteId: string;
  cantidadPorRacion: number;
  personalizable?: boolean;
  alternativas?: string[]; // ingredienteIds válidos como sustituto
}

/** Interfaz base para Receta (menú de plato por momento y nivel) */
export interface IReceta {
  id: string;
  nombre: string;
  tipoComidaId: string; // el "momento" (Desayuno/Almuerzo/Cena) — reutiliza catálogo de TipoComida existente
  nivel: NivelMenu;
  ingredientes: IRecetaIngrediente[];
  personalizable: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Interfaz base para Movimiento de Ingrediente */
export interface IMovimientoIngrediente {
  id: string;
  tipo: TipoMovimiento; // reutiliza el enum ya existente
  ingredienteId: string;
  cantidad: number;
  origen?: string;
  nota?: string;
  registradoPor: string;
  solicitudId?: string;
  requisicionId?: string;
  fecha: Date;
  createdAt: Date;
}

/** Item dentro de una requisición de reabastecimiento */
export interface IRequisicionItem {
  ingredienteId: string;
  cantidadRequerida: number;
  cantidadDisponible: number;
  cantidadFaltante: number;
}

/** Interfaz base para Requisición de reabastecimiento */
export interface IRequisicion {
  id: string;
  solicitudId: string;
  recetaId: string;
  items: IRequisicionItem[];
  estado: EstadoRequisicion;
  resueltoPor?: string;
  notaResolucion?: string;
  createdAt: Date;
  resueltoAt?: Date;
}

/** Interfaz base para Rol */
export interface IRol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: string[]; // claves del catálogo, o ['*'] para acceso total
  esSistema: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Interfaz base para Usuario */
export interface IUsuario {
  id: string;
  username: string;
  passwordHash: string;
  nombre: string;
  rolId: string;
  activo: boolean;
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
