import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Warehouse, Plus, MapPin, Phone, User, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AlmacenFormModal } from '../forms/AlmacenFormModal';
import { ConfirmDialog } from '../forms/ConfirmDialog';
import * as api from '../../services/api';
import type { Almacen, Usuario } from '../../types';
import { useLiveData } from '../../hooks/useLiveData';

export const AlmacenesPage = () => {
  const { hasPermission } = useAuth();
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; almacen: Almacen | null }>({
    open: false,
    almacen: null
  });

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [almacenesRes, usuariosRes] = await Promise.all([
        api.getAlmacenes({ estado: true }),
        api.getUsuarios()
      ]);
      setAlmacenes(almacenesRes.data || almacenesRes);
      setUsuarios(usuariosRes.data || usuariosRes);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
  }, []);

  useLiveData(() => loadData(false), { pollMs: 15000 });

  const handleOpenForm = (almacen?: Almacen) => {
    setEditingAlmacen(almacen || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAlmacen(null);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingAlmacen) {
        await api.updateAlmacen(editingAlmacen.id, data);
        toast.success('Almacén actualizado correctamente');
      } else {
        await api.createAlmacen(data);
        toast.success('Almacén creado correctamente');
      }
      await loadData();
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar almacén');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (almacen: Almacen) => {
    setDeleteConfirm({ open: true, almacen });
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, almacen: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.almacen) return;

    try {
      await api.deleteAlmacen(deleteConfirm.almacen.id);
      toast.success('Almacén eliminado correctamente');
      await loadData();
      handleCloseDeleteConfirm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar almacén');
    }
  };

  const getUsuarioById = (id: number) => {
    return usuarios.find(u => u.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Almacenes</h1>
          <p className="text-gray-600 mt-1">Administra los puntos de almacenamiento</p>
        </div>
        {hasPermission('almacenes.crear') && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Almacén
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando almacenes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {almacenes.map((almacen) => {
            const encargado = almacen.encargado_id ? getUsuarioById(almacen.encargado_id) : null;

            return (
              <Card key={almacen.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Warehouse className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{almacen.nombre}</CardTitle>
                        <CardDescription className="font-mono text-xs">{almacen.codigo}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">Activo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{almacen.direccion}</p>
                      <p className="text-gray-500">{almacen.ciudad}</p>
                    </div>
                  </div>

                  {almacen.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-700">{almacen.telefono}</p>
                    </div>
                  )}

                  {encargado && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-700">{encargado.nombre}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <p className="text-gray-500">Capacidad Máxima</p>
                      <p className="text-lg font-semibold text-gray-900">{almacen.capacidad_maxima} unidades</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {hasPermission('almacenes.editar') && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleOpenForm(almacen)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    {hasPermission('almacenes.eliminar') && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleOpenDeleteConfirm(almacen)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlmacenFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        almacen={editingAlmacen}
        usuarios={usuarios}
        loading={formLoading}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Eliminar Almacén"
        description={`¿Estás seguro de que deseas eliminar el almacén "${deleteConfirm.almacen?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
