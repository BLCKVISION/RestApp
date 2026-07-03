import { Controller, Get, Query } from '@nestjs/common';
import { MovimientosComidaService } from './movimientos-comida.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly service: MovimientosComidaService) {}

  /** GET /api/inventario/resumen – Resumen para dashboard */
  @Get('resumen')
  getResumen() {
    return this.service.getResumen();
  }

  /** GET /api/inventario/grafico – Datos para grafico (semanal, mensual, anual) */
  @Get('grafico')
  getDatosGrafico(@Query('rango') rango: string = 'semanal') {
    return this.service.getDatosGrafico(rango);
  }

  /** GET /api/inventario/distribucion – Distribución por centro */
  @Get('distribucion')
  getDistribucionPorCentro() {
    return this.service.getDistribucionPorCentro();
  }
}
