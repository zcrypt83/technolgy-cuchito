import { Request, Response } from 'express';
import Proveedor from '../models/Proveedor';
import Producto from '../models/Producto';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { registrarAuditoria } from '../services/auditoriaService';

export const getProveedores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, estado } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { ruc: { [Op.iLike]: `%${search}%` } },
        { contacto: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (estado !== undefined) {
      where.estado = estado === 'true';
    }

    const proveedores = await Proveedor.findAll({
      where,
      include: [
        {
          model: Producto,
          as: 'productos',
          attributes: ['id']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    // Retornar proveedores
    const proveedoresConConteo = proveedores.map(prov => ({
      ...prov.toJSON(),
      totalProductos: 0  // Se obtendría de una relación en el futuro
    }));

    res.json(proveedoresConConteo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const getProveedorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const proveedor = await Proveedor.findByPk(id, {
      include: [
        {
          model: Producto,
          as: 'productos'
        }
      ]
    });

    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404);
    }

    res.json(proveedor);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener proveedor' });
    }
  }
};

export const createProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const proveedor = await Proveedor.create(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'CREAR',
      entidad: 'proveedores',
      entidadId: proveedor.id,
      detalles: `Se creó proveedor ${proveedor.nombre} (RUC ${proveedor.ruc})`
    });
    res.status(201).json(proveedor);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El RUC ya está registrado' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Error al crear proveedor' });
    }
  }
};

export const updateProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404);
    }

    await proveedor.update(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR',
      entidad: 'proveedores',
      entidadId: proveedor.id,
      detalles: `Se actualizó proveedor ${proveedor.nombre}. Campos: ${Object.keys(req.body || {}).join(', ') || 'sin cambios explícitos'}`
    });
    res.json(proveedor);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El RUC ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
  }
};

export const deleteProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404);
    }

    // Verificar si tiene productos asociados
    const productos = await Producto.count({ where: { proveedorId: id, estado: true } });

    if (productos > 0) {
      throw new AppError('No se puede eliminar un proveedor con productos asociados', 400);
    }

    // Soft delete
    await proveedor.update({ estado: false });
    await registrarAuditoria({
      req: req as any,
      accion: 'ELIMINAR',
      entidad: 'proveedores',
      entidadId: proveedor.id,
      detalles: `Se desactivó proveedor ${proveedor.nombre} (RUC ${proveedor.ruc})`
    });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
  }
};
