import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateCentroAcopioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  ubicacion: string;

  @IsString()
  @IsNotEmpty()
  operador: string;
}

export class UpdateCentroAcopioDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  ubicacion?: string;

  @IsString()
  @IsOptional()
  operador?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
