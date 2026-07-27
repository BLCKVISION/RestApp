import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
  IsDateString,
  IsInt,
  Max,
} from 'class-validator';
import { TipoMovimiento } from '../../common/interfaces';

/** DTO para registrar una entrada o salida de ingrediente */
export class CreateMovimientoIngredienteDto {
  @IsEnum(TipoMovimiento, { message: 'Tipo debe ser ENTRADA o SALIDA' })
  @IsNotEmpty()
  tipo: TipoMovimiento;

  @IsString()
  @IsNotEmpty()
  ingredienteId: string;

  @IsNumber()
  @Min(0.001, { message: 'La cantidad debe ser mayor que cero' })
  cantidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  origen?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nota?: string;

  @IsString()
  @IsOptional()
  solicitudId?: string;

  @IsString()
  @IsOptional()
  requisicionId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  registradoPor: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;
}

/** DTO para filtrar movimientos de ingrediente en GET /movimientos-ingrediente */
export class FilterMovimientoIngredienteDto {
  @IsEnum(TipoMovimiento)
  @IsOptional()
  tipo?: TipoMovimiento;

  @IsString()
  @IsOptional()
  ingredienteId?: string;

  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @IsDateString()
  @IsOptional()
  fechaHasta?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
