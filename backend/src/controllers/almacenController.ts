import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import Almacen from '../models/Almacen';
import Usuario from '../models/Usuario';
import Inventario from '../models/Inventario';
import { AppError } from '../middleware/errorHandler';
import { canAccessWarehouse, getAccessibleWarehouseIds } from '../utils/warehouseAccess';
import { registrarAuditoria } from '../services/auditoriaService';

const normalizeEncargadoId = (payload: any): number | null => {
  const rawValue = payload?.encargadoId ?? payload?.encargado_id;

  if (rawValue === undefined || rawValue === null || rawValue === '' || Number(rawValue) === 0) {
    return null;
  }

  return Number(rawValue);
};

const validateEncargado = async (
  encargadoId: number,
  currentAlmacenId: number | null,
  transaction?: Transaction
) => {
  const usuarioEncargado = await Usuario.findByPk(encargadoId, { transaction });

  if (!usuarioEncargado || !usuarioEncargado.estado) {
    throw new AppError('El encargado seleccionado no existe o está inactivo', 400);
  }

  if (usuarioEncargado.rol !== 'encargado_almacen') {
    throw new AppError('Solo usuarios con rol encargado_almacen pueden ser encargados', 400);
  }

  const almacenConMismoEncargado = await Almacen.findOne({
    where: {
      encargadoId,
      ...(currentAlmacenId ? { id: { [Op.ne]: currentAlmacenId } } : {})
    },
    transaction
  });

  if (almacenConMismoEncargado) {
    throw new AppError('Este encargado ya está asignado a otro almacén', 400);
  }
};

export const getAlmacenes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, estado } = req.query;
    const where: any = {};
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { codigo: { [Op.iLike]: `%${search}%` } },
        { ciudad: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (estado !== undefined) {
      where.estado = estado === 'true';
    }

    if (accessibleWarehouseIds !== null) {
      if (!accessibleWarehouseIds.length) {
        res.json([]);
        return;
      }
      where.id = { [Op.in]: accessibleWarehouseIds };
    }

    const almacenes = await Almacen.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'encargado',
          attributes: ['id', 'nombre', 'email', 'telefono']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json(almacenes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener almacenes' });
  }
};

export const getAlmacenById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);

    if (!canAccessWarehouse(id, accessibleWarehouseIds)) {
      throw new AppError('No tienes permisos para acceder a este almacén', 403);
    }

    const almacen = await Almacen.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'encargado',
          attributes: ['id', 'nombre', 'email', 'telefono']
        },
        {
          model: Inventario,
          as: 'inventarios'
        }
      ]
    });

    if (!almacen) {
      throw new AppError('Almacén no encontrado', 404);
    }

    res.json(almacen);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener almacén' });
    }
  }
};

export const createAlmacen = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const payload = { ...req.body };
    const encargadoId = normalizeEncargadoId(payload);
    payload.encargadoId = encargadoId;
    delete payload.encargado_id;

    if (encargadoId) {
      await validateEncargado(encargadoId, null, transaction);
    }

    const almacen = await Almacen.create(payload, { transaction });

    if (encargadoId) {
      await Usuario.update(
        { almacenAsignadoId: almacen.id },
        { where: { id: encargadoId }, transaction }
      );
    }

    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'CREAR',
      entidad: 'almacenes',
      entidadId: almacen.id,
      detalles: `Se creó almacén ${almacen.nombre} (${almacen.codigo})`
    });

    res.status(201).json(almacen);
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El código de almacén ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear almacén' });
    }
  }
};

export const updateAlmacen = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const almacen = await Almacen.findByPk(id, { transaction });

    if (!almacen) {
      throw new AppError('Almacén no encontrado', 404);
    }

    const payload = { ...req.body };
    const newEncargadoId = normalizeEncargadoId(payload);
    payload.encargadoId = newEncargadoId;
    delete payload.encargado_id;

    if (newEncargadoId) {
      await validateEncargado(newEncargadoId, almacen.id, transaction);
    }

    const oldEncargadoId = almacen.encargadoId ?? null;

    await almacen.update(payload, { transaction });

    if (oldEncargadoId && oldEncargadoId !== newEncargadoId) {
      await Usuario.update(
        { almacenAsignadoId: null },
        {
          where: {
            id: oldEncargadoId,
            rol: 'encargado_almacen',
            almacenAsignadoId: almacen.id
          },
          transaction
        }
      );
    }

    if (newEncargadoId) {
      await Usuario.update(
        { almacenAsignadoId: almacen.id },
        { where: { id: newEncargadoId }, transaction }
      );
    }

    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR',
      entidad: 'almacenes',
      entidadId: almacen.id,
      detalles: `Se actualizó almacén ${almacen.nombre}. Campos: ${Object.keys(req.body || {}).join(', ') || 'sin cambios explícitos'}`
    });
    res.json(almacen);
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El código de almacén ya existe' });
    } else {
      res.status(500).json({ error: 'Error al actualizar almacén' });
    }
  }
};

export const deleteAlmacen = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const almacen = await Almacen.findByPk(id, { transaction });

    if (!almacen) {
      throw new AppError('Almacén no encontrado', 404);
    }

    if (almacen.encargadoId) {
      await Usuario.update(
        { almacenAsignadoId: null },
        {
          where: {
            id: almacen.encargadoId,
            rol: 'encargado_almacen',
            almacenAsignadoId: almacen.id
          },
          transaction
        }
      );
    }

    await almacen.update({ estado: false, encargadoId: null }, { transaction });
    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'ELIMINAR',
      entidad: 'almacenes',
      entidadId: almacen.id,
      detalles: `Se desactivó almacén ${almacen.nombre} (${almacen.codigo})`
    });

    res.json({ message: 'Almacén eliminado correctamente' });
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar almacén' });
    }
  }
};
