import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IRequisicion,
  IRequisicionItem,
  EstadoRequisicion,
  TipoMovimiento,
} from '../common/interfaces';
import { ResolverRequisicionDto } from './dto/requisiciones.dto';
import { RecetasService } from '../recetas/recetas.service';
import { MovimientosIngredienteService } from '../movimientos-ingrediente/movimientos-ingrediente.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequisicionesService {
  private requisiciones: IRequisicion[] = [];

  constructor(
    private recetasService: RecetasService,
    private movimientosIngredienteService: MovimientosIngredienteService,
  ) {}

  /**
   * Evalúa una solicitud contra el inventario según su receta.
   * SOLO lee/compara — NUNCA muta el stock de ingredientes.
   * Si algún ingrediente falta, crea una requisición PENDIENTE.
   */
  evaluar({
    solicitudId,
    recetaId,
    cantidadSolicitada,
    personalizacion,
  }: {
    solicitudId: string;
    recetaId: string;
    cantidadSolicitada: number;
    personalizacion?: { ingredienteOriginalId: string; ingredienteSustitutoId: string }[];
  }): { ok: boolean; requisicionId?: string } {
    const receta = this.recetasService.findOne(recetaId);

    const items: IRequisicionItem[] = receta.ingredientes.map((ri) => {
      // Resolver el ingrediente final: aplicar sustitución SOLO si es una alternativa válida
      let ingredienteFinalId = ri.ingredienteId;
      const sustitucion = personalizacion?.find(
        (p) => p.ingredienteOriginalId === ri.ingredienteId,
      );
      if (sustitucion && (ri.alternativas || []).includes(sustitucion.ingredienteSustitutoId)) {
        ingredienteFinalId = sustitucion.ingredienteSustitutoId;
      }

      const cantidadRequerida = ri.cantidadPorRacion * cantidadSolicitada;
      const cantidadDisponible = this.movimientosIngredienteService.calcularStock(ingredienteFinalId);
      const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDisponible);

      return {
        ingredienteId: ingredienteFinalId,
        cantidadRequerida,
        cantidadDisponible,
        cantidadFaltante,
      };
    });

    const hayFaltante = items.some((item) => item.cantidadFaltante > 0);
    if (!hayFaltante) {
      return { ok: true };
    }

    const nueva: IRequisicion = {
      id: uuidv4(),
      solicitudId,
      recetaId,
      items,
      estado: EstadoRequisicion.PENDIENTE,
      createdAt: new Date(),
    };
    this.requisiciones.push(nueva);
    return { ok: false, requisicionId: nueva.id };
  }

  findAll(filters: { estado?: EstadoRequisicion } = {}): IRequisicion[] {
    let result = [...this.requisiciones];
    if (filters.estado) {
      result = result.filter((r) => r.estado === filters.estado);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findOne(id: string): IRequisicion {
    const requisicion = this.requisiciones.find((r) => r.id === id);
    if (!requisicion) throw new NotFoundException(`Requisición ${id} no encontrada`);
    return requisicion;
  }

  resolver(id: string, dto: ResolverRequisicionDto): IRequisicion {
    const requisicion = this.findOne(id);

    if (dto.estado === EstadoRequisicion.ACEPTADA) {
      for (const item of requisicion.items) {
        if (item.cantidadFaltante > 0) {
          this.movimientosIngredienteService.create({
            tipo: TipoMovimiento.ENTRADA,
            ingredienteId: item.ingredienteId,
            cantidad: item.cantidadFaltante,
            origen: `Reabastecimiento - Requisición #${requisicion.id.slice(-6).toUpperCase()}`,
            registradoPor: dto.resueltoPor,
            requisicionId: requisicion.id,
          });
        }
      }
    }

    requisicion.estado = dto.estado;
    requisicion.resueltoPor = dto.resueltoPor;
    requisicion.notaResolucion = dto.nota;
    requisicion.resueltoAt = new Date();
    return requisicion;
  }
}
