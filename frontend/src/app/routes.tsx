import { createBrowserRouter } from 'react-router';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductosPage } from './components/productos/ProductosPage';
import { AlmacenesPage } from './components/almacenes/AlmacenesPage';
import { InventarioPage } from './components/inventario/InventarioPage';
import { MovimientosPage } from './components/inventario/MovimientosPage';
import { TransferenciasPage } from './components/inventario/TransferenciasPage';
import { ReportesPage } from './components/reportes/ReportesPage';
import { UsuariosPage } from './components/usuarios/UsuariosPage';
import { NotificacionesPage } from './components/notificaciones/NotificacionesPage';
import { AuditoriaPage } from './components/auditoria/AuditoriaPage';
import { ConfiguracionPage } from './components/configuracion/ConfiguracionPage';
import { NotFound } from './components/layout/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'productos',
        element: (
          <ProtectedRoute permission="productos.ver">
            <ProductosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'almacenes',
        element: (
          <ProtectedRoute permission="almacenes.ver">
            <AlmacenesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventario',
        element: (
          <ProtectedRoute permission="inventario.ver">
            <InventarioPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'movimientos',
        element: (
          <ProtectedRoute permission="inventario.ver">
            <MovimientosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'transferencias',
        element: (
          <ProtectedRoute permission="inventario.transferencia">
            <TransferenciasPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reportes',
        element: (
          <ProtectedRoute permission="reportes.ver">
            <ReportesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute permission="usuarios.ver">
            <UsuariosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notificaciones',
        element: <NotificacionesPage />,
      },
      {
        path: 'auditoria',
        element: (
          <ProtectedRoute permission="auditoria.ver">
            <AuditoriaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <ProtectedRoute permission="configuracion.editar">
            <ConfiguracionPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
