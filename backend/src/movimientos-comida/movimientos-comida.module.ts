import { Module } from '@nestjs/common';
import { MovimientosComidaController } from './movimientos-comida.controller';
import { InventarioController } from './inventario.controller';
import { MovimientosComidaService } from './movimientos-comida.service';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';
import { CentrosAcopioModule } from '../centros-acopio/centros-acopio.module';

@Module({
  imports: [SolicitudesModule, CentrosAcopioModule],
  controllers: [MovimientosComidaController, InventarioController],
  providers: [MovimientosComidaService],
  exports: [MovimientosComidaService],
})
export class MovimientosComidaModule {}
