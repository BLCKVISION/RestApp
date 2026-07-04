import { Controller, Get, Patch, Post, Body, Param } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { EstadoSolicitud } from '../common/interfaces';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  findAll() {
    return this.solicitudesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.solicitudesService.create(body);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoSolicitud) {
    return this.solicitudesService.updateEstado(id, estado);
  }
}
