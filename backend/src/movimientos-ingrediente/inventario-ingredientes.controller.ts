import { Controller, Get } from '@nestjs/common';
import { MovimientosIngredienteService } from './movimientos-ingrediente.service';

@Controller('inventario-ingredientes')
export class InventarioIngredientesController {
  constructor(private readonly service: MovimientosIngredienteService) {}

  /** GET /api/inventario-ingredientes/resumen – Stock actual por ingrediente */
  @Get('resumen')
  getResumen() {
    return this.service.getResumenPorIngrediente();
  }
}
