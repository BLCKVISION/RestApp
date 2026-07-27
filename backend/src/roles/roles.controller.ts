import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto/roles.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  /** Debe declararse antes de :id para que Nest no lo confunda con un id */
  @Get('permisos-disponibles')
  getPermisosDisponibles() {
    return this.service.getPermisosDisponibles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermission('roles.gestionar')
  @Post()
  create(@Body() dto: CreateRolDto) {
    return this.service.create(dto);
  }

  @RequirePermission('roles.gestionar')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRolDto) {
    return this.service.update(id, dto);
  }

  @RequirePermission('roles.gestionar')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
