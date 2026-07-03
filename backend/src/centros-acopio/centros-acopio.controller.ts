import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CentrosAcopioService } from './centros-acopio.service';
import { CreateCentroAcopioDto, UpdateCentroAcopioDto } from './dto/centros-acopio.dto';

@Controller('centros-acopio')
export class CentrosAcopioController {
  constructor(private readonly service: CentrosAcopioService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCentroAcopioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCentroAcopioDto) {
    return this.service.update(id, dto);
  }
}
