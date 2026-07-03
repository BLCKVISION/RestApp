import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
];
