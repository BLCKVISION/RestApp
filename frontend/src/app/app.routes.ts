import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'solicitar',
    loadComponent: () => import('./pages/solicitud-publica/solicitud-publica.component').then(m => m.SolicitudPublicaComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'solicitudes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/solicitudes/solicitudes.component').then((m) => m.SolicitudesComponent),
  },
  {
    path: 'entrada',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/registrar-entrada/registrar-entrada.component').then((m) => m.RegistrarEntradaComponent),
  },
  {
    path: 'salida',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/registrar-salida/registrar-salida.component').then((m) => m.RegistrarSalidaComponent),
  },
  {
    path: 'movimientos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movimientos/movimientos.component').then((m) => m.MovimientosComponent),
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'configuracion',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
  },
  {
    path: 'requisiciones',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/requisiciones/requisiciones.component').then((m) => m.RequisicionesComponent),
  },
  {
    path: 'catalogo-menus',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/catalogo-menus/catalogo-menus.component').then((m) => m.CatalogoMenusComponent),
  },
  {
    path: 'roles',
    canActivate: [authGuard, permissionGuard],
    data: { permiso: 'roles.gestionar' },
    loadComponent: () => import('./pages/roles/roles.component').then((m) => m.RolesComponent),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, permissionGuard],
    data: { permiso: 'usuarios.gestionar' },
    loadComponent: () => import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
