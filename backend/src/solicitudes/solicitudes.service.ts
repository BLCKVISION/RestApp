import { Injectable, NotFoundException } from '@nestjs/common';
import { ISolicitudComida, EstadoSolicitud } from '../common/interfaces';
import { SEED_SOLICITUDES } from '../common/seed-data';

@Injectable()
export class SolicitudesService {
  private solicitudes: ISolicitudComida[] = [...SEED_SOLICITUDES];

  findAll(): ISolicitudComida[] {
    return this.solicitudes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
