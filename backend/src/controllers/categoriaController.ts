import { Request, Response } from 'express';
import Categoria from '../models/Categoria';
import Producto from '../models/Producto';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { registrarAuditoria } from '../services/auditoriaService';

export const getCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, estado } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (estado !== undefined) {
      where.estado = estado === 'true';
    }

    const categorias = await Categoria.findAll({
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

    // Retornar categorías
    const categoriasConConteo = categorias.map(cat => ({
      ...cat.toJSON(),
      totalProductos: 0  // Se obtendría de una relación en el futuro
    }));

    res.json(categoriasConConteo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const getCategoriaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id, {
      include: [
        {
          model: Producto,
          as: 'productos'
        }
      ]
    });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    res.json(categoria);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener categoría' });
    }
  }
};

export const createCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoria = await Categoria.create(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'CREAR',
      entidad: 'categorias',
      entidadId: categoria.id,
      detalles: `Se creó categoría ${categoria.nombre}`
    });
    res.status(201).json(categoria);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'La categoría ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
};

export const updateCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    await categoria.update(req.body);
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR',
      entidad: 'categorias',
      entidadId: categoria.id,
      detalles: `Se actualizó categoría ${categoria.nombre}. Campos: ${Object.keys(req.body || {}).join(', ') || 'sin cambios explícitos'}`
    });
    res.json(categoria);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }
};

export const deleteCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    // Verificar si tiene productos asociados
    const productos = await Producto.count({ where: { categoriaId: id, estado: true } });

    if (productos > 0) {
      throw new AppError('No se puede eliminar una categoría con productos asociados', 400);
    }

    // Soft delete
    await categoria.update({ estado: false });
    await registrarAuditoria({
      req: req as any,
      accion: 'ELIMINAR',
      entidad: 'categorias',
      entidadId: categoria.id,
      detalles: `Se desactivó categoría ${categoria.nombre}`
    });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  }
};
