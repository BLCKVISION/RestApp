import { Injectable, NotFoundException } from '@nestjs/common';
import { ISolicitudComida, EstadoSolicitud } from '../common/interfaces';
import { SEED_SOLICITUDES } from '../common/seed-data';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SolicitudesService {
  private solicitudes: ISolicitudComida[] = [...SEED_SOLICITUDES];

  create(data: any): ISolicitudComida {
    const nueva: ISolicitudComida = {
      id: uuidv4(),
      centroId: data.centroId,
      cantidadSolicitada: data.cantidad,
      tipoComidaId: data.tipoComidaId,
      responsable: data.solicitante,
      observaciones: data.nota,
      horaEntrega: data.horaEntrega,
      estado: EstadoSolicitud.PENDIENTE,
      fechaSolicitada: new Date(),
      createdAt: new Date(),
    };
    this.solicitudes.push(nueva);
    return nueva;
  }

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
