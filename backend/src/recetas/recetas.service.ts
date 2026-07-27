import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IReceta, IRecetaIngrediente, NivelMenu } from '../common/interfaces';
import { SEED_RECETAS } from '../common/seed-data';
import { CreateRecetaDto, UpdateRecetaDto } from './dto/recetas.dto';
import { IngredientesService } from '../ingredientes/ingredientes.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecetasService {
  private recetas: IReceta[] = [...SEED_RECETAS];

  constructor(private ingredientesService: IngredientesService) {}

  /** Valida que cada ingredienteId referenciado (incluyendo alternativas) exista */
  private validarIngredientes(ingredientes: IRecetaIngrediente[]): void {
    for (const ri of ingredientes) {
      // Lanza NotFoundException si no existe; lo convertimos en BadRequest
      try {
        this.ingredientesService.findOne(ri.ingredienteId);
      } catch {
        throw new BadRequestException(`Ingrediente ${ri.ingredienteId} no existe`);
      }
      for (const altId of ri.alternativas || []) {
        try {
          this.ingredientesService.findOne(altId);
        } catch {
          throw new BadRequestException(`Ingrediente alternativo ${altId} no existe`);
        }
      }
    }
  }

  findAll(filters: { tipoComidaId?: string; nivel?: NivelMenu } = {}): IReceta[] {
    let result = this.recetas.filter((r) => r.activo);
    if (filters.tipoComidaId) {
      result = result.filter((r) => r.tipoComidaId === filters.tipoComidaId);
    }
    if (filters.nivel) {
      result = result.filter((r) => r.nivel === filters.nivel);
    }
    return result;
  }

  findOne(id: string): IReceta {
    const receta = this.recetas.find((r) => r.id === id);
    if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);
    return receta;
  }

  create(dto: CreateRecetaDto): IReceta {
    this.validarIngredientes(dto.ingredientes);
    const nueva: IReceta = {
      id: uuidv4(),
      nombre: dto.nombre,
      tipoComidaId: dto.tipoComidaId,
      nivel: dto.nivel,
      ingredientes: dto.ingredientes,
      personalizable: dto.personalizable ?? false,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.recetas.push(nueva);
    return nueva;
  }

  update(id: string, dto: UpdateRecetaDto): IReceta {
    const receta = this.findOne(id);
    if (dto.ingredientes) {
      this.validarIngredientes(dto.ingredientes);
    }
    Object.assign(receta, dto, { updatedAt: new Date() });
    return receta;
  }
}
