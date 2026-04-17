import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import Usuario from '../models/Usuario';

export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    email: string;
    rol: string;
    almacenAsignadoId?: number | null;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Siempre tomar el rol real desde BD para evitar permisos inconsistentes con tokens antiguos.
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'email', 'rol', 'estado', 'almacenAsignadoId']
    });

    if (!usuario || !usuario.estado) {
      res.status(401).json({ error: 'Usuario no válido o inactivo' });
      return;
    }

    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol || 'usuario_operativo',
      almacenAsignadoId: usuario.almacenAsignadoId ?? null
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const checkRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
      return;
    }

    next();
  };
};
