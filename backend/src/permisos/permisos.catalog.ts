export interface IPermisoCatalogo {
  clave: string;
  etiqueta: string;
  modulo: string;
}

export const CATALOGO_PERMISOS: IPermisoCatalogo[] = [
  { clave: 'centros-acopio.gestionar', etiqueta: 'Crear y editar centros de acopio', modulo: 'centros-acopio' },
  { clave: 'tipos-comida.gestionar', etiqueta: 'Crear y editar tipos de comida', modulo: 'tipos-comida' },
  { clave: 'movimientos-comida.registrar', etiqueta: 'Registrar entradas y salidas de comida', modulo: 'movimientos-comida' },
  { clave: 'solicitudes.gestionar', etiqueta: 'Editar y cambiar estado de solicitudes', modulo: 'solicitudes' },
  { clave: 'ingredientes.gestionar', etiqueta: 'Crear y editar ingredientes', modulo: 'ingredientes' },
  { clave: 'recetas.gestionar', etiqueta: 'Crear y editar recetas del catálogo de menús', modulo: 'recetas' },
  { clave: 'movimientos-ingrediente.registrar', etiqueta: 'Registrar movimientos de ingredientes', modulo: 'movimientos-ingrediente' },
  { clave: 'requisiciones.resolver', etiqueta: 'Aceptar o rechazar requisiciones de reabastecimiento', modulo: 'requisiciones' },
  { clave: 'roles.gestionar', etiqueta: 'Crear, editar y eliminar roles', modulo: 'roles' },
  { clave: 'usuarios.gestionar', etiqueta: 'Crear, editar y eliminar usuarios', modulo: 'usuarios' },
];
