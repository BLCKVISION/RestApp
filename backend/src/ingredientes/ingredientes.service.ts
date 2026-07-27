import { Injectable, NotFoundException } from '@nestjs/common';
import { IIngrediente, PaginatedResponse } from '../common/interfaces';
import { SEED_INGREDIENTES } from '../common/seed-data';
import { CreateIngredienteDto, UpdateIngredienteDto } from './dto/ingredientes.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/paginate';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IngredientesService {
  private ingredientes: IIngrediente[] = [...SEED_INGREDIENTES];

  findAll(pagination: PaginationDto = {}): IIngrediente[] | PaginatedResponse<IIngrediente> {
    const activos = this.ingredientes.filter((i) => i.activo);
    return paginate(activos, pagination);
  }

  findOne(id: string): IIngrediente {
    const ingrediente = this.ingredientes.find((i) => i.id === id);
    if (!ingrediente) throw new NotFoundException(`Ingrediente ${id} no encontrado`);
    return ingrediente;
  }

  create(dto: CreateIngredienteDto): IIngrediente {
    const nuevo: IIngrediente = {
      id: uuidv4(),
      nombre: dto.nombre,
      unidad: dto.unidad,
      descripcion: dto.descripcion,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ingredientes.push(nuevo);
    return nuevo;
  }

  update(id: string, dto: UpdateIngredienteDto): IIngrediente {
    const ingrediente = this.findOne(id);
    Object.assign(ingrediente, dto, { updatedAt: new Date() });
    return ingrediente;
  }
}
