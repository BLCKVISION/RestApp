import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NivelMenu } from '../../common/interfaces';

export class RecetaIngredienteDto {
  @IsString()
  @IsNotEmpty()
  ingredienteId: string;

  @IsNumber()
  @Min(0.01)
  cantidadPorRacion: number;

  @IsBoolean()
  @IsOptional()
  personalizable?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  alternativas?: string[];
}

export class CreateRecetaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipoComidaId: string;

  @IsEnum(NivelMenu)
  nivel: NivelMenu;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaIngredienteDto)
  ingredientes: RecetaIngredienteDto[];

  @IsBoolean()
  @IsOptional()
  personalizable?: boolean;
}

export class UpdateRecetaDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  tipoComidaId?: string;

  @IsEnum(NivelMenu)
  @IsOptional()
  nivel?: NivelMenu;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecetaIngredienteDto)
  ingredientes?: RecetaIngredienteDto[];

  @IsBoolean()
  @IsOptional()
  personalizable?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
