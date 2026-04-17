import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Producto from '../models/Producto';
import Categoria from '../models/Categoria';
import Proveedor from '../models/Proveedor';
import Inventario from '../models/Inventario';
import Almacen from '../models/Almacen';
import { AppError } from '../middleware/errorHandler';
import { getAccessibleWarehouseIds } from '../utils/warehouseAccess';
import { registrarAuditoria } from '../services/auditoriaService';

export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, categoriaId, proveedorId, page = 1, limit = 50 } = req.query;
    const where: any = {};
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { codigo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    if (accessibleWarehouseIds !== null && !accessibleWarehouseIds.length) {
      res.json({
        productos: [],
        total: 0,
        page: Number(page),
        totalPages: 0
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const inventarioInclude: any = {
      model: Inventario,
      as: 'inventarios',
      include: [{ model: Almacen, as: 'almacen' }]
    };

    if (accessibleWarehouseIds !== null) {
      inventarioInclude.required = true;
      inventarioInclude.where = { almacenId: { [Op.in]: accessibleWarehouseIds } };
    }

    const { count, rows: productos } = await Producto.findAndCountAll({
      where,
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Proveedor, as: 'proveedor' },
        inventarioInclude
      ],
      distinct: true,
      limit: Number(limit),
      offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      productos,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getProductoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);
    const inventarioInclude: any = {
      model: Inventario,
      as: 'inventarios',
      include: [{ model: Almacen, as: 'almacen' }]
    };

    if (accessibleWarehouseIds !== null) {
      inventarioInclude.required = true;
      inventarioInclude.where = { almacenId: { [Op.in]: accessibleWarehouseIds } };
    }

    const producto = await Producto.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Proveedor, as: 'proveedor' },
        inventarioInclude
      ]
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    res.json(producto);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }
};

export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const producto = await Producto.create(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'CREAR',
      entidad: 'productos',
      entidadId: producto.id,
      detalles: `Se creó producto ${producto.nombre} (${producto.codigo})`
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (accessibleWarehouseIds !== null) {
      const warehouseAccessCount = await Inventario.count({
        where: {
          productoId: id,
          almacenId: { [Op.in]: accessibleWarehouseIds }
        }
      });

      if (!warehouseAccessCount) {
        throw new AppError('No tienes permisos para editar este producto', 403);
      }
    }

    await producto.update(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR',
      entidad: 'productos',
      entidadId: producto.id,
      detalles: `Se actualizó producto ${producto.nombre}. Campos: ${Object.keys(req.body || {}).join(', ') || 'sin cambios explícitos'}`
    });
    res.json(producto);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }
};

export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds((req as any).usuario);
    const producto = await Producto.findByPk(id);

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (accessibleWarehouseIds !== null) {
      const warehouseAccessCount = await Inventario.count({
        where: {
          productoId: id,
          almacenId: { [Op.in]: accessibleWarehouseIds }
        }
      });

      if (!warehouseAccessCount) {
        throw new AppError('No tienes permisos para eliminar este producto', 403);
      }
    }

    await producto.update({ estado: false });
    await registrarAuditoria({
      req: req as any,
      accion: 'ELIMINAR',
      entidad: 'productos',
      entidadId: producto.id,
      detalles: `Se desactivó producto ${producto.nombre} (${producto.codigo})`
    });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
};
