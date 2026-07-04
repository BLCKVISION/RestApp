import { Controller, Get, Patch, Post, Body, Param, Query } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { EstadoSolicitud } from '../common/interfaces';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.solicitudesService.findAll(pagination);
  }

  /** Público: usado por el formulario público de solicitudes */
  @Public()
  @Post()
  create(@Body() body: any) {
    return this.solicitudesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.solicitudesService.update(id, body);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoSolicitud) {
    return this.solicitudesService.updateEstado(id, estado);
  }
}
