import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Almacen, Usuario } from '../../types';

interface AlmacenFormData {
  codigo: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  capacidad_maxima: number;
  encargado_id: number;
  telefono?: string;
}

interface AlmacenFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AlmacenFormData) => void;
  almacen?: Almacen | null;
  usuarios: Usuario[];
  loading?: boolean;
}

export function AlmacenFormModal({
  open,
  onClose,
  onSubmit,
  almacen,
  usuarios,
  loading = false
}: AlmacenFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlmacenFormData>();

  // Filtrar solo usuarios con rol de encargado
  const encargados = usuarios.filter(u => u.rol === 'encargado_almacen');

  useEffect(() => {
    if (almacen) {
      reset({
        codigo: almacen.codigo,
        nombre: almacen.nombre,
        direccion: almacen.direccion || '',
        ciudad: almacen.ciudad || '',
        capacidad_maxima: almacen.capacidad_maxima,
        encargado_id: almacen.encargado_id,
        telefono: almacen.telefono || '',
      });
    } else {
      reset({
        codigo: '',
        nombre: '',
        direccion: '',
        ciudad: '',
        capacidad_maxima: 1000,
        encargado_id: 0,
        telefono: '',
      });
    }
  }, [almacen, reset, open]);

  const handleFormSubmit = (data: AlmacenFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {almacen ? 'Editar Almacén' : 'Nuevo Almacén'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {almacen ? 'Modifica los datos del almacén' : 'Completa los datos del nuevo almacén'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código <span className="text-red-600">*</span>
              </Label>
              <Input
                id="codigo"
                {...register('codigo', {
                  required: 'El código es obligatorio',
                  pattern: {
                    value: /^ALM-[0-9]+$/,
                    message: 'Formato inválido (ej: ALM-001)'
                  }
                })}
                placeholder="ALM-001"
                className={errors.codigo ? 'border-red-500' : ''}
              />
              {errors.codigo && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.codigo.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                placeholder="Almacén Principal"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">
                Dirección <span className="text-red-600">*</span>
              </Label>
              <Input
                id="direccion"
                {...register('direccion', { required: 'La dirección es obligatoria' })}
                placeholder="Av. La Marina 123"
                className={errors.direccion ? 'border-red-500' : ''}
              />
              {errors.direccion && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.direccion.message}
                </p>
              )}
            </div>

            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="ciudad">
                Ciudad <span className="text-red-600">*</span>
              </Label>
              <Input
                id="ciudad"
                {...register('ciudad', { required: 'La ciudad es obligatoria' })}
                placeholder="Lima"
                className={errors.ciudad ? 'border-red-500' : ''}
              />
              {errors.ciudad && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.ciudad.message}
                </p>
              )}
            </div>

            {/* Capacidad Máxima */}
            <div className="space-y-2">
              <Label htmlFor="capacidad_maxima">
                Capacidad Máxima <span className="text-red-600">*</span>
              </Label>
              <Input
                id="capacidad_maxima"
                type="number"
                {...register('capacidad_maxima', {
                  required: 'La capacidad es obligatoria',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Mínimo 1 unidad' }
                })}
                placeholder="1000"
                className={errors.capacidad_maxima ? 'border-red-500' : ''}
              />
              {errors.capacidad_maxima && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.capacidad_maxima.message}
                </p>
              )}
            </div>

            {/* Encargado */}
            <div className="space-y-2">
              <Label htmlFor="encargado">
                Encargado <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('encargado_id', {
                  required: 'El encargado es obligatorio',
                  valueAsNumber: true
                })}
                className={`w-full px-3 py-2 border rounded-md ${errors.encargado_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value={0}>Seleccionar encargado...</option>
                {encargados.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} ({usuario.rol})
                  </option>
                ))}
              </select>
              {errors.encargado_id && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.encargado_id.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono', {
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: 'Debe tener 9 dígitos'
                  }
                })}
                placeholder="987654321"
                className={errors.telefono ? 'border-red-500' : ''}
              />
              {errors.telefono && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.telefono.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Guardando...' : (almacen ? 'Actualizar Almacén' : 'Crear Almacén')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
