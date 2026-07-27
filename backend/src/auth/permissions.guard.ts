import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from './permission.decorator';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permisoRequerido = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    if (!permisoRequerido) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) throw new UnauthorizedException();

    let usuario;
    try {
      usuario = this.usuariosService.findOne(userId);
    } catch {
      throw new UnauthorizedException();
    }

    const rol = this.rolesService.findOne(usuario.rolId);
    if (rol.permisos.includes('*') || rol.permisos.includes(permisoRequerido)) {
      return true;
    }
    throw new ForbiddenException(`Requiere el permiso: ${permisoRequerido}`);
  }
}
