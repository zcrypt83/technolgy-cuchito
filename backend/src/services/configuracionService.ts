import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type RolSistema = 'administrador' | 'encargado_almacen' | 'usuario_operativo';

export interface ConfiguracionAdmin {
  rolePermissions: Record<RolSistema, string[]>;
  auditEnabledActions: string[];
  updatedAt: string;
}

export const PERMISSION_CATALOG = [
  'usuarios.ver',
  'usuarios.crear',
  'usuarios.editar',
  'usuarios.eliminar',
  'productos.ver',
  'productos.crear',
  'productos.editar',
  'productos.eliminar',
  'almacenes.ver',
  'almacenes.crear',
  'almacenes.editar',
  'almacenes.eliminar',
  'inventario.ver',
  'inventario.entrada',
  'inventario.salida',
  'inventario.transferencia',
  'inventario.ajuste',
  'reportes.ver',
  'reportes.todos',
  'reportes.operativos',
  'reportes.basicos',
  'dashboard.ejecutivo',
  'dashboard.almacen',
  'dashboard.basico',
  'auditoria.ver',
  'configuracion.editar'
] as const;

export const AUDIT_ACTION_CATALOG = [
  'LOGIN',
  'CREAR',
  'ACTUALIZAR',
  'ELIMINAR',
  'CAMBIO_PASSWORD',
  'CONFIGURACION_PERMISOS',
  'CONFIGURACION_ACCIONES',
  'ACTUALIZAR_INVENTARIO',
  'CREAR_MOVIMIENTO'
] as const;

const DEFAULT_SETTINGS: ConfiguracionAdmin = {
  rolePermissions: {
    administrador: [
      'usuarios.ver',
      'usuarios.crear',
      'usuarios.editar',
      'usuarios.eliminar',
      'productos.ver',
      'productos.crear',
      'productos.editar',
      'productos.eliminar',
      'almacenes.ver',
      'almacenes.crear',
      'almacenes.editar',
      'almacenes.eliminar',
      'inventario.ver',
      'inventario.entrada',
      'inventario.salida',
      'inventario.transferencia',
      'inventario.ajuste',
      'reportes.ver',
      'reportes.todos',
      'dashboard.ejecutivo',
      'auditoria.ver',
      'configuracion.editar'
    ],
    encargado_almacen: [
      'productos.ver',
      'productos.crear',
      'productos.editar',
      'almacenes.ver',
      'inventario.ver',
      'inventario.entrada',
      'inventario.salida',
      'inventario.transferencia',
      'inventario.ajuste',
      'reportes.ver',
      'reportes.operativos',
      'dashboard.almacen'
    ],
    usuario_operativo: [
      'productos.ver',
      'inventario.ver',
      'inventario.salida',
      'reportes.ver',
      'reportes.basicos',
      'dashboard.basico'
    ]
  },
  auditEnabledActions: [...AUDIT_ACTION_CATALOG],
  updatedAt: new Date().toISOString()
};

const roleList: RolSistema[] = ['administrador', 'encargado_almacen', 'usuario_operativo'];

const settingsPath = fileURLToPath(
  new URL('../../config/admin-settings.json', import.meta.url)
);

const dedupeAndSort = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

const sanitizeRolePermissions = (candidate?: Record<string, unknown>): Record<RolSistema, string[]> => {
  const catalog = new Set<string>(PERMISSION_CATALOG);
  const sanitized: Record<RolSistema, string[]> = {
    administrador: [],
    encargado_almacen: [],
    usuario_operativo: []
  };

  roleList.forEach((role) => {
    const raw = candidate?.[role];
    const asArray = Array.isArray(raw) ? raw : [];
    sanitized[role] = dedupeAndSort(
      asArray
        .map((permission) => String(permission || '').trim())
        .filter((permission) => permission && catalog.has(permission))
    );
  });

  return sanitized;
};

const sanitizeAuditActions = (actions?: unknown): string[] => {
  const catalog = new Set<string>(AUDIT_ACTION_CATALOG);
  const asArray = Array.isArray(actions) ? actions : [];
  return dedupeAndSort(
    asArray
      .map((action) => String(action || '').trim().toUpperCase())
      .filter((action) => action && catalog.has(action as (typeof AUDIT_ACTION_CATALOG)[number]))
  );
};

const sanitizeSettings = (candidate?: Partial<ConfiguracionAdmin>): ConfiguracionAdmin => {
  const rolePermissions = sanitizeRolePermissions(candidate?.rolePermissions as Record<string, unknown>);
  const auditEnabledActions = sanitizeAuditActions(candidate?.auditEnabledActions);

  return {
    rolePermissions,
    auditEnabledActions: auditEnabledActions.length ? auditEnabledActions : [...AUDIT_ACTION_CATALOG],
    updatedAt: candidate?.updatedAt || new Date().toISOString()
  };
};

const ensureSettingsFile = async (): Promise<void> => {
  const dir = path.dirname(settingsPath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(settingsPath);
  } catch {
    const content = JSON.stringify(DEFAULT_SETTINGS, null, 2);
    await fs.writeFile(settingsPath, content, 'utf-8');
  }
};

export const getConfiguracionAdmin = async (): Promise<ConfiguracionAdmin> => {
  await ensureSettingsFile();

  try {
    const raw = await fs.readFile(settingsPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ConfiguracionAdmin>;
    const sanitized = sanitizeSettings(parsed);

    // Si el archivo tenía datos inválidos, lo normalizamos.
    if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
      await fs.writeFile(settingsPath, JSON.stringify(sanitized, null, 2), 'utf-8');
    }

    return sanitized;
  } catch {
    await fs.writeFile(settingsPath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveConfiguracionAdmin = async (
  partial: Partial<Pick<ConfiguracionAdmin, 'rolePermissions' | 'auditEnabledActions'>>
): Promise<ConfiguracionAdmin> => {
  const current = await getConfiguracionAdmin();
  const merged = sanitizeSettings({
    ...current,
    ...partial,
    updatedAt: new Date().toISOString()
  });

  await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
};

export const getPermisosPorRol = async (rol: string): Promise<string[]> => {
  const config = await getConfiguracionAdmin();
  const normalizedRole = roleList.includes(rol as RolSistema)
    ? (rol as RolSistema)
    : 'usuario_operativo';

  return config.rolePermissions[normalizedRole] || [];
};

