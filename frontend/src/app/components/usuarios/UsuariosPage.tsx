import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { UsuarioFormModal } from '../forms/UsuarioFormModal';
import { ConfirmDialog } from '../forms/ConfirmDialog';
import * as api from '../../services/api';
import type { Usuario, Almacen } from '../../types';
import { useLiveData } from '../../hooks/useLiveData';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null
  });

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [usuariosRes, almacenesRes] = await Promise.all([
        api.getUsuarios(),
        api.getAlmacenes({ estado: true })
      ]);
      setUsuarios(usuariosRes.data || usuariosRes);
      setAlmacenes(almacenesRes.data || almacenesRes);
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

  const handleOpenForm = (usuario?: Usuario) => {
    setEditingUsuario(usuario || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingUsuario(null);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingUsuario) {
        await api.updateUsuario(editingUsuario.id, data);
        toast.success('Usuario actualizado correctamente');
      } else {
        await api.createUsuario(data);
        toast.success('Usuario creado correctamente');
      }
      await loadData();
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (usuario: Usuario) => {
    setDeleteConfirm({ open: true, usuario });
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, usuario: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.usuario) return;

    try {
      await api.deleteUsuario(deleteConfirm.usuario.id);
      toast.success('Usuario eliminado correctamente');
      await loadData();
      handleCloseDeleteConfirm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const getAlmacenById = (id: number) => {
    return almacenes.find(a => a.id === id);
  };

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      'administrador': 'Administrador',
      'encargado_almacen': 'Encargado de Almacén',
      'usuario_operativo': 'Usuario Operativo'
    };
    return labels[rol] || rol;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios y permisos del sistema</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : `Total: ${usuarios.length} usuarios`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Almacén Asignado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => {
                    const almacen = usuario.almacen_asignado_id ? getAlmacenById(usuario.almacen_asignado_id) : null;

                    return (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nombre}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.telefono || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            usuario.rol === 'administrador' ? 'default' :
                            usuario.rol === 'encargado_almacen' ? 'secondary' : 'outline'
                          }>
                            {getRolLabel(usuario.rol)}
                          </Badge>
                        </TableCell>
                        <TableCell>{almacen?.nombre || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenForm(usuario)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteConfirm(usuario)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UsuarioFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        usuario={editingUsuario}
        almacenes={almacenes}
        loading={formLoading}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que deseas eliminar al usuario "${deleteConfirm.usuario?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
