import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search } from 'lucide-react';
import * as api from '../../services/api';
import { toast } from 'sonner';
import { useLiveData } from '../../hooks/useLiveData';

export const InventarioPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [inventario, setInventario] = useState<any[]>([]);

  const loadInventario = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const inventarioRes = await api.getInventario({ limit: 1000 });
      setInventario(inventarioRes.data || inventarioRes);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      toast.error('Error al cargar inventario');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadInventario(true);
  }, []);

  useLiveData(() => loadInventario(false), { pollMs: 12000 });

  const inventarioFiltrado = useMemo(() => {
    return inventario.filter(inv => {
      if (!inv.producto) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        inv.producto.nombre.toLowerCase().includes(searchLower) ||
        inv.producto.sku.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, inventario]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consulta de Inventario</h1>
        <p className="text-gray-600 mt-1">Stock en tiempo real por producto y almacén</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Actual</CardTitle>
          <CardDescription>Total de registros: {inventarioFiltrado.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Reservado</TableHead>
                  <TableHead className="text-right">Stock Disponible</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventarioFiltrado.slice(0, 50).map((inv) => {
                  const stockBajo = inv.producto && inv.stock_actual <= inv.producto.stock_minimo;
                  const agotado = inv.stock_actual === 0;

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.producto?.sku}</TableCell>
                      <TableCell className="font-medium">{inv.producto?.nombre}</TableCell>
                      <TableCell>{inv.almacen?.nombre || 'N/A'}</TableCell>
                      <TableCell className="text-right font-semibold">{inv.stock_actual}</TableCell>
                      <TableCell className="text-right text-gray-600">{inv.stock_reservado || 0}</TableCell>
                      <TableCell className="text-right font-semibold">{inv.stock_disponible || inv.stock_actual}</TableCell>
                      <TableCell>
                        <Badge variant={agotado ? 'destructive' : stockBajo ? 'secondary' : 'default'}>
                          {agotado ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'Disponible'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
