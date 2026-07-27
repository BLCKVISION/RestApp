import { Injectable } from '@nestjs/common';
import { IMovimientoIngrediente, TipoMovimiento, PaginatedResponse } from '../common/interfaces';
import { SEED_MOVIMIENTOS_INGREDIENTE } from '../common/seed-data';
import {
  CreateMovimientoIngredienteDto,
  FilterMovimientoIngredienteDto,
} from './dto/movimientos-ingrediente.dto';
import { IngredientesService } from '../ingredientes/ingredientes.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MovimientosIngredienteService {
  private movimientos: IMovimientoIngrediente[] = [...SEED_MOVIMIENTOS_INGREDIENTE];

  constructor(private ingredientesService: IngredientesService) {}

  /** Registrar un nuevo movimiento de ingrediente (entrada o salida) */
  create(dto: CreateMovimientoIngredienteDto): IMovimientoIngrediente {
    // Validar que el ingrediente exista (lanza NotFoundException si no)
    const ingrediente = this.ingredientesService.findOne(dto.ingredienteId);

    // Para salidas, advertir si el stock es insuficiente (pero permitir continuar)
    if (dto.tipo === TipoMovimiento.SALIDA) {
      const stock = this.calcularStock(dto.ingredienteId);
      if (stock < dto.cantidad) {
        console.warn(
          `Advertencia: Stock insuficiente de "${ingrediente.nombre}". Disponible: ${stock}, solicitado: ${dto.cantidad}`,
        );
      }
    }

    const nuevo: IMovimientoIngrediente = {
      id: uuidv4(),
      tipo: dto.tipo,
      ingredienteId: dto.ingredienteId,
      cantidad: dto.cantidad,
      origen: dto.origen,
      nota: dto.nota,
      solicitudId: dto.solicitudId,
      requisicionId: dto.requisicionId,
      registradoPor: dto.registradoPor,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      createdAt: new Date(),
    };

    this.movimientos.push(nuevo);
    return nuevo;
  }

  /** Listar movimientos con filtros y paginación */
  findAll(filters: FilterMovimientoIngredienteDto): PaginatedResponse<IMovimientoIngrediente> {
    let result = [...this.movimientos];

    if (filters.tipo) {
      result = result.filter((m) => m.tipo === filters.tipo);
    }
    if (filters.ingredienteId) {
      result = result.filter((m) => m.ingredienteId === filters.ingredienteId);
    }
    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      desde.setHours(0, 0, 0, 0);
      result = result.filter((m) => new Date(m.fecha) >= desde);
    }
    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      result = result.filter((m) => new Date(m.fecha) <= hasta);
    }

    // Ordenar por fecha descendente
    result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  /** Stock actual de un ingrediente específico. Público: otros módulos lo necesitan. */
  calcularStock(ingredienteId: string): number {
    const entradas = this.movimientos
      .filter((m) => m.ingredienteId === ingredienteId && m.tipo === TipoMovimiento.ENTRADA)
      .reduce((sum, m) => sum + m.cantidad, 0);

    const salidas = this.movimientos
      .filter((m) => m.ingredienteId === ingredienteId && m.tipo === TipoMovimiento.SALIDA)
      .reduce((sum, m) => sum + m.cantidad, 0);

    return entradas - salidas;
  }

  /** Resumen de stock actual por cada ingrediente activo */
  getResumenPorIngrediente(): { ingredienteId: string; ingrediente: string; stockActual: number }[] {
    const activos = this.ingredientesService.findAll();
    const lista = Array.isArray(activos) ? activos : activos.data;
    return lista.map((ing) => ({
      ingredienteId: ing.id,
      ingrediente: ing.nombre,
      stockActual: this.calcularStock(ing.id),
    }));
  }
}
