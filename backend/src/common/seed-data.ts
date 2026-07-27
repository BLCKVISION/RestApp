import {
  ICentroAcopio,
  ITipoComida,
  IMovimientoComida,
  TipoMovimiento,
  ISolicitudComida,
  EstadoSolicitud,
  IIngrediente,
  IReceta,
  IMovimientoIngrediente,
  NivelMenu,
  IRol,
  IUsuario,
} from './interfaces';

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

// ─── Roles ────────────────────────────────────────────────────────
export const SEED_ROLES: IRol[] = [
  {
    id: 'r0100000-0000-0000-0000-000000000001',
    nombre: 'Super Admin',
    descripcion: 'Acceso total al sistema',
    permisos: ['*'],
    esSistema: true,
    activo: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'r0100000-0000-0000-0000-000000000002',
    nombre: 'Operador',
    descripcion: 'Registra movimientos y resuelve requisiciones',
    permisos: ['movimientos-comida.registrar', 'movimientos-ingrediente.registrar', 'requisiciones.resolver'],
    esSistema: false,
    activo: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

// ─── Usuarios ─────────────────────────────────────────────────────
// Contraseñas: admin123 (hasheada con bcrypt)
export const SEED_USUARIOS: IUsuario[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '$2b$10$Y2/4EuiuhxFV76OVDWd6xulIup..2Y3jVFo.XPMCSLFhJZZiUJgN2',
    nombre: 'Admin',
    rolId: 'r0100000-0000-0000-0000-000000000001',
    activo: true,
  },
];

// ─── Tipos de Comida ──────────────────────────────────────────────
export const SEED_TIPOS_COMIDA: ITipoComida[] = [
  { id: 't1a00000-0000-0000-0000-000000000001', nombre: 'Desayuno', disponibleEnPortal: true, activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000002', nombre: 'Almuerzo', disponibleEnPortal: true, activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000003', nombre: 'Almuerzo Especial', activo: true, createdAt: today(), updatedAt: today() },
  { id: 't1a00000-0000-0000-0000-000000000004', nombre: 'Cena', disponibleEnPortal: true, activo: true, createdAt: today(), updatedAt: today() },
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

// ─── Ingredientes ─────────────────────────────────────────────────
export const SEED_INGREDIENTES: IIngrediente[] = [
  { id: 'ing00000-0000-0000-0000-000000000001', nombre: 'Arroz', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000002', nombre: 'Pollo', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000003', nombre: 'Carne de res', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000004', nombre: 'Caraotas', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000005', nombre: 'Pasta', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000006', nombre: 'Plátano', unidad: 'unidad', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000007', nombre: 'Huevo', unidad: 'unidad', activo: true, createdAt: today(), updatedAt: today() },
  { id: 'ing00000-0000-0000-0000-000000000008', nombre: 'Ensalada/Vegetales', unidad: 'kg', activo: true, createdAt: today(), updatedAt: today() },
];

// ─── Recetas ──────────────────────────────────────────────────────
// Todas ligadas al momento "Almuerzo" (t1a...0002) con distintos niveles.
export const SEED_RECETAS: IReceta[] = [
  {
    id: 'rec00000-0000-0000-0000-000000000001',
    nombre: 'Almuerzo Premium - Pollo con arroz',
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    nivel: NivelMenu.PREMIUM,
    personalizable: true,
    ingredientes: [
      {
        ingredienteId: 'ing00000-0000-0000-0000-000000000002', // Pollo
        cantidadPorRacion: 0.2,
        personalizable: true,
        alternativas: ['ing00000-0000-0000-0000-000000000003'], // Carne de res
      },
      { ingredienteId: 'ing00000-0000-0000-0000-000000000001', cantidadPorRacion: 0.15 }, // Arroz
      { ingredienteId: 'ing00000-0000-0000-0000-000000000008', cantidadPorRacion: 0.1 }, // Ensalada
    ],
    activo: true,
    createdAt: today(),
    updatedAt: today(),
  },
  {
    id: 'rec00000-0000-0000-0000-000000000002',
    nombre: 'Almuerzo VIP - Carne con pasta',
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    nivel: NivelMenu.VIP,
    personalizable: false,
    ingredientes: [
      { ingredienteId: 'ing00000-0000-0000-0000-000000000003', cantidadPorRacion: 0.22 }, // Carne de res
      { ingredienteId: 'ing00000-0000-0000-0000-000000000005', cantidadPorRacion: 0.18 }, // Pasta
      { ingredienteId: 'ing00000-0000-0000-0000-000000000004', cantidadPorRacion: 0.1 }, // Caraotas (stock bajo)
    ],
    activo: true,
    createdAt: today(),
    updatedAt: today(),
  },
  {
    id: 'rec00000-0000-0000-0000-000000000003',
    nombre: 'Almuerzo Platino - Pabellón',
    tipoComidaId: 't1a00000-0000-0000-0000-000000000002', // Almuerzo
    nivel: NivelMenu.PLATINO,
    personalizable: false,
    ingredientes: [
      { ingredienteId: 'ing00000-0000-0000-0000-000000000001', cantidadPorRacion: 0.15 }, // Arroz
      { ingredienteId: 'ing00000-0000-0000-0000-000000000004', cantidadPorRacion: 0.12 }, // Caraotas (stock bajo)
      { ingredienteId: 'ing00000-0000-0000-0000-000000000006', cantidadPorRacion: 1 }, // Plátano
      { ingredienteId: 'ing00000-0000-0000-0000-000000000007', cantidadPorRacion: 1 }, // Huevo
    ],
    activo: true,
    createdAt: today(),
    updatedAt: today(),
  },
];

// ─── Movimientos de Ingrediente (seed) ────────────────────────────
// Entradas dando stock suficiente a casi todos los ingredientes.
// "Caraotas" (ing...0004) queda deliberadamente con stock muy bajo (0.5 kg)
// para que dispare una requisición desde el primer arranque.
export const SEED_MOVIMIENTOS_INGREDIENTE: IMovimientoIngrediente[] = [
  {
    id: 'mvi00000-0000-0000-0000-000000000001',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000001', // Arroz
    cantidad: 50,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000002',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000002', // Pollo
    cantidad: 40,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000003',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000003', // Carne de res
    cantidad: 40,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000004',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000004', // Caraotas (stock deliberadamente bajo)
    cantidad: 0.5,
    origen: 'Compra inicial',
    nota: 'Stock bajo - requiere reabastecimiento',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000005',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000005', // Pasta
    cantidad: 45,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000006',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000006', // Plátano
    cantidad: 300,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000007',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000007', // Huevo
    cantidad: 500,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
  {
    id: 'mvi00000-0000-0000-0000-000000000008',
    tipo: TipoMovimiento.ENTRADA,
    ingredienteId: 'ing00000-0000-0000-0000-000000000008', // Ensalada/Vegetales
    cantidad: 30,
    origen: 'Compra inicial',
    registradoPor: 'Yoberlyn',
    fecha: daysAgo(2),
    createdAt: daysAgo(2),
  },
];
