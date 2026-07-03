import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MovimientosComidaService } from './movimientos-comida.service';
import { CreateMovimientoDto, FilterMovimientoDto } from './dto/movimientos-comida.dto';

@Controller('movimientos')
export class MovimientosComidaController {
  constructor(private readonly service: MovimientosComidaService) {}

  /** POST /api/movimientos – Registrar entrada o salida */
  @Post()
  create(@Body() dto: CreateMovimientoDto) {
    return this.service.create(dto);
  }

  /** GET /api/movimientos – Listar con filtros y paginación */
  @Get()
  findAll(@Query() filters: FilterMovimientoDto) {
    return this.service.findAll(filters);
  }
}
