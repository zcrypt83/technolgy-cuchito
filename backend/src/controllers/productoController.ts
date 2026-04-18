import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Producto from '../models/Producto';
import Categoria from '../models/Categoria';
import Proveedor from '../models/Proveedor';
import Inventario from '../models/Inventario';
import Almacen from '../models/Almacen';
import { AppError } from '../middleware/errorHandler';
import sequelize from '../config/database';
import { canAccessWarehouse, getAccessibleWarehouseIds } from '../utils/warehouseAccess';
import { registrarAuditoria } from '../services/auditoriaService';

const parseOptionalNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStockPayload = (body: any) => {
  const stockRaw =
    body?.stockActual ??
    body?.stock_actual ??
    body?.stockInicial ??
    body?.stock_inicial;

  const almacenRaw = body?.almacenId ?? body?.almacen_id;

  const stock = parseOptionalNumber(stockRaw);
  const almacenId = parseOptionalNumber(almacenRaw);

  return {
    stock,
    almacenId,
    hasStockField:
      stockRaw !== undefined ||
      body?.stock_actual !== undefined ||
      body?.stockInicial !== undefined ||
      body?.stock_inicial !== undefined
  };
};

const extractProductoPayload = (body: any) => ({
  codigo: body?.codigo,
  nombre: body?.nombre,
  descripcion: body?.descripcion,
  categoriaId: body?.categoriaId,
  proveedorId: body?.proveedorId,
  precioCompra: body?.precioCompra,
  precioVenta: body?.precioVenta,
  unidadMedida: body?.unidadMedida ?? 'unidad',
  stockMinimo: body?.stockMinimo,
  stockMaximo: body?.stockMaximo,
  imagen: body?.imagen,
  estado: body?.estado
});

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
  const transaction = await sequelize.transaction();

  try {
    const reqAny = req as any;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds(reqAny.usuario);
    const { stock, almacenId, hasStockField } = normalizeStockPayload(req.body);
    const productoPayload = extractProductoPayload(req.body);

    if (hasStockField && (stock === null || !Number.isInteger(stock) || stock < 0)) {
      throw new AppError('El stock debe ser un número entero mayor o igual a 0', 400);
    }

    if (almacenId !== null && (!Number.isInteger(almacenId) || almacenId < 1)) {
      throw new AppError('Almacén inválido para registrar stock', 400);
    }

    let warehouseForStock = almacenId;

    if (warehouseForStock === null && hasStockField && stock !== null && stock > 0) {
      if (accessibleWarehouseIds && accessibleWarehouseIds.length === 1) {
        warehouseForStock = accessibleWarehouseIds[0];
      } else {
        throw new AppError('Selecciona un almacén para registrar stock inicial', 400);
      }
    }

    if (warehouseForStock !== null && !canAccessWarehouse(warehouseForStock, accessibleWarehouseIds)) {
      throw new AppError('No tienes permisos sobre el almacén seleccionado', 403);
    }

    const producto = await Producto.create(productoPayload as any, { transaction });

    if (warehouseForStock !== null) {
      const [inventario] = await Inventario.findOrCreate({
        where: { productoId: producto.id, almacenId: warehouseForStock },
        defaults: {
          productoId: producto.id,
          almacenId: warehouseForStock,
          cantidad: 0,
          ultimaActualizacion: new Date()
        },
        transaction
      });

      if (hasStockField && stock !== null) {
        await inventario.update(
          {
            cantidad: stock,
            ultimaActualizacion: new Date()
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    await registrarAuditoria({
      req: reqAny,
      accion: 'CREAR',
      entidad: 'productos',
      entidadId: producto.id,
      detalles: `Se creó producto ${producto.nombre} (${producto.codigo})${warehouseForStock ? ` con stock ${stock ?? 0} en almacén ${warehouseForStock}` : ''}`
    });
    res.status(201).json(producto);
  } catch (error: any) {
    if (!(transaction as any).finished) {
      await transaction.rollback();
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
};

export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const reqAny = req as any;
    const accessibleWarehouseIds = await getAccessibleWarehouseIds(reqAny.usuario);
    const { stock, almacenId, hasStockField } = normalizeStockPayload(req.body);
    const producto = await Producto.findByPk(id, { transaction });

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

    if (hasStockField && (stock === null || !Number.isInteger(stock) || stock < 0)) {
      throw new AppError('El stock debe ser un número entero mayor o igual a 0', 400);
    }

    let warehouseForStock = almacenId;

    if (warehouseForStock === null && hasStockField) {
      if (accessibleWarehouseIds && accessibleWarehouseIds.length === 1) {
        warehouseForStock = accessibleWarehouseIds[0];
      } else {
        throw new AppError('Selecciona un almacén para actualizar stock', 400);
      }
    }

    if (warehouseForStock !== null && !canAccessWarehouse(warehouseForStock, accessibleWarehouseIds)) {
      throw new AppError('No tienes permisos sobre el almacén seleccionado', 403);
    }

    const productoPayload = extractProductoPayload(req.body);
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(productoPayload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(fieldsToUpdate).length > 0) {
      await producto.update(fieldsToUpdate, { transaction });
    }

    if (hasStockField && warehouseForStock !== null && stock !== null) {
      const [inventario] = await Inventario.findOrCreate({
        where: { productoId: producto.id, almacenId: warehouseForStock },
        defaults: {
          productoId: producto.id,
          almacenId: warehouseForStock,
          cantidad: 0,
          ultimaActualizacion: new Date()
        },
        transaction
      });

      await inventario.update(
        {
          cantidad: stock,
          ultimaActualizacion: new Date()
        },
        { transaction }
      );
    }

    await transaction.commit();

    await registrarAuditoria({
      req: reqAny,
      accion: 'ACTUALIZAR',
      entidad: 'productos',
      entidadId: producto.id,
      detalles: `Se actualizó producto ${producto.nombre}. Campos: ${Object.keys(req.body || {}).join(', ') || 'sin cambios explícitos'}${hasStockField ? `; stock=${stock} almacén=${warehouseForStock}` : ''}`
    });
    res.json(producto);
  } catch (error: any) {
    if (!(transaction as any).finished) {
      await transaction.rollback();
    }

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
