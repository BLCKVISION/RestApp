import { Injectable, NotFoundException } from '@nestjs/common';
import { ISolicitudComida, EstadoSolicitud, PaginatedResponse } from '../common/interfaces';
import { SEED_SOLICITUDES } from '../common/seed-data';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/paginate';
import { CentrosAcopioService } from '../centros-acopio/centros-acopio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SolicitudesService {
  private solicitudes: ISolicitudComida[] = [...SEED_SOLICITUDES];

  constructor(private centrosService: CentrosAcopioService) {}

  create(data: any): ISolicitudComida {
    // Buscar o registrar dinámicamente el centro por nombre/ID
    const centro = this.centrosService.findOrCreateByName(data.centroId, data.ubicacion);
    
    const nueva: ISolicitudComida = {
      id: uuidv4(),
      centroId: centro.id,
      cantidadSolicitada: data.cantidad,
      tipoComidaId: data.tipoComidaId,
      responsable: data.solicitante,
      observaciones: data.nota,
      notasInternas: data.notasInternas,
      horaEntrega: data.horaEntrega,
      estado: EstadoSolicitud.PENDIENTE,
      ubicacion: data.ubicacion || centro.ubicacion,
      fechaSolicitada: new Date(),
      createdAt: new Date(),
    };
    this.solicitudes.push(nueva);
    return nueva;
  }

  findAll(pagination: PaginationDto = {}): ISolicitudComida[] | PaginatedResponse<ISolicitudComida> {
    return paginate(this.findAllSorted(), pagination);
  }

  /** Lista completa ordenada, para uso interno (ej. cálculos del dashboard) */
  findAllSorted(): ISolicitudComida[] {
    return [...this.solicitudes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  update(id: string, data: Partial<ISolicitudComida>): ISolicitudComida {
    const solicitud = this.findOne(id);
    if (data.centroId) {
      const centro = this.centrosService.findOrCreateByName(data.centroId, data.ubicacion);
      solicitud.centroId = centro.id;
    }
    if (data.tipoComidaId) solicitud.tipoComidaId = data.tipoComidaId;
    if (data.cantidadSolicitada) solicitud.cantidadSolicitada = data.cantidadSolicitada;
    if (data.responsable) solicitud.responsable = data.responsable;
    if (data.horaEntrega) solicitud.horaEntrega = data.horaEntrega;
    if (data.observaciones !== undefined) solicitud.observaciones = data.observaciones;
    if (data.notasInternas !== undefined) solicitud.notasInternas = data.notasInternas;
    if (data.prioridad) solicitud.prioridad = data.prioridad;
    if (data.ubicacion !== undefined) solicitud.ubicacion = data.ubicacion;
    return solicitud;
  }

  findOne(id: string): ISolicitudComida {
    const solicitud = this.solicitudes.find(s => s.id === id);
    if (!solicitud) throw new NotFoundException(`Solicitud ${id} no encontrada`);
    return solicitud;
  }

  updateEstado(id: string, nuevoEstado: EstadoSolicitud): ISolicitudComida {
    const solicitud = this.findOne(id);
    solicitud.estado = nuevoEstado;
    return solicitud;
  }
}
