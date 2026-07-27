import { Controller, Get, Patch, Post, Body, Param, Query } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { EstadoSolicitud } from '../common/interfaces';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';
import { RequisicionesService } from '../requisiciones/requisiciones.service';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(
    private readonly solicitudesService: SolicitudesService,
    private readonly requisicionesService: RequisicionesService,
  ) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.solicitudesService.findAll(pagination);
  }

  /** Público: usado por el formulario público de solicitudes */
  @Public()
  @Post()
  create(@Body() body: any) {
    const nueva = this.solicitudesService.create(body);
    if (body.recetaId) {
      const { ok, requisicionId } = this.requisicionesService.evaluar({
        solicitudId: nueva.id,
        recetaId: body.recetaId,
        cantidadSolicitada: nueva.cantidadSolicitada,
        personalizacion: body.personalizacion,
      });
      if (!ok) {
        this.solicitudesService.update(nueva.id, { requisicionId });
      }
    }
    return nueva;
  }

  @RequirePermission('solicitudes.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.solicitudesService.update(id, body);
  }

  @RequirePermission('solicitudes.gestionar')
  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoSolicitud) {
    return this.solicitudesService.updateEstado(id, estado);
  }
}
