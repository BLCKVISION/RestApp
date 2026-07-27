import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { ResolverRequisicionDto } from './dto/requisiciones.dto';
import { EstadoRequisicion } from '../common/interfaces';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('requisiciones')
export class RequisicionesController {
  constructor(private readonly service: RequisicionesService) {}

  @Get()
  findAll(@Query('estado') estado?: EstadoRequisicion) {
    return this.service.findAll({ estado });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermission('requisiciones.resolver')
  @Patch(':id/estado')
  resolver(@Param('id') id: string, @Body() dto: ResolverRequisicionDto) {
    return this.service.resolver(id, dto);
  }
}
