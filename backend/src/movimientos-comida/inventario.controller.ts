import { Controller, Get } from '@nestjs/common';
import { MovimientosComidaService } from './movimientos-comida.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly service: MovimientosComidaService) {}

  /** GET /api/inventario/resumen – Resumen para dashboard */
  @Get('resumen')
  getResumen() {
    return this.service.getResumen();
  }

  /** GET /api/inventario/semana – Datos para gráfico semanal */
  @Get('semana')
  getMovimientosSemana() {
    return this.service.getMovimientosSemana();
  }

  /** GET /api/inventario/distribucion – Distribución por centro */
  @Get('distribucion')
  getDistribucionPorCentro() {
    return this.service.getDistribucionPorCentro();
  }
}
