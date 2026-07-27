import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
    private readonly rolesService: RolesService,
  ) {}

  /** Construye el shape enriquecido de usuario (con rol y permisos) que consume el frontend */
  private buildUsuarioResponse(userId: string) {
    const usuario = this.usuariosService.findOne(userId);
    const rol = this.rolesService.findOne(usuario.rolId);
    return {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: { id: rol.id, nombre: rol.nombre },
      permisos: rol.permisos,
    };
  }

  async login(dto: LoginDto) {
    const user = this.usuariosService.findByUsername(dto.username);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.buildUsuarioResponse(user.id),
    };
  }

  me(userId: string) {
    return this.buildUsuarioResponse(userId);
  }
}
