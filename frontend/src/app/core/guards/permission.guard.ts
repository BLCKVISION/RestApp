import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permisoRequerido = route.data?.['permiso'] as string | undefined;
  if (!permisoRequerido || auth.hasPermission(permisoRequerido)) {
    return true;
  }
  return router.parseUrl('/dashboard');
};
