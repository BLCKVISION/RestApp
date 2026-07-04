import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  MaxLength,
  IsDateString,
  ValidateIf,
  Max,
} from 'class-validator';
import { TipoMovimiento } from '../../common/interfaces';

/** DTO para registrar una entrada o salida de comida */
export class CreateMovimientoDto {
  @IsEnum(TipoMovimiento, { message: 'Tipo debe ser ENTRADA o SALIDA' })
  @IsNotEmpty()
  tipo: TipoMovimiento;

  /** Obligatorio para SALIDA, opcional para ENTRADA */
  @ValidateIf((o) => o.tipo === TipoMovimiento.SALIDA)
  @IsUUID('4', { message: 'centroId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'Centro es obligatorio para salidas' })
  centroId?: string;

  @IsUUID('4')
  @IsNotEmpty()
  tipoComidaId: string;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  cantidad: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  origen?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nota?: string;

  @IsUUID('4')
  @IsOptional()
  solicitudId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  registradoPor: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;
}

/** DTO para filtrar movimientos en GET /movimientos */
export class FilterMovimientoDto {
  @IsEnum(TipoMovimiento)
  @IsOptional()
  tipo?: TipoMovimiento;

  @IsUUID('4')
  @IsOptional()
  centroId?: string;

  @IsUUID('4')
  @IsOptional()
  tipoComidaId?: string;

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
