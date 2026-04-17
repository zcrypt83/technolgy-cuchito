import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Inventario from '../models/Inventario';
import Producto from '../models/Producto';
import Almacen from '../models/Almacen';
import Categoria from '../models/Categoria';
import Proveedor from '../models/Proveedor';
import { AppError } from '../middleware/errorHandler';
import { canAccessWarehouse, getAccessibleWarehouseIds } from '../utils/warehouseAccess';
import { registrarAuditoria } from '../services/auditoriaService';

export const getInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { almacenId, search, page = 1, limit = 50 } = req.query;
    const where: any = {};
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);

    if (almacenId && !canAccessWarehouse(almacenId as string, accessibleWarehouseIds)) {
      throw new AppError('No tienes permisos para consultar ese almacén', 403);
    }

    if (accessibleWarehouseIds !== null) {
      if (!accessibleWarehouseIds.length) {
        res.json({ inventario: [], total: 0, page: Number(page), totalPages: 0 });
        return;
      }

      where.almacenId = almacenId
        ? Number(almacenId)
        : { [Op.in]: accessibleWarehouseIds };
    } else if (almacenId) {
      where.almacenId = almacenId;
    }

    const productoWhere: any = {};
    if (search) {
      productoWhere[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { codigo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: inventario } = await Inventario.findAndCountAll({
      where,
      include: [
        {
          model: Producto,
          as: 'producto',
          where: Object.keys(productoWhere).length > 0 ? productoWhere : undefined,
          include: [
            { model: Categoria, as: 'categoria' },
            { model: Proveedor, as: 'proveedor' }
          ]
        },
        { model: Almacen, as: 'almacen' }
      ],
      limit: Number(limit),
      offset,
      order: [['ultimaActualizacion', 'DESC']]
    });

    res.json({
      inventario,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener inventario' });
    }
  }
};

export const getInventarioByProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productoId } = req.params;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);
    const where: any = { productoId };

    if (accessibleWarehouseIds !== null) {
      if (!accessibleWarehouseIds.length) {
        res.json([]);
        return;
      }
      where.almacenId = { [Op.in]: accessibleWarehouseIds };
    }

    const inventario = await Inventario.findAll({
      where,
      include: [{ model: Almacen, as: 'almacen' }]
    });

    res.json(inventario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inventario del producto' });
  }
};

export const updateInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);

    const inventario = await Inventario.findByPk(id);

    if (!inventario) {
      throw new AppError('Registro de inventario no encontrado', 404);
    }

    if (!canAccessWarehouse(inventario.almacenId, accessibleWarehouseIds)) {
      throw new AppError('No tienes permisos para actualizar inventario de este almacén', 403);
    }

    await inventario.update({
      cantidad,
      ultimaActualizacion: new Date()
    });
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR_INVENTARIO',
      entidad: 'inventario',
      entidadId: inventario.id,
      detalles: `Se ajustó inventario. ProductoId=${inventario.productoId}, AlmacenId=${inventario.almacenId}, Cantidad=${cantidad}`
    });

    res.json(inventario);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar inventario' });
    }
  }
};
