import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IMovimientoComida,
  TipoMovimiento,
  ResumenInventario,
  PaginatedResponse,
  ISolicitudComida,
  EstadoSolicitud,
} from '../common/interfaces';
import { SEED_MOVIMIENTOS, SEED_TIPOS_COMIDA, SEED_CENTROS, SEED_SOLICITUDES } from '../common/seed-data';
import { META_MENSUAL_INVENTARIO } from '../common/config';
import { CreateMovimientoDto, FilterMovimientoDto } from './dto/movimientos-comida.dto';
import { SolicitudesService } from '../solicitudes/solicitudes.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MovimientosComidaService {
  private movimientos: IMovimientoComida[] = [...SEED_MOVIMIENTOS];

  constructor(private solicitudesService: SolicitudesService) {}

  /** Registrar un nuevo movimiento (entrada o salida) */
  create(dto: CreateMovimientoDto): IMovimientoComida {
    // Validar que el centro existe si es SALIDA
    if (dto.tipo === TipoMovimiento.SALIDA) {
      const centro = SEED_CENTROS.find((c) => c.id === dto.centroId);
      if (!centro) {
        throw new BadRequestException(`Centro ${dto.centroId} no encontrado`);
      }
    }

    // Validar que el tipo de comida existe
    const tipoComida = SEED_TIPOS_COMIDA.find((t) => t.id === dto.tipoComidaId);
    if (!tipoComida) {
      throw new BadRequestException(`Tipo de comida ${dto.tipoComidaId} no encontrado`);
    }

    // Para salidas, validar que hay suficiente stock
    if (dto.tipo === TipoMovimiento.SALIDA) {
      const stock = this.calcularStockPorTipo(dto.tipoComidaId);
      if (stock < dto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente de "${tipoComida.nombre}". Disponible: ${stock}, solicitado: ${dto.cantidad}`,
        );
      }
    }

    const nuevo: IMovimientoComida = {
      id: uuidv4(),
      tipo: dto.tipo,
      centroId: dto.centroId,
      tipoComidaId: dto.tipoComidaId,
      cantidad: dto.cantidad,
      origen: dto.origen,
      nota: dto.nota,
      solicitudId: dto.solicitudId,
      registradoPor: dto.registradoPor,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      createdAt: new Date(),
    };

    if (dto.solicitudId && dto.tipo === TipoMovimiento.SALIDA) {
      this.solicitudesService.updateEstado(dto.solicitudId, EstadoSolicitud.ENTREGADA);
    }

    this.movimientos.push(nuevo);
    return nuevo;
  }

  /** Listar movimientos con filtros y paginación */
  findAll(filters: FilterMovimientoDto): PaginatedResponse<IMovimientoComida> {
    let result = [...this.movimientos];

    // Aplicar filtros
    if (filters.tipo) {
      result = result.filter((m) => m.tipo === filters.tipo);
    }
    if (filters.centroId) {
      result = result.filter((m) => m.centroId === filters.centroId);
    }
    if (filters.tipoComidaId) {
      result = result.filter((m) => m.tipoComidaId === filters.tipoComidaId);
    }
    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      desde.setHours(0, 0, 0, 0);
      result = result.filter((m) => new Date(m.fecha) >= desde);
    }
    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      result = result.filter((m) => new Date(m.fecha) <= hasta);
    }

    // Ordenar por fecha descendente
    result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = result.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }

  /** Resumen de inventario para el dashboard */
  getResumen(): ResumenInventario {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inventarioPorTipo = SEED_TIPOS_COMIDA.filter((t) => t.activo).map((tipo) => {
      const entradas = this.movimientos
        .filter((m) => m.tipoComidaId === tipo.id && m.tipo === TipoMovimiento.ENTRADA)
        .reduce((sum, m) => sum + m.cantidad, 0);

      const salidas = this.movimientos
        .filter((m) => m.tipoComidaId === tipo.id && m.tipo === TipoMovimiento.SALIDA)
        .reduce((sum, m) => sum + m.cantidad, 0);

      const entradasHoy = this.movimientos
        .filter(
          (m) =>
            m.tipoComidaId === tipo.id &&
            m.tipo === TipoMovimiento.ENTRADA &&
            new Date(m.fecha) >= hoy,
        )
        .reduce((sum, m) => sum + m.cantidad, 0);

      const salidasHoy = this.movimientos
        .filter(
          (m) =>
            m.tipoComidaId === tipo.id &&
            m.tipo === TipoMovimiento.SALIDA &&
            new Date(m.fecha) >= hoy,
        )
        .reduce((sum, m) => sum + m.cantidad, 0);

      return {
        tipoComidaId: tipo.id,
        tipoComida: tipo.nombre,
        stockActual: entradas - salidas,
        entradasHoy,
        salidasHoy,
      };
    });

    const totalInventario = inventarioPorTipo.reduce((sum, t) => sum + t.stockActual, 0);
    const entradasHoy = inventarioPorTipo.reduce((sum, t) => sum + t.entradasHoy, 0);
    const salidasHoy = inventarioPorTipo.reduce((sum, t) => sum + t.salidasHoy, 0);
    const pctMetaMensual = Math.min(
      Math.round((totalInventario / META_MENSUAL_INVENTARIO) * 100),
      100,
    );

    // Nuevas métricas operativas
    const allSolicitudes = this.solicitudesService.findAllSorted();
    const pedidosPendientes = allSolicitudes.filter((s) => s.estado === EstadoSolicitud.PENDIENTE).length;
    const pedidosProgramadosHoy = allSolicitudes.filter(
      (s) => s.estado === EstadoSolicitud.APROBADA || s.estado === EstadoSolicitud.EN_PREPARACION || s.estado === EstadoSolicitud.LISTA
    ).length;

    // Cálculos de ayer para porcentajes (Mocks por ahora en solicitudes)
    const pctPendientes = -5.0; // Simulando que bajaron los pendientes
    const pctProgramados = 12.5; // Simulando que hay más programados
    const pctSalidas = 2.0; 
    const pctInventario = 8.5; 

    // Últimas solicitudes completadas
    const solicitudesRecientes = [...allSolicitudes]
      .filter((s) => s.estado === EstadoSolicitud.ENTREGADA)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Solicitudes programadas para el dashboard central
    const solicitudesProgramadas = [...allSolicitudes]
      .filter((s) => [EstadoSolicitud.PENDIENTE, EstadoSolicitud.APROBADA, EstadoSolicitud.EN_PREPARACION, EstadoSolicitud.LISTA].includes(s.estado))
      .sort((a, b) => new Date(a.fechaSolicitada).getTime() - new Date(b.fechaSolicitada).getTime());

    // Últimos 10 movimientos
    const movimientosRecientes = [...this.movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);

    return {
      pedidosPendientes,
      pedidosProgramadosHoy,
      salidasHoy,
      totalInventario,
      metaMensualInventario: META_MENSUAL_INVENTARIO,
      pctMetaMensual,
      pctPendientes,
      pctProgramados,
      pctSalidas,
      pctInventario,
      inventarioPorTipo,
      solicitudesRecientes,
      solicitudesProgramadas,
      movimientosRecientes,
    };
  }

  /** Datos para grafico de movimientos (semanal, mensual, anual) */
  getDatosGrafico(rango: string): { label: string; entradas: number; salidas: number }[] {
    const resultado: { label: string; entradas: number; salidas: number }[] = [];
    const hoy = new Date();

    if (rango === 'anual') {
      // 12 months of the current year
      const currentYear = hoy.getFullYear();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      for (let i = 0; i < 12; i++) {
        const entradas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.ENTRADA && new Date(m.fecha).getFullYear() === currentYear && new Date(m.fecha).getMonth() === i)
          .reduce((sum, m) => sum + m.cantidad, 0);
          
        const salidas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.SALIDA && new Date(m.fecha).getFullYear() === currentYear && new Date(m.fecha).getMonth() === i)
          .reduce((sum, m) => sum + m.cantidad, 0);

        resultado.push({ label: monthNames[i], entradas, salidas });
      }
    } else if (rango === 'mensual') {
      // 4 weeks approximation for the last 28 days
      for (let i = 3; i >= 0; i--) {
        const finSemana = new Date(hoy);
        finSemana.setDate(hoy.getDate() - (i * 7));
        finSemana.setHours(23, 59, 59, 999);
        
        const inicioSemana = new Date(finSemana);
        inicioSemana.setDate(finSemana.getDate() - 6);
        inicioSemana.setHours(0, 0, 0, 0);

        const entradas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.ENTRADA && new Date(m.fecha) >= inicioSemana && new Date(m.fecha) <= finSemana)
          .reduce((sum, m) => sum + m.cantidad, 0);
          
        const salidas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.SALIDA && new Date(m.fecha) >= inicioSemana && new Date(m.fecha) <= finSemana)
          .reduce((sum, m) => sum + m.cantidad, 0);

        resultado.push({ label: `Sem ${4 - i}`, entradas, salidas });
      }
    } else {
      // Semanal (last 7 days)
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      for (let i = 6; i >= 0; i--) {
        const dia = new Date();
        dia.setDate(hoy.getDate() - i);
        dia.setHours(0, 0, 0, 0);

        const finDia = new Date(dia);
        finDia.setHours(23, 59, 59, 999);

        const entradas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.ENTRADA && new Date(m.fecha) >= dia && new Date(m.fecha) <= finDia)
          .reduce((sum, m) => sum + m.cantidad, 0);

        const salidas = this.movimientos
          .filter(m => m.tipo === TipoMovimiento.SALIDA && new Date(m.fecha) >= dia && new Date(m.fecha) <= finDia)
          .reduce((sum, m) => sum + m.cantidad, 0);

        resultado.push({
          label: dayNames[dia.getDay()],
          entradas,
          salidas,
        });
      }
    }

    return resultado;
  }

  /** Distribución de salidas por centro */
  getDistribucionPorCentro(): {
    centroId: string;
    centro: string;
    ubicacion: string;
    operador: string;
    porTipo: { tipoComida: string; cantidad: number }[];
  }[] {
    return SEED_CENTROS.filter((c) => c.activo).map((centro) => {
      const porTipo = SEED_TIPOS_COMIDA.filter((t) => t.activo).map((tipo) => {
        const cantidad = this.movimientos
          .filter(
            (m) =>
              m.centroId === centro.id &&
              m.tipoComidaId === tipo.id &&
              m.tipo === TipoMovimiento.SALIDA,
          )
          .reduce((sum, m) => sum + m.cantidad, 0);

        return { tipoComida: tipo.nombre, cantidad };
      });

      return { 
        centroId: centro.id, 
        centro: centro.nombre, 
        ubicacion: centro.ubicacion, 
        operador: centro.operador, 
        porTipo 
      };
    });
  }

  /** Stock actual de un tipo de comida específico */
  private calcularStockPorTipo(tipoComidaId: string): number {
    const entradas = this.movimientos
      .filter((m) => m.tipoComidaId === tipoComidaId && m.tipo === TipoMovimiento.ENTRADA)
      .reduce((sum, m) => sum + m.cantidad, 0);

    const salidas = this.movimientos
      .filter((m) => m.tipoComidaId === tipoComidaId && m.tipo === TipoMovimiento.SALIDA)
      .reduce((sum, m) => sum + m.cantidad, 0);

    return entradas - salidas;
  }
}
