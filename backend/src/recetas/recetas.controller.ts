import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto, UpdateRecetaDto } from './dto/recetas.dto';
import { NivelMenu } from '../common/interfaces';
import { Public } from '../auth/public.decorator';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('recetas')
export class RecetasController {
  constructor(private readonly service: RecetasService) {}

  /** Público: el wizard público necesita listar/filtrar los menús */
  @Public()
  @Get()
  findAll(@Query('tipoComidaId') tipoComidaId?: string, @Query('nivel') nivel?: NivelMenu) {
    return this.service.findAll({ tipoComidaId, nivel });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermission('recetas.gestionar')
  @Post()
  create(@Body() dto: CreateRecetaDto) {
    return this.service.create(dto);
  }

  @RequirePermission('recetas.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecetaDto) {
    return this.service.update(id, dto);
  }
}
