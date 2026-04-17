import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import Usuario from '../models/Usuario';
import Almacen from '../models/Almacen';
import { AppError } from '../middleware/errorHandler';
import { registrarAuditoria } from '../services/auditoriaService';

type UserRole = 'administrador' | 'encargado_almacen' | 'usuario_operativo';

const normalizeAlmacenAsignadoId = (payload: any): number | null => {
  const rawValue = payload?.almacenAsignadoId ?? payload?.almacen_asignado_id;

  if (rawValue === undefined || rawValue === null || rawValue === '' || Number(rawValue) === 0) {
    return null;
  }

  return Number(rawValue);
};

const validateWarehouseAssignment = async (
  rol: UserRole,
  almacenAsignadoId: number | null,
  usuarioIdToExclude?: number
) => {
  if (rol === 'administrador') {
    return;
  }

  // En desarrollo, permitir usuarios sin almacén. En producción, ser más estricto.
  if (!almacenAsignadoId && process.env.NODE_ENV === 'production') {
    throw new AppError('Debes asignar un almacén para este rol', 400);
  }

  // Validar almacén si se proporciona uno
  if (!almacenAsignadoId) {
    return;
  }

  const almacen = await Almacen.findByPk(almacenAsignadoId);

  if (!almacen || !almacen.estado) {
    throw new AppError('El almacén asignado no existe o está inactivo', 400);
  }

  if (rol === 'encargado_almacen') {
    const encargadoExistente = await Usuario.findOne({
      where: {
        rol: 'encargado_almacen',
        estado: true,
        almacenAsignadoId,
        ...(usuarioIdToExclude ? { id: { [Op.ne]: usuarioIdToExclude } } : {})
      }
    });

    if (encargadoExistente) {
      throw new AppError('Ese almacén ya tiene un encargado asignado', 400);
    }
  }
};

const syncWarehouseManager = async (
  usuarioId: number,
  rol: UserRole,
  almacenAsignadoId: number | null,
  transaction?: any
) => {
  await Almacen.update(
    { encargadoId: null },
    { where: { encargadoId: usuarioId }, transaction }
  );

  if (rol === 'encargado_almacen' && almacenAsignadoId) {
    await Almacen.update(
      { encargadoId: usuarioId },
      { where: { id: almacenAsignadoId }, transaction }
    );
  }
};

export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, rol, estado } = req.query;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (rol) {
      where.rol = rol;
    }

    if (estado !== undefined) {
      where.estado = estado === 'true';
    }

    const usuarios = await Usuario.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Almacen,
          as: 'almacenes',
          attributes: ['id', 'nombre', 'codigo', 'ciudad']
        },
        {
          model: Almacen,
          as: 'almacenAsignado',
          attributes: ['id', 'nombre', 'codigo', 'ciudad']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Almacen,
          as: 'almacenes',
          attributes: ['id', 'nombre', 'codigo', 'ciudad']
        },
        {
          model: Almacen,
          as: 'almacenAsignado',
          attributes: ['id', 'nombre', 'codigo', 'ciudad']
        }
      ]
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json(usuario);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }
};

export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { password, ...userData } = req.body;
    const rol = (userData.rol || 'usuario_operativo') as UserRole;
    const almacenAsignadoId = normalizeAlmacenAsignadoId(userData);

    if (!password) {
      throw new AppError('La contraseña es requerida', 400);
    }

    await validateWarehouseAssignment(rol, almacenAsignadoId);

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create(
      {
        ...userData,
        password: hashedPassword,
        rol,
        almacenAsignadoId: rol === 'administrador' ? null : almacenAsignadoId
      },
      { transaction }
    );

    await syncWarehouseManager(
      usuario.id,
      rol,
      rol === 'administrador' ? null : almacenAsignadoId,
      transaction
    );

    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'CREAR',
      entidad: 'usuarios',
      entidadId: usuario.id,
      detalles: `Se creó usuario ${usuario.email} con rol ${rol}`
    });

    const { password: _, ...usuarioSinPassword } = usuario.toJSON();
    res.status(201).json(usuarioSinPassword);
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
};

export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { password, ...userData } = req.body;

    const usuario = await Usuario.findByPk(id, { transaction });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const rol = (userData.rol || usuario.rol) as UserRole;
    const requestedWarehouseId = normalizeAlmacenAsignadoId(userData);
    const almacenAsignadoId = rol === 'administrador'
      ? null
      : (requestedWarehouseId ?? usuario.almacenAsignadoId ?? null);

    await validateWarehouseAssignment(rol, almacenAsignadoId, usuario.id);

    let updateData: any = {
      ...userData,
      rol,
      almacenAsignadoId
    };

    if (rol === 'administrador') {
      updateData.almacenAsignadoId = null;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await usuario.update(updateData, { transaction });

    await syncWarehouseManager(usuario.id, rol, updateData.almacenAsignadoId, transaction);

    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'ACTUALIZAR',
      entidad: 'usuarios',
      entidadId: usuario.id,
      detalles: `Se actualizó usuario ${usuario.email}. Campos: ${Object.keys(userData).join(', ') || 'sin cambios explícitos'}`
    });

    const { password: _, ...usuarioSinPassword } = usuario.toJSON();
    res.json(usuarioSinPassword);
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'El email ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
};

export const deleteUsuario = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, { transaction });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await syncWarehouseManager(usuario.id, 'administrador', null, transaction);

    await usuario.update(
      { estado: false, almacenAsignadoId: null },
      { transaction }
    );

    await transaction.commit();
    await registrarAuditoria({
      req: req as any,
      accion: 'ELIMINAR',
      entidad: 'usuarios',
      entidadId: usuario.id,
      detalles: `Se desactivó usuario ${usuario.email}`
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    await transaction.rollback();

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
};

export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'administrador') {
      throw new AppError('No tienes permisos para cambiar esta contraseña', 403);
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isValidPassword = await bcrypt.compare(oldPassword, usuario.password);
    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await usuario.update({ password: hashedPassword });
    await registrarAuditoria({
      req,
      accion: 'CAMBIO_PASSWORD',
      entidad: 'usuarios',
      entidadId: usuario.id,
      detalles: `Se actualizó contraseña para usuario ${usuario.email}`
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  }
};
