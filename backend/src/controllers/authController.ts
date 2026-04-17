import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Op } from 'sequelize';
import Usuario from '../models/Usuario';
import { config } from '../config/config';
import { AppError } from '../middleware/errorHandler';
import { registrarAuditoria } from '../services/auditoriaService';

const normalizeEmail = (email: unknown): string => String(email ?? '').trim().toLowerCase();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    const usuario = await Usuario.findOne({
      where: {
        email: {
          [Op.iLike]: normalizedEmail
        }
      }
    });

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!usuario.estado) {
      throw new AppError('Usuario inactivo', 403);
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const jwtOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as SignOptions['expiresIn']
    };

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      config.jwt.secret,
      jwtOptions
    );
    await registrarAuditoria({
      req,
      usuarioId: usuario.id,
      accion: 'LOGIN',
      entidad: 'auth',
      entidadId: usuario.id,
      detalles: `Inicio de sesión exitoso de ${usuario.email}`
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono
      }
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol, telefono } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedNombre = String(nombre ?? '').trim();

    if (!normalizedNombre || !normalizedEmail || !password) {
      throw new AppError('Nombre, email y contraseña son requeridos', 400);
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        email: {
          [Op.iLike]: normalizedEmail
        }
      }
    });

    if (usuarioExistente) {
      throw new AppError('El email ya está registrado', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre: normalizedNombre,
      email: normalizedEmail,
      password: hashedPassword,
      rol: rol || 'usuario_operativo',
      telefono,
      estado: true
    });

    const jwtOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn as SignOptions['expiresIn']
    };

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      config.jwt.secret,
      jwtOptions
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono
      }
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json(usuario);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};
