import { Response } from 'express';
import {
  AUDIT_ACTION_CATALOG,
  PERMISSION_CATALOG,
  getConfiguracionAdmin,
  getPermisosPorRol,
  saveConfiguracionAdmin
} from '../services/configuracionService';
import { registrarAuditoria } from '../services/auditoriaService';

export const getConfiguracionAdminPanel = async (req: any, res: Response): Promise<void> => {
  try {
    const config = await getConfiguracionAdmin();
    res.json({
      ...config,
      permissionsCatalog: PERMISSION_CATALOG,
      auditActionCatalog: AUDIT_ACTION_CATALOG
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

export const getPermisosRolActual = async (req: any, res: Response): Promise<void> => {
  try {
    const role = String(req.usuario?.rol || 'usuario_operativo');
    const permissions = await getPermisosPorRol(role);
    res.json({ role, permissions });
  } catch {
    res.status(500).json({ error: 'Error al obtener permisos del rol' });
  }
};

export const updateRolePermissions = async (req: any, res: Response): Promise<void> => {
  try {
    const rolePermissions = req.body?.rolePermissions;
    const updated = await saveConfiguracionAdmin({ rolePermissions });

    await registrarAuditoria({
      req,
      accion: 'CONFIGURACION_PERMISOS',
      entidad: 'configuracion',
      detalles: 'Se actualizó la configuración de permisos por rol',
      force: true
    });

    res.json({
      rolePermissions: updated.rolePermissions,
      updatedAt: updated.updatedAt
    });
  } catch {
    res.status(400).json({ error: 'No se pudo actualizar los permisos por rol' });
  }
};

export const updateAuditActions = async (req: any, res: Response): Promise<void> => {
  try {
    const auditEnabledActions = req.body?.auditEnabledActions;
    const updated = await saveConfiguracionAdmin({ auditEnabledActions });

    await registrarAuditoria({
      req,
      accion: 'CONFIGURACION_ACCIONES',
      entidad: 'configuracion',
      detalles: `Se actualizó la lista de acciones auditables: ${updated.auditEnabledActions.join(', ')}`,
      force: true
    });

    res.json({
      auditEnabledActions: updated.auditEnabledActions,
      updatedAt: updated.updatedAt
    });
  } catch {
    res.status(400).json({ error: 'No se pudo actualizar las acciones auditables' });
  }
};

