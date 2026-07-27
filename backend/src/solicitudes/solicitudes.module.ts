import { Module } from '@nestjs/common';
import { SolicitudesController } from './solicitudes.controller';
import { SolicitudesService } from './solicitudes.service';
import { CentrosAcopioModule } from '../centros-acopio/centros-acopio.module';
import { RequisicionesModule } from '../requisiciones/requisiciones.module';

@Module({
  imports: [CentrosAcopioModule, RequisicionesModule],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService]
})
export class SolicitudesModule {}
