import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { useLiveData } from '../../hooks/useLiveData';

export const AuditoriaPage = () => {
  const [loading, setLoading] = useState(true);
  const [auditoria, setAuditoria] = useState<any[]>([]);

  const loadAuditoria = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.getAuditorias({ limit: 100 });
      setAuditoria(response.data || response);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar auditoria');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadAuditoria(true);
  }, []);

  useLiveData(() => loadAuditoria(false), { pollMs: 10000 });

  const auditoriaReciente = useMemo(
    () =>
      [...auditoria]
        .filter((item) => item.fecha)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 100),
    [auditoria]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando auditoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Auditoria del Sistema</h1>
        <p className="text-gray-600 mt-1">Registro de actividades y cambios en el sistema</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Log de Auditoria</CardTitle>
              <CardDescription>Ultimos {auditoriaReciente.length} registros</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Registro ID</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditoriaReciente.map((log) => {
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {log.fecha ? format(new Date(log.fecha), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>{log.usuario?.nombre || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            String(log.accion || '').toUpperCase().includes('CREAR')
                              ? 'default'
                              : String(log.accion || '').toUpperCase().includes('ACTUALIZAR')
                                ? 'secondary'
                                : String(log.accion || '').toUpperCase().includes('ELIMINAR')
                                  ? 'destructive'
                                  : 'outline'
                          }
                        >
                          {String(log.accion || '').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.entidad || log.tabla || '-'}</TableCell>
                      <TableCell className="text-sm">{log.registro_id ?? '-'}</TableCell>
                      <TableCell className="text-sm max-w-xs whitespace-normal break-words">
                        {log.detalles || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address || '-'}</TableCell>
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
