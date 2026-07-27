import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permiso: string) => SetMetadata(PERMISSION_KEY, permiso);
