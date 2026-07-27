import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { TiposComidaService } from './tipos-comida.service';
import { CreateTipoComidaDto, UpdateTipoComidaDto } from './dto/tipos-comida.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('tipos-comida')
export class TiposComidaController {
  constructor(private readonly service: TiposComidaService) {}

  /** Público: necesario para el formulario público de solicitudes */
  @Public()
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermission('tipos-comida.gestionar')
  @Post()
  create(@Body() dto: CreateTipoComidaDto) {
    return this.service.create(dto);
  }

  @RequirePermission('tipos-comida.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTipoComidaDto) {
    return this.service.update(id, dto);
  }
}
