import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto, UpdateIngredienteDto } from './dto/ingredientes.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/public.decorator';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly service: IngredientesService) {}

  /** Público: necesario para el wizard público de solicitudes */
  @Public()
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermission('ingredientes.gestionar')
  @Post()
  create(@Body() dto: CreateIngredienteDto) {
    return this.service.create(dto);
  }

  @RequirePermission('ingredientes.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIngredienteDto) {
    return this.service.update(id, dto);
  }
}
