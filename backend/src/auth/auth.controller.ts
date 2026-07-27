import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/login – Autenticación, devuelve JWT */
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** GET /api/auth/me – Usuario autenticado actual (con rol y permisos resueltos) */
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.userId);
  }
}
