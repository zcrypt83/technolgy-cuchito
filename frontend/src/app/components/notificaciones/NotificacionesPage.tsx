import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { useLiveData } from '../../hooks/useLiveData';

type NotificationItem = {
  id: number;
  usuario_id: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date | null;
};

export const NotificacionesPage = () => {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState<'TODAS' | 'NO_LEIDAS'>('TODAS');
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState<NotificationItem[]>([]);

  const loadNotificaciones = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.getAuditorias({ limit: 50 });
      const rows = response.data || [];

      const mapped = rows.map((item: any) => ({
        id: item.id,
        usuario_id: item.usuario_id ?? item.usuarioId ?? null,
        tipo: 'SISTEMA',
        titulo: `${String(item.accion || '').toUpperCase()} ${item.tabla || item.entidad || ''}`.trim(),
        mensaje: item.detalles || `Actividad registrada en ${item.tabla || item.entidad || 'sistema'}`,
        leida: true,
        fecha: item.fecha ? new Date(item.fecha) : null,
      }));

      setNotificaciones(mapped);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar notificaciones');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotificaciones(true);
  }, []);

  useLiveData(() => loadNotificaciones(false), { pollMs: 12000 });

  const notificacionesUsuario = useMemo(() => {
    const base = notificaciones
      .filter((n) => n.usuario_id === null || n.usuario_id === usuario?.id)
      .filter((n) => filtro === 'TODAS' || !n.leida)
      .sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));

    return base;
  }, [notificaciones, filtro, usuario?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
        <p className="text-gray-600 mt-1">Actividad reciente asociada a tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>{notificacionesUsuario.filter((n) => !n.leida).length} no leidas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtro === 'TODAS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltro('TODAS')}
              >
                Todas
              </Button>
              <Button
                variant={filtro === 'NO_LEIDAS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltro('NO_LEIDAS')}
              >
                No leidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info('Las notificaciones son de solo lectura por ahora')}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificacionesUsuario.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notif.leida ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notif.titulo || 'Actividad del sistema'}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notif.fecha ? format(notif.fecha, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : '-'}
                        </p>
                      </div>
                      {!notif.leida && <Badge variant="default">Nueva</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {notificacionesUsuario.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
