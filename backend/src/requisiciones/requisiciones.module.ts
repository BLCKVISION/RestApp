import { Module } from '@nestjs/common';
import { RequisicionesController } from './requisiciones.controller';
import { RequisicionesService } from './requisiciones.service';
import { RecetasModule } from '../recetas/recetas.module';
import { MovimientosIngredienteModule } from '../movimientos-ingrediente/movimientos-ingrediente.module';

@Module({
  imports: [RecetasModule, MovimientosIngredienteModule],
  controllers: [RequisicionesController],
  providers: [RequisicionesService],
  exports: [RequisicionesService],
})
export class RequisicionesModule {}
