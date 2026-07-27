import { Module } from '@nestjs/common';
import { MovimientosIngredienteController } from './movimientos-ingrediente.controller';
import { InventarioIngredientesController } from './inventario-ingredientes.controller';
import { MovimientosIngredienteService } from './movimientos-ingrediente.service';
import { IngredientesModule } from '../ingredientes/ingredientes.module';

@Module({
  imports: [IngredientesModule],
  controllers: [MovimientosIngredienteController, InventarioIngredientesController],
  providers: [MovimientosIngredienteService],
  exports: [MovimientosIngredienteService],
})
export class MovimientosIngredienteModule {}
