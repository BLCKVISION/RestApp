import { Module } from '@nestjs/common';
import { MovimientosComidaController } from './movimientos-comida.controller';
import { InventarioController } from './inventario.controller';
import { MovimientosComidaService } from './movimientos-comida.service';
import { SolicitudesModule } from '../solicitudes/solicitudes.module';

@Module({
  imports: [SolicitudesModule],
  controllers: [MovimientosComidaController, InventarioController],
  providers: [MovimientosComidaService],
  exports: [MovimientosComidaService],
})
export class MovimientosComidaModule {}
