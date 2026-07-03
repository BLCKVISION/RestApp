import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { TiposComidaService } from './tipos-comida.service';
import { CreateTipoComidaDto, UpdateTipoComidaDto } from './dto/tipos-comida.dto';

@Controller('tipos-comida')
export class TiposComidaController {
  constructor(private readonly service: TiposComidaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTipoComidaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTipoComidaDto) {
    return this.service.update(id, dto);
  }
}
