import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, X, AlertCircle, Warehouse, MapPin } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface Almacen {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  capacidadMaxima: number;
  capacidadUsada: number;
  encargado: string;
  telefono: string;
  activo: boolean;
}

interface AlmacenFormData {
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  capacidadMaxima: number;
  encargado: string;
  telefono: string;
}

export function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([
    { id: 1, nombre: 'Almacén Principal', codigo: 'ALM-001', direccion: 'Av. La Marina 123', ciudad: 'Lima', capacidadMaxima: 1000, capacidadUsada: 650, encargado: 'Juan Pérez', telefono: '987654321', activo: true },
    { id: 2, nombre: 'Almacén Secundario', codigo: 'ALM-002', direccion: 'Jr. Los Olivos 456', ciudad: 'Callao', capacidadMaxima: 500, capacidadUsada: 320, encargado: 'María García', telefono: '987654322', activo: true },
    { id: 3, nombre: 'Almacén Norte', codigo: 'ALM-003', direccion: 'Av. Túpac Amaru 789', ciudad: 'Independencia', capacidadMaxima: 300, capacidadUsada: 180, encargado: 'Carlos Rodríguez', telefono: '987654323', activo: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingAlmacen, setEditingAlmacen] = useState<Almacen | null>(null);
  const [viewingAlmacen, setViewingAlmacen] = useState<Almacen | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; almacen: Almacen | null }>({ open: false, almacen: null });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlmacenFormData>();

  const filteredAlmacenes = almacenes.filter(a =>
    a.activo && (
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleOpenForm = (almacen?: Almacen) => {
    if (almacen) {
      setEditingAlmacen(almacen);
      reset({
        nombre: almacen.nombre,
        codigo: almacen.codigo,
        direccion: almacen.direccion,
        ciudad: almacen.ciudad,
        capacidadMaxima: almacen.capacidadMaxima,
        encargado: almacen.encargado,
        telefono: almacen.telefono,
      });
    } else {
      setEditingAlmacen(null);
      reset({
        nombre: '',
        codigo: '',
        direccion: '',
        ciudad: '',
        capacidadMaxima: 0,
        encargado: '',
        telefono: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAlmacen(null);
    reset();
  };

  const onSubmit = (data: AlmacenFormData) => {
    if (editingAlmacen) {
      setAlmacenes(prev => prev.map(a =>
        a.id === editingAlmacen.id
          ? { ...a, ...data }
          : a
      ));
      toast.success('Almacén actualizado correctamente');
    } else {
      const newAlmacen: Almacen = {
        id: Date.now(),
        ...data,
        capacidadUsada: 0,
        activo: true,
      };
      setAlmacenes(prev => [newAlmacen, ...prev]);
      toast.success('Almacén creado correctamente');
    }
    handleCloseForm();
  };

  const handleDelete = (almacen: Almacen) => {
    setDeleteConfirm({ open: true, almacen });
  };

  const confirmDelete = () => {
    if (deleteConfirm.almacen) {
      setAlmacenes(prev => prev.map(a =>
        a.id === deleteConfirm.almacen!.id ? { ...a, activo: false } : a
      ));
      toast.success('Almacén eliminado correctamente');
      setDeleteConfirm({ open: false, almacen: null });
    }
  };

  const handleView = (almacen: Almacen) => {
    setViewingAlmacen(almacen);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Almacenes</h2>
          <p className="text-slate-600 mt-1">Administra los centros de distribución y almacenamiento</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Almacén
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAlmacenes.map((almacen) => {
          const porcentajeUso = (almacen.capacidadUsada / almacen.capacidadMaxima) * 100;
          const colorClase = porcentajeUso >= 90 ? 'bg-red-500' : porcentajeUso >= 70 ? 'bg-yellow-500' : 'bg-green-500';

          return (
            <div key={almacen.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Warehouse className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{almacen.nombre}</h3>
                      <p className="text-sm text-slate-600 font-mono">{almacen.codigo}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-slate-900">{almacen.direccion}</p>
                      <p className="text-slate-600">{almacen.ciudad}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">Capacidad</span>
                    <span className="font-medium text-slate-900">
                      {almacen.capacidadUsada} / {almacen.capacidadMaxima}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`${colorClase} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${porcentajeUso}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{porcentajeUso.toFixed(1)}% utilizado</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => handleView(almacen)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleOpenForm(almacen)}
                    className="flex-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(almacen)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingAlmacen ? 'Editar Almacén' : 'Nuevo Almacén'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {editingAlmacen ? 'Modifica los datos del almacén' : 'Completa los datos del nuevo almacén'}
                </p>
              </div>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Código <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('codigo', {
                      required: 'El código es obligatorio',
                      pattern: {
                        value: /^ALM-\d+$/,
                        message: 'Formato inválido (ej: ALM-001)'
                      }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.codigo ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="ALM-001"
                  />
                  {errors.codigo && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.codigo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.nombre ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Almacén Principal"
                  />
                  {errors.nombre && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('direccion', { required: 'La dirección es obligatoria' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.direccion ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Av. La Marina 123"
                  />
                  {errors.direccion && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ciudad <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('ciudad', { required: 'La ciudad es obligatoria' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.ciudad ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Lima"
                  />
                  {errors.ciudad && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.ciudad.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Capacidad Máxima <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('capacidadMaxima', {
                      required: 'La capacidad es obligatoria',
                      min: { value: 1, message: 'Mínimo 1 unidad' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.capacidadMaxima ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="1000"
                  />
                  {errors.capacidadMaxima && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.capacidadMaxima.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Encargado <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('encargado', { required: 'El encargado es obligatorio' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.encargado ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.encargado && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.encargado.message}
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
                  {editingAlmacen ? 'Actualizar Almacén' : 'Crear Almacén'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && viewingAlmacen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Warehouse className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detalles del Almacén</h3>
                  <p className="text-sm text-slate-600">Información completa</p>
                </div>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Código</p>
                  <p className="font-mono font-semibold text-slate-900">{viewingAlmacen.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Nombre</p>
                  <p className="font-semibold text-slate-900">{viewingAlmacen.nombre}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Ubicación</p>
                <p className="font-medium text-slate-900">{viewingAlmacen.direccion}</p>
                <p className="text-slate-600">{viewingAlmacen.ciudad}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Encargado</p>
                    <p className="font-medium text-slate-900">{viewingAlmacen.encargado}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Teléfono</p>
                    <p className="font-medium text-slate-900">{viewingAlmacen.telefono}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Capacidad</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Capacidad Máxima</p>
                    <p className="text-xl font-bold text-blue-600">{viewingAlmacen.capacidadMaxima}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Capacidad Usada</p>
                    <p className="text-xl font-bold text-green-600">{viewingAlmacen.capacidadUsada}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Disponible</p>
                    <p className="text-xl font-bold text-slate-900">
                      {viewingAlmacen.capacidadMaxima - viewingAlmacen.capacidadUsada}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`${
                        (viewingAlmacen.capacidadUsada / viewingAlmacen.capacidadMaxima) >= 0.9 ? 'bg-red-500' :
                        (viewingAlmacen.capacidadUsada / viewingAlmacen.capacidadMaxima) >= 0.7 ? 'bg-yellow-500' :
                        'bg-green-500'
                      } h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${(viewingAlmacen.capacidadUsada / viewingAlmacen.capacidadMaxima) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {((viewingAlmacen.capacidadUsada / viewingAlmacen.capacidadMaxima) * 100).toFixed(1)}% utilizado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, almacen: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar Almacén?"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm.almacen?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
