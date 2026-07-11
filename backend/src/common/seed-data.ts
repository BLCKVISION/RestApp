import { ICentroAcopio, ITipoComida, IMovimientoComida, TipoMovimiento, ISolicitudComida, EstadoSolicitud } from './interfaces';

// ─── Centros de Acopio ────────────────────────────────────────────
export const SEED_CENTROS: ICentroAcopio[] = [
  {
    id: 'c1a00000-0000-0000-0000-000000000001',
    nombre: 'Centro La Esperanza',
    ubicacion: 'Av. Principal, Sector La Esperanza, Valencia',
    operador: 'Carlos Mendoza',
    activo: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'c1a00000-0000-0000-0000-000000000002',
    nombre: 'Centro San José',
    ubicacion: 'Calle 5, Barrio San José, Maracay',
    operador: 'María Alejandra Ríos',
    activo: true,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
];

// ─── Tipos de Comida ──────────────────────────────────────────────
export const SEED_TIPOS_COMIDA: ITipoComida[] = [
  { id: 't1a00000-0000-0000-0000-000000000001', nombre: 'Desayuno', activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000002', nombre: 'Almuerzo', activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000003', nombre: 'Almuerzo Especial', activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000004', nombre: 'Cena', activo: true, createdAt: today(), updatedAt: today() },
];

// ─── Helper: generar fechas relativas a hoy ───────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function today(): Date {
  const d = new Date();
  d.setHours(8 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

// ─── Solicitudes de Comida (seed) ─────────────────────────────────
export const SEED_SOLICITUDES: ISolicitudComida[] = [
  {
    id: 'sol00000-0000-0000-0000-000000000001',
    centroId: 'c1a00000-0000-0000-0000-000000000001',
    cantidadSolicitada: 120,
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    horaEntrega: '12:00 PM',
    responsable: 'Carlos Mendoza',
    estado: EstadoSolicitud.PENDIENTE,
    observaciones: 'Llamar al llegar',
    fechaSolicitada: today(),
    createdAt: daysAgo(1),
  },
  {
    id: 'sol00000-0000-0000-0000-000000000002',
    centroId: 'c1a00000-0000-0000-0000-000000000002',
    cantidadSolicitada: 80,
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    horaEntrega: '01:00 PM',
    responsable: 'María Alejandra Ríos',
    estado: EstadoSolicitud.EN_PREPARACION,
    fechaSolicitada: today(),
    createdAt: daysAgo(1),
  },
  {
    id: 'sol00000-0000-0000-0000-000000000003',
    centroId: 'c1a00000-0000-0000-0000-000000000001',
    cantidadSolicitada: 40,
    tipoComidaId: 't1a00000-0000-0000-0000-000000000003', // Almuerzo Especial
    horaEntrega: '12:30 PM',
    responsable: 'Carlos Mendoza',
    estado: EstadoSolicitud.LISTA,
    fechaSolicitada: today(),
    createdAt: daysAgo(1),
  },
];

// ─── Movimientos de Comida (seed) ─────────────────────────────────
export const SEED_MOVIMIENTOS: IMovimientoComida[] = [
  {
    id: 'mv000000-0000-0000-0000-000000000001',
    tipo: TipoMovimiento.ENTRADA,
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    cantidad: 200,
    origen: 'Donación',
    nota: 'Donación de empresa local',
    registradoPor: 'Yoberlyn',
    fecha: today(),
    createdAt: today(),
  },
  {
    id: 'mv000000-0000-0000-0000-000000000002',
    tipo: TipoMovimiento.ENTRADA,
    tipoComidaId: 't1a00000-0000-0000-0000-000000000003', // Almuerzo Especial
    cantidad: 150,
    origen: 'Producción',
    nota: 'Cocina central',
    registradoPor: 'Alejandro',
    fecha: today(),
    createdAt: today(),
  },
  {
    id: 'mv000000-0000-0000-0000-000000000003',
    tipo: TipoMovimiento.SALIDA,
    centroId: 'c1a00000-0000-0000-0000-000000000001',
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    cantidad: 80,
    registradoPor: 'Yoberlyn',
    fecha: today(),
    createdAt: today(),
  },
];
