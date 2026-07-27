import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Inject,
  forwardRef,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RolesService } from '../roles/roles.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuarios.dto';
import { RequirePermission } from '../auth/permission.decorator';

/** Permisos que, de perderse por completo, dejarían al sistema sin administración */
const PERMISOS_ADMINISTRACION = ['usuarios.gestionar', 'roles.gestionar'];

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
  ) {}

  private rolTieneAdministracion(rolId: string): boolean {
    const rol = this.rolesService.findOne(rolId);
    return rol.permisos.includes('*') || rol.permisos.some((p) => PERMISOS_ADMINISTRACION.includes(p));
  }

  /** Lanza ConflictException si dar de baja/eliminar a `id` deja al sistema sin administradores */
  private verificarNoUltimoAdmin(id: string) {
    const objetivo = this.usuariosService.findOne(id);
    if (!this.rolTieneAdministracion(objetivo.rolId)) return;

    const otrosAdminsActivos = this.usuariosService
      .findAll()
      .filter((u) => u.id !== id && u.activo && this.rolTieneAdministracion(u.rolId));

    if (otrosAdminsActivos.length === 0) {
      throw new ConflictException('No puede quedar el sistema sin administradores');
    }
  }

  @RequirePermission('usuarios.gestionar')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @RequirePermission('usuarios.gestionar')
  @Get(':id')
  findOne(@Param('id') id: string) {
    const { passwordHash, ...safe } = this.usuariosService.findOne(id);
    return safe;
  }

  @RequirePermission('usuarios.gestionar')
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @RequirePermission('usuarios.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: any) {
    if (req.user?.userId === id && dto.rolId !== undefined) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }
    if (dto.activo === false) {
      this.verificarNoUltimoAdmin(id);
    }
    return this.usuariosService.update(id, dto);
  }

  @RequirePermission('usuarios.gestionar')
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.verificarNoUltimoAdmin(id);
    return this.usuariosService.remove(id);
  }
}
