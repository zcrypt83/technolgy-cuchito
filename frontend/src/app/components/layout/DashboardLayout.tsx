import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  Package,
  Warehouse,
  ClipboardList,
  TrendingUp,
  Users,
  Bell,
  LogOut,
  LayoutDashboard,
  ArrowRightLeft,
  FileText,
  Shield,
  Settings2,
  Menu,
  X,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { useState } from 'react';

export const DashboardLayout = () => {
  const { usuario, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificacionesNoLeidas] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      path: '/productos',
      label: 'Productos',
      icon: Package,
      permission: 'productos.ver',
    },
    {
      path: '/almacenes',
      label: 'Almacenes',
      icon: Warehouse,
      permission: 'almacenes.ver',
    },
    {
      path: '/inventario',
      label: 'Inventario',
      icon: ClipboardList,
      permission: 'inventario.ver',
    },
    {
      path: '/movimientos',
      label: 'Movimientos',
      icon: TrendingUp,
      permission: 'inventario.ver',
    },
    {
      path: '/transferencias',
      label: 'Transferencias',
      icon: ArrowRightLeft,
      permission: 'inventario.transferencia',
    },
    {
      path: '/reportes',
      label: 'Reportes',
      icon: FileText,
      permission: 'reportes.ver',
    },
    {
      path: '/usuarios',
      label: 'Usuarios',
      icon: Users,
      permission: 'usuarios.ver',
    },
    {
      path: '/auditoria',
      label: 'Auditoría',
      icon: Shield,
      permission: 'auditoria.ver',
    },
    {
      path: '/configuracion',
      label: 'Configuración',
      icon: Settings2,
      permission: 'configuracion.editar',
    },
  ];

  const visibleMenuItems = menuItems.filter(
    item => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <Link to="/" className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Technology Cuchito</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Control de Inventario</p>
                </div>
              </Link>
            </div>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate('/notificaciones')}
              >
                <Bell className="h-5 w-5" />
                {notificacionesNoLeidas > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificacionesNoLeidas}
                  </Badge>
                )}
              </Button>

              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                <p className="text-xs text-gray-500">{usuario?.rol.replace('_', ' ')}</p>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 
            fixed lg:static inset-y-0 left-0 z-30 w-64 
            bg-white border-r border-gray-200 
            transition-transform duration-300 ease-in-out
            pt-16 lg:pt-0
          `}
        >
          <nav className="p-4 space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
