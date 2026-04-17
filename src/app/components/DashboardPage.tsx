import { TrendingUp, Package, AlertTriangle, Warehouse } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { label: 'Productos Activos', value: '145', icon: Package, color: 'blue', change: '+12%' },
    { label: 'Valor Total Inventario', value: 'S/ 485,320', icon: TrendingUp, color: 'green', change: '+8.2%' },
    { label: 'Alertas de Stock', value: '23', icon: AlertTriangle, color: 'red', change: '-5%' },
    { label: 'Almacenes', value: '3', icon: Warehouse, color: 'purple', change: '0%' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600 mt-1">Visión general del sistema de inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  <p className={`text-xs font-medium mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-slate-600'}`}>
                    {stat.change} vs mes anterior
                  </p>
                </div>
                <div className={`p-3 rounded-lg border ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {[
              { name: 'Mouse Logitech G502', stock: 5, min: 10 },
              { name: 'Teclado Mecánico RGB', stock: 3, min: 8 },
              { name: 'Monitor LG 24"', stock: 2, min: 6 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">Stock mínimo: {item.min}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{item.stock}</p>
                  <p className="text-xs text-red-600">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Últimos Movimientos</h3>
          <div className="space-y-3">
            {[
              { type: 'Entrada', product: 'Laptop HP 15.6"', qty: 20, date: '09/04/2026' },
              { type: 'Salida', product: 'Mouse Inalámbrico', qty: 15, date: '09/04/2026' },
              { type: 'Transferencia', product: 'Teclado USB', qty: 10, date: '08/04/2026' },
            ].map((mov, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      mov.type === 'Entrada' ? 'bg-green-100 text-green-700' :
                      mov.type === 'Salida' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {mov.type}
                    </span>
                    <p className="font-medium text-slate-900">{mov.product}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{mov.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">{mov.qty}</p>
                  <p className="text-xs text-slate-600">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
