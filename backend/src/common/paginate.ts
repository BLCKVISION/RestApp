import { PaginatedResponse } from './interfaces';
import { PaginationDto } from './dto/pagination.dto';

/** Pagina un arreglo si se especifica page/limit; si no, devuelve el arreglo completo */
export function paginate<T>(items: T[], { page, limit }: PaginationDto): T[] | PaginatedResponse<T> {
  if (!page && !limit) {
    return items;
  }
  const currentPage = page || 1;
  const currentLimit = limit || 20;
  const total = items.length;
  const totalPages = Math.ceil(total / currentLimit);
  const start = (currentPage - 1) * currentLimit;
  const data = items.slice(start, start + currentLimit);
  return { data, total, page: currentPage, limit: currentLimit, totalPages };
}
