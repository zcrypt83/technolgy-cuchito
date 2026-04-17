import { Request } from 'express';
import Auditoria from '../models/Auditoria';
import { getConfiguracionAdmin } from './configuracionService';

const resolveIpAddress = (req?: Request): string | undefined => {
  if (!req) return undefined;

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.ip || undefined;
};

interface AuditoriaInput {
  req?: Request;
  usuarioId?: number;
  accion: string;
  entidad: string;
  entidadId?: number | null;
  detalles?: string;
  force?: boolean;
}

export const registrarAuditoria = async ({
  req,
  usuarioId,
  accion,
  entidad,
  entidadId,
  detalles,
  force = false
}: AuditoriaInput): Promise<void> => {
  try {
    const idUsuario = usuarioId ?? Number((req as any)?.usuario?.id);
    if (!idUsuario) {
      return;
    }

    const normalizedAction = String(accion || '').trim().toUpperCase();
    if (!normalizedAction) {
      return;
    }

    if (!force) {
      const config = await getConfiguracionAdmin();
      const enabledSet = new Set(config.auditEnabledActions.map((item) => item.toUpperCase()));
      if (!enabledSet.has(normalizedAction)) {
        return;
      }
    }

    await Auditoria.create({
      usuarioId: idUsuario,
      accion: normalizedAction,
      entidad: String(entidad || 'sistema').trim().toLowerCase(),
      entidadId: entidadId ?? undefined,
      detalles: detalles ? String(detalles).slice(0, 5000) : undefined,
      ipAddress: resolveIpAddress(req),
      fecha: new Date()
    });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
};

