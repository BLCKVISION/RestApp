import { Injectable, NotFoundException } from '@nestjs/common';
import { ICentroAcopio } from '../common/interfaces';
import { SEED_CENTROS } from '../common/seed-data';
import { CreateCentroAcopioDto, UpdateCentroAcopioDto } from './dto/centros-acopio.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CentrosAcopioService {
  // In-memory store — será reemplazado por TypeORM repo
  private centros: ICentroAcopio[] = [...SEED_CENTROS];

  findAll(): ICentroAcopio[] {
    return this.centros.filter((c) => c.activo);
  }

  findOne(id: string): ICentroAcopio {
    const centro = this.centros.find((c) => c.id === id);
    if (!centro) throw new NotFoundException(`Centro ${id} no encontrado`);
    return centro;
  }

  create(dto: CreateCentroAcopioDto): ICentroAcopio {
    const nuevo: ICentroAcopio = {
      id: uuidv4(),
      nombre: dto.nombre,
      ubicacion: dto.ubicacion,
      operador: dto.operador,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.centros.push(nuevo);
    return nuevo;
  }

  update(id: string, dto: UpdateCentroAcopioDto): ICentroAcopio {
    const centro = this.findOne(id);
    Object.assign(centro, dto, { updatedAt: new Date() });
    return centro;
  }
}
