import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MovimientosIngredienteService } from './movimientos-ingrediente.service';
import {
  CreateMovimientoIngredienteDto,
  FilterMovimientoIngredienteDto,
} from './dto/movimientos-ingrediente.dto';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('movimientos-ingrediente')
export class MovimientosIngredienteController {
  constructor(private readonly service: MovimientosIngredienteService) {}

  /** POST /api/movimientos-ingrediente – Registrar entrada o salida */
  @RequirePermission('movimientos-ingrediente.registrar')
  @Post()
  create(@Body() dto: CreateMovimientoIngredienteDto) {
    return this.service.create(dto);
  }

  /** GET /api/movimientos-ingrediente – Listar con filtros y paginación */
  @Get()
  findAll(@Query() filters: FilterMovimientoIngredienteDto) {
    return this.service.findAll(filters);
  }
}
