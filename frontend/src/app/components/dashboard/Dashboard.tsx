import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Ban,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import * as api from '../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLiveData } from '../../hooks/useLiveData';

export const Dashboard = () => {
  const { usuario } = useAuth();

  // Estados para datos del API
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);

  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [productosRes, inventarioRes, movimientosRes] = await Promise.all([
        api.getProductos({ limit: 1000 }),
        api.getInventario({ limit: 1000 }),
        api.getMovimientos({ limit: 1000 }),
      ]);

      setProductos(productosRes.data || productosRes);
      setInventario(inventarioRes.data || inventarioRes);
      setMovimientos(movimientosRes.data || movimientosRes);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Cargar datos del API al montar el componente
  useEffect(() => {
    void fetchDashboardData(true);
  }, []);

  useLiveData(() => fetchDashboardData(false), { pollMs: 12000 });

  // Calcular KPIs
  const stats = useMemo(() => {
    if (loading) return {
      totalProductos: 0,
      valorTotal: 0,
      productosConStockCritico: 0,
      productosAgotados: 0,
      entradasMes: 0,
      salidasMes: 0,
    };

    const ahora = new Date();
    const inicioMes = startOfMonth(ahora);
    const finMes = endOfMonth(ahora);

    const totalProductos = productos.filter(p => p.activo).length;

    // Calcular valor total del inventario
    const valorTotal = inventario.reduce((sum, inv) => {
      const producto = productos.find(p => p.id === inv.producto_id);
      if (producto) {
        return sum + (inv.stock_actual * producto.precio);
      }
      return sum;
    }, 0);

    const productosConStockCritico = inventario.filter(inv => {
      const producto = productos.find(p => p.id === inv.producto_id);
      return producto && inv.stock_actual > 0 && inv.stock_actual <= producto.stock_minimo;
    }).length;

    const productosAgotados = inventario.filter(inv => inv.stock_actual === 0).length;

    const entradasMes = movimientos.filter(m => {
      const fecha = new Date(m.fecha);
      return m.tipo === 'entrada' && isWithinInterval(fecha, { start: inicioMes, end: finMes });
    }).length;

    const salidasMes = movimientos.filter(m => {
      const fecha = new Date(m.fecha);
      return m.tipo === 'salida' && isWithinInterval(fecha, { start: inicioMes, end: finMes });
    }).length;

    return {
      totalProductos,
      valorTotal,
      productosConStockCritico,
      productosAgotados,
      entradasMes,
      salidasMes,
    };
  }, [productos, inventario, movimientos, loading]);

  // Datos para gráfico de evolución (últimos 30 días)
  const evolucionData = useMemo(() => {
    if (loading) return [];

    const dias = eachDayOfInterval({
      start: new Date(new Date().setDate(new Date().getDate() - 30)),
      end: new Date(),
    });

    return dias.map((dia, index) => {
      const diaStr = format(dia, 'yyyy-MM-dd');

      const entradasDia = movimientos.filter(m => {
        const fechaStr = format(new Date(m.fecha), 'yyyy-MM-dd');
        return m.tipo === 'entrada' && fechaStr === diaStr;
      }).length;

      const salidasDia = movimientos.filter(m => {
        const fechaStr = format(new Date(m.fecha), 'yyyy-MM-dd');
        return m.tipo === 'salida' && fechaStr === diaStr;
      }).length;

      return {
        id: `dia-${index}`,
        fecha: format(dia, 'dd MMM', { locale: es }),
        entradas: entradasDia,
        salidas: salidasDia,
      };
    });
  }, [movimientos, loading]);

  // Top 10 productos más vendidos
  const topProductos = useMemo(() => {
    if (loading) return [];

    const ventasPorProducto = new Map<number, number>();

    movimientos
      .filter(m => m.tipo === 'salida')
      .forEach(m => {
        const productoId = Number(m.producto_id ?? m.productoId);
        if (!Number.isInteger(productoId) || productoId < 1) return;

        const cantidadActual = ventasPorProducto.get(productoId) || 0;
        const cantidadMovimiento = Number(m.cantidad) || 0;
        ventasPorProducto.set(productoId, cantidadActual + cantidadMovimiento);
      });

    return Array.from(ventasPorProducto.entries())
      .map(([productoId, cantidad]) => {
        const producto = productos.find(p => p.id === productoId);
        const nombreCompleto = producto?.nombre || `Producto #${productoId}`;
        return {
          id: `producto-${productoId}`,
          nombre:
            nombreCompleto.length > 28
              ? `${nombreCompleto.substring(0, 28)}...`
              : nombreCompleto,
          cantidad,
        };
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [productos, movimientos, loading]);

  // Distribución por categoría
  const distribucionCategorias = useMemo(() => {
    if (loading) return [];

    const stockPorCategoria = new Map<number, { nombre: string; stock: number }>();

    inventario.forEach(inv => {
      const producto = productos.find(p => p.id === inv.producto_id);
      if (producto) {
        const existing = stockPorCategoria.get(producto.categoria_id);
        if (existing) {
          existing.stock += inv.stock_actual;
        } else {
          stockPorCategoria.set(producto.categoria_id, {
            nombre: producto.categoria?.nombre || 'Sin categoría',
            stock: inv.stock_actual
          });
        }
      }
    });

    return Array.from(stockPorCategoria.values())
      .map((cat, index) => ({
        id: `categoria-${index}`,
        nombre: cat.nombre,
        valor: cat.stock,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [productos, inventario, loading]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Ejecutivo
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenido, {usuario?.nombre} • {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Productos
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProductos}</div>
            <p className="text-xs text-gray-500 mt-1">Productos activos en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valor Total Inventario
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              S/ {stats.valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Valorización total del stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stock Crítico
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.productosConStockCritico}</div>
            <p className="text-xs text-gray-500 mt-1">Productos en nivel mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Productos Agotados
            </CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.productosAgotados}</div>
            <p className="text-xs text-gray-500 mt-1">Sin stock disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entradas del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.entradasMes}</div>
            <p className="text-xs text-gray-500 mt-1">Movimientos de entrada registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Salidas del Mes
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.salidasMes}</div>
            <p className="text-xs text-gray-500 mt-1">Movimientos de salida registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de Movimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Movimientos (Últimos 30 días)</CardTitle>
            <CardDescription>Entradas y salidas de inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolucionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" style={{ fontSize: '12px' }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Entradas"
                />
                <Area 
                  type="monotone" 
                  dataKey="salidas" 
                  stackId="2"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Salidas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Productos Más Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
            <CardDescription>Productos con mayor rotación</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aún no hay salidas suficientes para mostrar el ranking.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProductos}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="nombre" type="category" width={180} style={{ fontSize: '11px' }} />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`, 'Cantidad Vendida']}
                  />
                  <Bar dataKey="cantidad" fill="#3b82f6" name="Cantidad Vendida" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribución de Stock por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Stock por Categoría</CardTitle>
            <CardDescription>Porcentaje de stock por tipo de producto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribucionCategorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, percent }) => `${nombre} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {distribucionCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertas Activas */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Crítico y Agotados</CardTitle>
            <CardDescription>Productos que requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventario
                .filter(inv => {
                  const producto = productos.find(p => p.id === inv.producto_id);
                  return producto && (inv.stock_actual === 0 || inv.stock_actual <= producto.stock_minimo);
                })
                .slice(0, 6)
                .map((inv) => {
                  const producto = productos.find(p => p.id === inv.producto_id);
                  const isAgotado = inv.stock_actual === 0;
                  const isCritico = !isAgotado && inv.stock_actual <= (producto?.stock_minimo || 0);

                  return (
                    <div
                      key={inv.id}
                      className={`p-3 rounded-lg border ${
                        isAgotado
                          ? 'bg-red-50 border-red-200'
                          : isCritico
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {producto?.nombre}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {isAgotado ? 'Producto agotado' : 'Stock por debajo del mínimo'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Stock actual: {inv.stock_actual} | Mínimo: {producto?.stock_minimo || 0}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            isAgotado
                              ? 'bg-red-100 text-red-800'
                              : isCritico
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isAgotado ? 'AGOTADO' : 'CRÍTICO'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {inventario.filter(inv => {
                const producto = productos.find(p => p.id === inv.producto_id);
                return producto && (inv.stock_actual === 0 || inv.stock_actual <= producto.stock_minimo);
              }).length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay alertas activas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
