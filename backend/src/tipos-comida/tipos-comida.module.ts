import { Module } from '@nestjs/common';
import { TiposComidaController } from './tipos-comida.controller';
import { TiposComidaService } from './tipos-comida.service';

@Module({
  controllers: [TiposComidaController],
  providers: [TiposComidaService],
  exports: [TiposComidaService],
})
export class TiposComidaModule {}
