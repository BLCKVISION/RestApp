import { Injectable, NotFoundException } from '@nestjs/common';
import { ITipoComida, PaginatedResponse } from '../common/interfaces';
import { SEED_TIPOS_COMIDA } from '../common/seed-data';
import { CreateTipoComidaDto, UpdateTipoComidaDto } from './dto/tipos-comida.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/paginate';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TiposComidaService {
  private tipos: ITipoComida[] = [...SEED_TIPOS_COMIDA];

  findAll(pagination: PaginationDto = {}): ITipoComida[] | PaginatedResponse<ITipoComida> {
    const activos = this.tipos.filter((t) => t.activo);
    return paginate(activos, pagination);
  }

  findOne(id: string): ITipoComida {
    const tipo = this.tipos.find((t) => t.id === id);
    if (!tipo) throw new NotFoundException(`Tipo de comida ${id} no encontrado`);
    return tipo;
  }

  create(dto: CreateTipoComidaDto): ITipoComida {
    const nuevo: ITipoComida = {
      id: uuidv4(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tipos.push(nuevo);
    return nuevo;
  }

  update(id: string, dto: UpdateTipoComidaDto): ITipoComida {
    const tipo = this.findOne(id);
    Object.assign(tipo, dto, { updatedAt: new Date() });
    return tipo;
  }
}
