import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CentrosAcopioService } from './centros-acopio.service';
import { CreateCentroAcopioDto, UpdateCentroAcopioDto } from './dto/centros-acopio.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('centros-acopio')
export class CentrosAcopioController {
  constructor(private readonly service: CentrosAcopioService) {}

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

  @RequirePermission('centros-acopio.gestionar')
  @Post()
  create(@Body() dto: CreateCentroAcopioDto) {
    return this.service.create(dto);
  }

  @RequirePermission('centros-acopio.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCentroAcopioDto) {
    return this.service.update(id, dto);
  }
}
