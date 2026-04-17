import { Request, Response } from 'express';
import Auditoria from '../models/Auditoria';
import Usuario from '../models/Usuario';
import { Op } from 'sequelize';

export const getAuditorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entidad, accion, fechaInicio, fechaFin, page = 1, limit = 50 } = req.query;

    const where: any = {};

    if (entidad) {
      where.entidad = entidad;
    }

    if (accion) {
      where.accion = accion;
    }

    if (fechaInicio && fechaFin) {
      where.fecha = {
        [Op.between]: [new Date(fechaInicio as string), new Date(fechaFin as string)]
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: auditorias } = await Auditoria.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['fecha', 'DESC']]
    });

    res.json({
      auditorias,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener auditorías' });
  }
};

export const getAuditoriasByUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: auditorias } = await Auditoria.findAndCountAll({
      where: { usuarioId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['fecha', 'DESC']]
    });

    res.json({
      auditorias,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener auditorías del usuario' });
  }
};

export const getAuditoriasByEntidad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entidad, entidadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: auditorias } = await Auditoria.findAndCountAll({
      where: {
        entidad,
        entidadId
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'rol']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['fecha', 'DESC']]
    });

    res.json({
      auditorias,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener auditorías de la entidad' });
  }
};

// Función helper para crear registros de auditoría
export const crearAuditoria = async (
  usuarioId: number,
  accion: string,
  entidad: string,
  entidadId: number | null,
  detalles: string,
  ipAddress?: string
): Promise<void> => {
  try {
    await Auditoria.create({
      usuarioId,
      accion,
      entidad,
      entidadId: entidadId ?? undefined,
      detalles,
      ipAddress,
      fecha: new Date()
    });
  } catch (error) {
    console.error('Error al crear registro de auditoría:', error);
  }
};
