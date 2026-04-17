import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import * as api from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '../ui/button';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { MovimientoFormModal } from '../forms/MovimientoFormModal';
import type { Producto, Almacen } from '../../types';
import { useLiveData } from '../../hooks/useLiveData';

export const MovimientosPage = () => {
  const { hasPermission } = useAuth();
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS' | 'entrada' | 'salida'>('TODOS');
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida' | 'transferencia'>('entrada');
  const [formLoading, setFormLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [productosRes, almacenesRes] = await Promise.all([
        api.getProductos({ limit: 1000 }),
        api.getAlmacenes({ estado: true })
      ]);
      setProductos(productosRes.data || productosRes);
      setAlmacenes(almacenesRes.data || almacenesRes);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
    }
  };

  const loadMovimientos = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const params: any = { limit: 100 };
      if (tipoFiltro !== 'TODOS') {
        params.tipo = tipoFiltro;
      }
      const movimientosRes = await api.getMovimientos(params);
      setMovimientos(movimientosRes.data || movimientosRes);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      toast.error('Error al cargar movimientos');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Cargar movimientos del API
  useEffect(() => {
    void loadMovimientos(true);
  }, [tipoFiltro]);

  useLiveData(async () => {
    await Promise.all([loadInitialData(), loadMovimientos(false)]);
  }, { pollMs: 12000 });

  const handleOpenForm = (tipo: 'entrada' | 'salida' | 'transferencia') => {
    setTipoMovimiento(tipo);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      setFormLoading(true);
      const nuevoMovimiento = await api.createMovimiento(data);
      toast.success('Movimiento registrado correctamente');

      // Actualización inmediata en UI sin refrescar la página
      const coincideConFiltro =
        tipoFiltro === 'TODOS' || tipoFiltro === nuevoMovimiento.tipo;
      if (coincideConFiltro) {
        setMovimientos((prev) => [
          nuevoMovimiento,
          ...prev.filter((item) => item.id !== nuevoMovimiento.id)
        ]);
      }

      handleCloseForm();

      // Sincronizar lista con backend (sin depender de caché)
      await loadMovimientos(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar movimiento');
    } finally {
      setFormLoading(false);
    }
  };

  const movimientosFiltrados = useMemo(() => {
    return movimientos
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-gray-600 mt-1">Historial de entradas y salidas</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('inventario.entrada') && (
            <Button onClick={() => handleOpenForm('entrada')} className="bg-green-600 hover:bg-green-700">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Nueva Entrada
            </Button>
          )}
          {hasPermission('inventario.salida') && (
            <Button onClick={() => handleOpenForm('salida')} className="bg-red-600 hover:bg-red-700">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Nueva Salida
            </Button>
          )}
          {hasPermission('inventario.transferencia') && (
            <Button onClick={() => handleOpenForm('transferencia')} variant="secondary">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferencia
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Total: {movimientosFiltrados.length} movimientos</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={tipoFiltro === 'TODOS' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTipoFiltro('TODOS')}
              >
                Todos
              </Button>
              <Button
                variant={tipoFiltro === 'entrada' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoFiltro('entrada')}
              >
                Entradas
              </Button>
              <Button
                variant={tipoFiltro === 'salida' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoFiltro('salida')}
              >
                Salidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.map((mov) => {
                  return (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">
                        {format(new Date(mov.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={mov.tipo === 'entrada' ? 'default' : 'secondary'}>
                          {mov.tipo.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{mov.producto?.nombre || '-'}</TableCell>
                      <TableCell>{mov.almacen?.nombre || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{mov.cantidad}</TableCell>
                      <TableCell className="text-right">
                        S/ {Number(mov.valor_total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm">{mov.usuario?.nombre || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{mov.documento || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MovimientoFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        productos={productos}
        almacenes={almacenes}
        tipoInicial={tipoMovimiento}
        loading={formLoading}
      />
    </div>
  );
};
