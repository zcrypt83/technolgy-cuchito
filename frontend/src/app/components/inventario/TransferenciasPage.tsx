import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { useLiveData } from '../../hooks/useLiveData';

export const TransferenciasPage = () => {
  const [loading, setLoading] = useState(true);
  const [transferencias, setTransferencias] = useState<any[]>([]);

  const loadTransferencias = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.getMovimientos({ tipo: 'transferencia', limit: 200 });
      setTransferencias(response.data || response);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar transferencias');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransferencias(true);
  }, []);

  useLiveData(() => loadTransferencias(false), { pollMs: 12000 });

  const transferenciasOrdenadas = useMemo(
    () =>
      [...transferencias].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [transferencias]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transferencias entre Almacenes</h1>
        <p className="text-gray-600 mt-1">Traslados de productos entre ubicaciones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Transferencias</CardTitle>
          <CardDescription>Total: {transferenciasOrdenadas.length} transferencias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferenciasOrdenadas.map((trans) => {
                  return (
                    <TableRow key={trans.id}>
                      <TableCell className="font-mono">{trans.numeroDocumento || `TR-${trans.id}`}</TableCell>
                      <TableCell>{trans.producto?.nombre || '-'}</TableCell>
                      <TableCell>{trans.almacenOrigen?.nombre || '-'}</TableCell>
                      <TableCell>{trans.almacenDestino?.nombre || '-'}</TableCell>
                      <TableCell>{trans.cantidad}</TableCell>
                      <TableCell>{trans.usuario?.nombre || '-'}</TableCell>
                      <TableCell>
                        {trans.fecha ? format(new Date(trans.fecha), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <ArrowRightLeft className="h-3 w-3" />
                          COMPLETADA
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
