import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { USERS } from './users';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = USERS.find((u) => u.username === dto.username);
    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, username: user.username, nombre: user.nombre, role: user.role },
    };
  }
}
