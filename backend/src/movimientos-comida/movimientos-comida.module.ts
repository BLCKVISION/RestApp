import { Module } from '@nestjs/common';
import { MovimientosComidaController } from './movimientos-comida.controller';
import { InventarioController } from './inventario.controller';
import { MovimientosComidaService } from './movimientos-comida.service';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';
import { CentrosAcopioModule } from '../centros-acopio/centros-acopio.module';
import { RecetasModule } from '../recetas/recetas.module';
import { MovimientosIngredienteModule } from '../movimientos-ingrediente/movimientos-ingrediente.module';

@Module({
  imports: [SolicitudesModule, CentrosAcopioModule, RecetasModule, MovimientosIngredienteModule],
  controllers: [MovimientosComidaController, InventarioController],
  providers: [MovimientosComidaService],
  exports: [MovimientosComidaService],
})
export class MovimientosComidaModule {}
