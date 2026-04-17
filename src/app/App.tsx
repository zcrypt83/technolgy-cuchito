import { useState } from 'react';
import { ProductosPage } from './components/ProductosPage';
import { AlmacenesPage } from './components/AlmacenesPage';
import { UsuariosPage } from './components/UsuariosPage';
import { MovimientosPage } from './components/MovimientosPage';
import { DashboardPage } from './components/DashboardPage';
import { Toaster } from 'sonner';
import { Package, Warehouse, Users, ArrowRightLeft, LayoutDashboard } from 'lucide-react';

type Page = 'dashboard' | 'productos' | 'almacenes' | 'usuarios' | 'movimientos';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'productos' as Page, label: 'Productos', icon: Package },
    { id: 'almacenes' as Page, label: 'Almacenes', icon: Warehouse },
    { id: 'usuarios' as Page, label: 'Usuarios', icon: Users },
    { id: 'movimientos' as Page, label: 'Movimientos', icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Technology Cuchito</h1>
                <p className="text-xs text-slate-500">Sistema de Inventario v1.2.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'productos' && <ProductosPage />}
        {currentPage === 'almacenes' && <AlmacenesPage />}
        {currentPage === 'usuarios' && <UsuariosPage />}
        {currentPage === 'movimientos' && <MovimientosPage />}
      </main>
    </div>
  );
}
