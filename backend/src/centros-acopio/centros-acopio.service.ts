import { Injectable, NotFoundException } from '@nestjs/common';
import { ICentroAcopio, PaginatedResponse } from '../common/interfaces';
import { SEED_CENTROS } from '../common/seed-data';
import { CreateCentroAcopioDto, UpdateCentroAcopioDto } from './dto/centros-acopio.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/paginate';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CentrosAcopioService {
  // In-memory store — será reemplazado por TypeORM repo
  private centros: ICentroAcopio[] = [...SEED_CENTROS];

  findAll(pagination: PaginationDto = {}): ICentroAcopio[] | PaginatedResponse<ICentroAcopio> {
    const activos = this.centros.filter((c) => c.activo);
    return paginate(activos, pagination);
  }

  getAllRaw(): ICentroAcopio[] {
    return this.centros;
  }

  findOne(id: string): ICentroAcopio {
    const centro = this.centros.find((c) => c.id === id);
    if (!centro) throw new NotFoundException(`Centro ${id} no encontrado`);
    return centro;
  }

  findOrCreateByName(nombre: string, ubicacion?: string): ICentroAcopio {
    const trimmed = nombre.trim();
    // Buscar por nombre exacto (insensitivo a mayúsculas/minúsculas)
    let centro = this.centros.find(
      (c) => c.nombre.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!centro) {
      // Si el nombre parece un UUID, intentar buscar por ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(trimmed)) {
        centro = this.centros.find((c) => c.id === trimmed);
      }
    }
    if (!centro) {
      centro = this.create({
        nombre: trimmed,
        ubicacion: ubicacion || 'Auto-registrado',
        operador: 'Auto-registrado',
      });
    } else if (ubicacion && (centro.ubicacion === 'Auto-registrado' || !centro.ubicacion)) {
      centro.ubicacion = ubicacion;
    }
    return centro;
  }

  create(dto: CreateCentroAcopioDto): ICentroAcopio {
    const nuevo: ICentroAcopio = {
      id: uuidv4(),
      nombre: dto.nombre,
      ubicacion: dto.ubicacion || 'Auto-registrado',
      operador: dto.operador || 'Auto-registrado',
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
