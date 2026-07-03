import { Module } from '@nestjs/common';
import { MovimientosComidaController } from './movimientos-comida.controller';
import { InventarioController } from './inventario.controller';
import { MovimientosComidaService } from './movimientos-comida.service';

@Module({
  controllers: [MovimientosComidaController, InventarioController],
  providers: [MovimientosComidaService],
  exports: [MovimientosComidaService],
})
export class MovimientosComidaModule {}
