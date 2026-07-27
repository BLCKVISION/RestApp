import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CentrosAcopioModule } from './centros-acopio/centros-acopio.module';
import { TiposComidaModule } from './tipos-comida/tipos-comida.module';
import { MovimientosComidaModule } from './movimientos-comida/movimientos-comida.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { RecetasModule } from './recetas/recetas.module';
import { MovimientosIngredienteModule } from './movimientos-ingrediente/movimientos-ingrediente.module';
import { RequisicionesModule } from './requisiciones/requisiciones.module';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    AuthModule,
    CentrosAcopioModule,
    TiposComidaModule,
    MovimientosComidaModule,
    SolicitudesModule,
    IngredientesModule,
    RecetasModule,
    MovimientosIngredienteModule,
    RequisicionesModule,
    RolesModule,
    UsuariosModule,
  ],
})
export class AppModule {}
