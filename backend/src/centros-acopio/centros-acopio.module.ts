import { Module } from '@nestjs/common';
import { CentrosAcopioController } from './centros-acopio.controller';
import { CentrosAcopioService } from './centros-acopio.service';

@Module({
  controllers: [CentrosAcopioController],
  providers: [CentrosAcopioService],
  exports: [CentrosAcopioService],
})
export class CentrosAcopioModule {}
