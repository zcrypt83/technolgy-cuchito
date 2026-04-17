import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, X, AlertCircle, Users, Shield } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'encargado' | 'operario';
  telefono: string;
  almacenAsignado: string;
  activo: boolean;
  fechaCreacion: string;
}

interface UsuarioFormData {
  nombre: string;
  email: string;
  rol: 'admin' | 'encargado' | 'operario';
  telefono: string;
  almacenAsignado: string;
  password: string;
}

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@tech.com', rol: 'admin', telefono: '987654321', almacenAsignado: 'Almacén Principal', activo: true, fechaCreacion: '2024-01-15' },
    { id: 2, nombre: 'María García', email: 'maria@tech.com', rol: 'encargado', telefono: '987654322', almacenAsignado: 'Almacén Secundario', activo: true, fechaCreacion: '2024-02-20' },
    { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos@tech.com', rol: 'encargado', telefono: '987654323', almacenAsignado: 'Almacén Norte', activo: true, fechaCreacion: '2024-03-10' },
    { id: 4, nombre: 'Ana López', email: 'ana@tech.com', rol: 'operario', telefono: '987654324', almacenAsignado: 'Almacén Principal', activo: true, fechaCreacion: '2024-04-05' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; usuario: Usuario | null }>({ open: false, usuario: null });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioFormData>();

  const filteredUsuarios = usuarios.filter(u =>
    u.activo &&
    (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (rolFilter === '' || u.rol === rolFilter)
  );

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'encargado': return 'bg-blue-100 text-blue-800';
      case 'operario': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'encargado': return 'Encargado';
      case 'operario': return 'Operario';
      default: return rol;
    }
  };

  const handleOpenForm = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      reset({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        almacenAsignado: usuario.almacenAsignado,
        password: '',
      });
    } else {
      setEditingUsuario(null);
      reset({
        nombre: '',
        email: '',
        rol: 'operario',
        telefono: '',
        almacenAsignado: '',
        password: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUsuario(null);
    reset();
  };

  const onSubmit = (data: UsuarioFormData) => {
    if (editingUsuario) {
      setUsuarios(prev => prev.map(u =>
        u.id === editingUsuario.id
          ? { ...u, ...data }
          : u
      ));
      toast.success('Usuario actualizado correctamente');
    } else {
      const newUsuario: Usuario = {
        id: Date.now(),
        ...data,
        activo: true,
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      setUsuarios(prev => [newUsuario, ...prev]);
      toast.success('Usuario creado correctamente');
    }
    handleCloseForm();
  };

  const handleDelete = (usuario: Usuario) => {
    setDeleteConfirm({ open: true, usuario });
  };

  const confirmDelete = () => {
    if (deleteConfirm.usuario) {
      setUsuarios(prev => prev.map(u =>
        u.id === deleteConfirm.usuario!.id ? { ...u, activo: false } : u
      ));
      toast.success('Usuario eliminado correctamente');
      setDeleteConfirm({ open: false, usuario: null });
    }
  };

  const handleView = (usuario: Usuario) => {
    setViewingUsuario(usuario);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h2>
          <p className="text-slate-600 mt-1">Administra los usuarios y permisos del sistema</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="encargado">Encargado</option>
              <option value="operario">Operario</option>
            </select>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Total: {filteredUsuarios.length} usuarios encontrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Almacén</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{usuario.nombre}</p>
                        <p className="text-sm text-slate-500">{usuario.fechaCreacion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{usuario.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRolLabel(usuario.rol)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{usuario.telefono}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{usuario.almacenAsignado}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(usuario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenForm(usuario)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {editingUsuario ? 'Modifica los datos del usuario' : 'Completa los datos del nuevo usuario'}
                </p>
              </div>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.nombre ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El email es obligatorio',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="usuario@tech.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('telefono', {
                      required: 'El teléfono es obligatorio',
                      pattern: {
                        value: /^\d{9}$/,
                        message: 'Debe tener 9 dígitos'
                      }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.telefono ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="987654321"
                  />
                  {errors.telefono && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.telefono.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rol <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register('rol', { required: 'El rol es obligatorio' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                      errors.rol ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="admin">Administrador</option>
                    <option value="encargado">Encargado</option>
                    <option value="operario">Operario</option>
                  </select>
                  {errors.rol && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.rol.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Almacén Asignado <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register('almacenAsignado', { required: 'El almacén es obligatorio' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                      errors.almacenAsignado ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Almacén Principal">Almacén Principal</option>
                    <option value="Almacén Secundario">Almacén Secundario</option>
                    <option value="Almacén Norte">Almacén Norte</option>
                  </select>
                  {errors.almacenAsignado && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.almacenAsignado.message}
                    </p>
                  )}
                </div>

                {!editingUsuario && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contraseña <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      {...register('password', {
                        required: !editingUsuario ? 'La contraseña es obligatoria' : false,
                        minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                      })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        errors.password ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
                >
                  {editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && viewingUsuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detalles del Usuario</h3>
                  <p className="text-sm text-slate-600">Información completa</p>
                </div>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {viewingUsuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{viewingUsuario.nombre}</h4>
                  <p className="text-slate-600">{viewingUsuario.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Rol</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRolColor(viewingUsuario.rol)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRolLabel(viewingUsuario.rol)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Fecha de Creación</p>
                  <p className="font-medium text-slate-900">{viewingUsuario.fechaCreacion}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Teléfono</p>
                    <p className="font-medium text-slate-900">{viewingUsuario.telefono}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{viewingUsuario.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Almacén Asignado</h4>
                <p className="font-medium text-slate-900">{viewingUsuario.almacenAsignado}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, usuario: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar Usuario?"
        description={`¿Estás seguro de que deseas eliminar a "${deleteConfirm.usuario?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
