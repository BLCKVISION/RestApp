import { IsInt, Min, Max, IsOptional } from 'class-validator';

/** DTO de paginación opcional — si no se envían page/limit se devuelve la lista completa */
export class PaginationDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
