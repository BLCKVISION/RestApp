import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUsuario } from '../common/interfaces';
import { SEED_USUARIOS } from '../common/seed-data';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuarios.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsuariosService {
  private usuarios: IUsuario[] = [...SEED_USUARIOS];

  /** Listado seguro para la UI — nunca expone passwordHash */
  findAll(): Omit<IUsuario, 'passwordHash'>[] {
    return this.usuarios.map(({ passwordHash, ...safe }) => safe);
  }

  /** Uso interno (AuthService, guards) — incluye passwordHash */
  findOne(id: string): IUsuario {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  /** Uso interno para login — incluye passwordHash, no lanza si no existe */
  findByUsername(username: string): IUsuario | undefined {
    return this.usuarios.find((u) => u.username === username);
  }

  contarActivosPorRol(rolId: string): number {
    return this.usuarios.filter((u) => u.activo && u.rolId === rolId).length;
  }

  create(dto: CreateUsuarioDto): Omit<IUsuario, 'passwordHash'> {
    // Nota: no se valida aquí que dto.rolId exista en RolesService para evitar
    // un ciclo de módulos (RolesModule ya importa UsuariosModule). Si el rolId
    // es inválido, el usuario simplemente no resolverá permisos en el guard.
    const nuevo: IUsuario = {
      id: uuidv4(),
      username: dto.username,
      passwordHash: bcrypt.hashSync(dto.password, 10),
      nombre: dto.nombre,
      rolId: dto.rolId,
      activo: true,
    };
    this.usuarios.push(nuevo);
    const { passwordHash, ...safe } = nuevo;
    return safe;
  }

  update(id: string, dto: UpdateUsuarioDto): Omit<IUsuario, 'passwordHash'> {
    const usuario = this.findOne(id);
    const { password, ...resto } = dto;
    Object.assign(usuario, resto);
    if (password) {
      usuario.passwordHash = bcrypt.hashSync(password, 10);
    }
    const { passwordHash, ...safe } = usuario;
    return safe;
  }

  remove(id: string): Omit<IUsuario, 'passwordHash'> {
    const usuario = this.findOne(id);
    usuario.activo = false;
    const { passwordHash, ...safe } = usuario;
    return safe;
  }
}
