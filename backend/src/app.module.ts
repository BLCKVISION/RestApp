import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CentrosAcopioModule } from './centros-acopio/centros-acopio.module';
import { TiposComidaModule } from './tipos-comida/tipos-comida.module';
import { MovimientosComidaModule } from './movimientos-comida/movimientos-comida.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';

@Module({
  imports: [
    AuthModule,
    CentrosAcopioModule,
    TiposComidaModule,
    MovimientosComidaModule,
    SolicitudesModule,
  ],
})
export class AppModule {}
