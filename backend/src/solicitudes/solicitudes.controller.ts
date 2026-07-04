import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { EstadoSolicitud } from '../common/interfaces';

@Controller('api/solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  findAll() {
    return this.solicitudesService.findAll();
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoSolicitud) {
    return this.solicitudesService.updateEstado(id, estado);
  }
}
