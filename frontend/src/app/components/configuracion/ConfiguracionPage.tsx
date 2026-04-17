import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import * as api from '../../services/api';
import { useLiveData } from '../../hooks/useLiveData';

type RoleKey = 'administrador' | 'encargado_almacen' | 'usuario_operativo';

const roleOptions: { key: RoleKey; label: string }[] = [
  { key: 'administrador', label: 'Administrador' },
  { key: 'encargado_almacen', label: 'Encargado de Almacén' },
  { key: 'usuario_operativo', label: 'Usuario Operativo' },
];

export const ConfiguracionPage = () => {
  const [loading, setLoading] = useState(true);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingActions, setSavingActions] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleKey>('administrador');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [permissionsCatalog, setPermissionsCatalog] = useState<string[]>([]);
  const [auditActionCatalog, setAuditActionCatalog] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<RoleKey, string[]>>({
    administrador: [],
    encargado_almacen: [],
    usuario_operativo: [],
  });
  const [auditEnabledActions, setAuditEnabledActions] = useState<string[]>([]);

  const loadConfig = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.getConfiguracionAdmin();
      setPermissionsCatalog(Array.isArray(response.permissionsCatalog) ? response.permissionsCatalog : []);
      setAuditActionCatalog(Array.isArray(response.auditActionCatalog) ? response.auditActionCatalog : []);
      setAuditEnabledActions(Array.isArray(response.auditEnabledActions) ? response.auditEnabledActions : []);

      const backendRolePermissions = response.rolePermissions || {};
      setRolePermissions({
        administrador: Array.isArray(backendRolePermissions.administrador) ? backendRolePermissions.administrador : [],
        encargado_almacen: Array.isArray(backendRolePermissions.encargado_almacen) ? backendRolePermissions.encargado_almacen : [],
        usuario_operativo: Array.isArray(backendRolePermissions.usuario_operativo) ? backendRolePermissions.usuario_operativo : [],
      });
      setUpdatedAt(response.updatedAt || null);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar la configuración');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig(true);
  }, []);

  useLiveData(() => loadConfig(false), { pollMs: 20000 });

  const selectedRolePermissions = useMemo(
    () => new Set(rolePermissions[selectedRole] || []),
    [rolePermissions, selectedRole]
  );

  const togglePermission = (permission: string) => {
    setRolePermissions((current) => {
      const currentSet = new Set(current[selectedRole] || []);
      if (currentSet.has(permission)) {
        currentSet.delete(permission);
      } else {
        currentSet.add(permission);
      }

      return {
        ...current,
        [selectedRole]: [...currentSet].sort((a, b) => a.localeCompare(b)),
      };
    });
  };

  const toggleAuditAction = (action: string) => {
    setAuditEnabledActions((current) => {
      const currentSet = new Set(current);
      if (currentSet.has(action)) {
        currentSet.delete(action);
      } else {
        currentSet.add(action);
      }
      return [...currentSet].sort((a, b) => a.localeCompare(b));
    });
  };

  const savePermissions = async () => {
    try {
      setSavingPermissions(true);
      const response = await api.updateRolePermissions(rolePermissions);
      setUpdatedAt(response?.updatedAt || new Date().toISOString());
      toast.success('Permisos por rol actualizados');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar permisos');
    } finally {
      setSavingPermissions(false);
    }
  };

  const saveAuditActions = async () => {
    try {
      setSavingActions(true);
      const response = await api.updateAuditActions(auditEnabledActions);
      setUpdatedAt(response?.updatedAt || new Date().toISOString());
      toast.success('Acciones de auditoría actualizadas');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar acciones de auditoría');
    } finally {
      setSavingActions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración Administrativa</h1>
        <p className="text-gray-600 mt-1">
          Gestiona permisos por rol y acciones que se registran en auditoría.
        </p>
        {updatedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Última actualización: {format(new Date(updatedAt), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Permisos por Rol</CardTitle>
              <CardDescription>
                Selecciona un rol y activa/desactiva permisos del sistema.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <Button
                key={role.key}
                variant={selectedRole === role.key ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role.key)}
              >
                {role.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissionsCatalog.map((permission) => (
              <label
                key={permission}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedRolePermissions.has(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                />
                <span className="text-sm">{permission}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={savePermissions} disabled={savingPermissions}>
              {savingPermissions ? 'Guardando...' : 'Guardar permisos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <div>
              <CardTitle>Acciones Auditables</CardTitle>
              <CardDescription>
                Define qué acciones deben registrarse en el panel de auditoría.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {auditEnabledActions.map((action) => (
              <Badge key={action} variant="secondary">
                {action}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {auditActionCatalog.map((action) => (
              <label
                key={action}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={auditEnabledActions.includes(action)}
                  onCheckedChange={() => toggleAuditAction(action)}
                />
                <span className="text-sm">{action}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={saveAuditActions} disabled={savingActions}>
              {savingActions ? 'Guardando...' : 'Guardar acciones'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
