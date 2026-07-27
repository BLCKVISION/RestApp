import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { IRol, PaginatedResponse } from '../common/interfaces';
import { SEED_ROLES } from '../common/seed-data';
import { CreateRolDto, UpdateRolDto } from './dto/roles.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/paginate';
import { CATALOGO_PERMISOS } from '../permisos/permisos.catalog';
import { UsuariosService } from '../usuarios/usuarios.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RolesService {
  private roles: IRol[] = [...SEED_ROLES];

  constructor(
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService,
  ) {}

  findAll(pagination: PaginationDto = {}): IRol[] | PaginatedResponse<IRol> {
    const activos = this.roles.filter((r) => r.activo);
    return paginate(activos, pagination);
  }

  findOne(id: string): IRol {
    const rol = this.roles.find((r) => r.id === id);
    if (!rol) throw new NotFoundException(`Rol ${id} no encontrado`);
    return rol;
  }

  getPermisosDisponibles() {
    return CATALOGO_PERMISOS;
  }

  private validarPermisos(permisos: string[]) {
    const clavesValidas = new Set(CATALOGO_PERMISOS.map((p) => p.clave));
    const invalido = permisos.find((p) => p !== '*' && !clavesValidas.has(p));
    if (invalido) {
      throw new BadRequestException(`Permiso inválido: ${invalido}`);
    }
  }

  create(dto: CreateRolDto): IRol {
    this.validarPermisos(dto.permisos);
    const nuevo: IRol = {
      id: uuidv4(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      permisos: dto.permisos,
      esSistema: false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.push(nuevo);
    return nuevo;
  }

  update(id: string, dto: UpdateRolDto): IRol {
    const rol = this.findOne(id);
    if (rol.esSistema && dto.permisos !== undefined) {
      throw new ForbiddenException('No se pueden modificar los permisos de un rol de sistema');
    }
    if (dto.permisos !== undefined) {
      this.validarPermisos(dto.permisos);
    }
    Object.assign(rol, dto, { updatedAt: new Date() });
    return rol;
  }

  remove(id: string): IRol {
    const rol = this.findOne(id);
    if (rol.esSistema) {
      throw new ForbiddenException('No se puede eliminar un rol de sistema');
    }
    if (this.usuariosService.contarActivosPorRol(id) > 0) {
      throw new ConflictException('No se puede eliminar un rol con usuarios asignados');
    }
    rol.activo = false;
    rol.updatedAt = new Date();
    return rol;
  }
}
