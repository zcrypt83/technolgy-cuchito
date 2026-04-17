import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Usuario, Rol } from '../types';
import * as api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [rolePermissionsConfig, setRolePermissionsConfig] = useState<Record<string, string[]> | null>(null);

  const defaultPermissions = {
    ADMINISTRADOR: [
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
      'configuracion.editar',
    ],
    ENCARGADO_ALMACEN: [
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
      'dashboard.almacen',
    ],
    USUARIO_OPERATIVO: [
      'productos.ver',
      'inventario.ver',
      'inventario.salida',
      'reportes.ver',
      'reportes.basicos',
      'dashboard.basico',
    ],
  };

  const getLoginErrorMessage = (error: unknown): string => {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (
      normalized.includes('failed to fetch') ||
      normalized.includes('networkerror') ||
      normalized.includes('load failed')
    ) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.';
    }

    if (normalized.includes('credenciales inválidas') || normalized.includes('credenciales invalidas')) {
      return 'Email o contraseña incorrectos';
    }

    if (normalized.includes('usuario inactivo')) {
      return 'Tu usuario está inactivo. Contacta al administrador.';
    }

    return message || 'Error al iniciar sesión';
  };

  const mapApiUserToUsuario = (userProfile: any): Usuario => ({
    id: userProfile.id,
    nombre: userProfile.nombre,
    email: userProfile.email,
    rol: userProfile.rol || 'usuario_operativo',
    telefono: userProfile.telefono,
    estado: userProfile.estado,
    activo: userProfile.estado,
    almacen_asignado_id: userProfile.almacen_asignado_id ?? null,
  });

  const loadRolePermissions = async () => {
    try {
      const permissionsResponse = await api.getRolePermissions();
      const normalizedRole = String(permissionsResponse?.role || 'usuario_operativo').toUpperCase();
      const permissions = Array.isArray(permissionsResponse?.permissions) ? permissionsResponse.permissions : [];

      setRolePermissionsConfig((prev) => ({
        ...(prev || {}),
        [normalizedRole]: permissions,
      }));
    } catch {
      // Mantener fallback local si falla endpoint de configuración.
      setRolePermissionsConfig(null);
    }
  };

  // Cargar usuario desde localStorage y verificar sesión
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verificar token y usar perfil real del backend
          const userProfile = await api.getProfile();
          const usuarioAuth = mapApiUserToUsuario(userProfile);
          setUsuario(usuarioAuth);
          localStorage.setItem('usuario', JSON.stringify(usuarioAuth));
          await loadRolePermissions();
        } catch (error) {
          // Token inválido o expirado, limpiar sesión
          console.error('Sesión inválida, cerrando sesión:', error);
          logout();
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Evita conservar sesión anterior (por ejemplo admin) si el nuevo login falla.
      logout();

      // Llamar al API real de backend
      const response = await api.login(normalizedEmail, password);

      // Guardar token JWT
      localStorage.setItem('token', response.token);

      // Obtener perfil del usuario autenticado
      const userProfile = await api.getProfile();
      const usuarioAuth = mapApiUserToUsuario(userProfile);

      setUsuario(usuarioAuth);
      localStorage.setItem('usuario', JSON.stringify(usuarioAuth));
      await loadRolePermissions();

      return true;
    } catch (error) {
      logout();
      const errorMessage = getLoginErrorMessage(error);

      if (errorMessage === 'Email o contraseña incorrectos') {
        return false;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUsuario(null);
    setRolePermissionsConfig(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!usuario) return false;

    const permissionAlias: Record<string, string> = {
      'inventario.transferir': 'inventario.transferencia',
    };

    const normalizedPermission = permissionAlias[permission] || permission;

    const normalizedRole = String(usuario.rol || 'usuario_operativo').toUpperCase() as keyof typeof defaultPermissions;
    const configuredPermissions = rolePermissionsConfig?.[normalizedRole];
    const rolePermissions = configuredPermissions?.length ? configuredPermissions : defaultPermissions[normalizedRole];

    return rolePermissions?.includes(normalizedPermission) || false;
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
