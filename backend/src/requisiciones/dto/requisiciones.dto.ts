import { IsEnum, IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { EstadoRequisicion } from '../../common/interfaces';

export class ResolverRequisicionDto {
  @IsEnum(EstadoRequisicion)
  estado: EstadoRequisicion;

  @IsString()
  @IsNotEmpty()
  resueltoPor: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nota?: string;
}
