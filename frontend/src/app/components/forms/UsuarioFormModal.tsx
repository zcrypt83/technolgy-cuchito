import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Usuario, Almacen } from '../../types';

interface UsuarioFormData {
  nombre: string;
  email: string;
  password?: string;
  rol: 'administrador' | 'encargado_almacen' | 'usuario_operativo';
  telefono?: string;
  almacen_asignado_id?: number;
}

interface UsuarioFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => void;
  usuario?: Usuario | null;
  almacenes: Almacen[];
  loading?: boolean;
}

export function UsuarioFormModal({
  open,
  onClose,
  onSubmit,
  usuario,
  almacenes,
  loading = false
}: UsuarioFormModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UsuarioFormData>();

  const rolSeleccionado = watch('rol');

  useEffect(() => {
    if (rolSeleccionado === 'administrador') {
      setValue('almacen_asignado_id', 0);
    }
  }, [rolSeleccionado, setValue]);

  useEffect(() => {
    if (usuario) {
      reset({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol as any,
        telefono: usuario.telefono || '',
        almacen_asignado_id: usuario.almacen_asignado_id,
        password: '', // No prellenar contraseña
      });
    } else {
      reset({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario_operativo',
        telefono: '',
        almacen_asignado_id: 0,
      });
    }
  }, [usuario, reset, open]);

  const handleFormSubmit = (data: UsuarioFormData) => {
    // Si es edición y no se proporcionó contraseña, eliminarla del payload
    if (usuario && !data.password) {
      const { password, ...dataWithoutPassword } = data;
      onSubmit(dataWithoutPassword as UsuarioFormData);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {usuario ? 'Modifica los datos del usuario' : 'Completa los datos del nuevo usuario'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">
                Nombre Completo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                placeholder="Juan Pérez"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="usuario@techcuchito.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
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

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol">
                Rol <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('rol', { required: 'El rol es obligatorio' })}
                className={`w-full px-3 py-2 border rounded-md ${errors.rol ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar rol...</option>
                <option value="administrador">Administrador</option>
                <option value="encargado_almacen">Encargado de Almacén</option>
                <option value="usuario_operativo">Usuario Operativo</option>
              </select>
              {errors.rol && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.rol.message}
                </p>
              )}
            </div>

            {/* Almacén Asignado (solo si no es administrador) */}
            {rolSeleccionado && rolSeleccionado !== 'administrador' && (
              <div className="space-y-2">
                <Label htmlFor="almacen">
                  Almacén Asignado <span className="text-red-600">*</span>
                </Label>
                <select
                  {...register('almacen_asignado_id', {
                    required: rolSeleccionado !== 'administrador' ? 'El almacén es obligatorio' : false,
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border rounded-md ${errors.almacen_asignado_id ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={0}>Seleccionar almacén...</option>
                  {almacenes.map((almacen) => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
                {errors.almacen_asignado_id && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.almacen_asignado_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Contraseña */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">
                Contraseña {!usuario && <span className="text-red-600">*</span>}
                {usuario && <span className="text-sm text-gray-500"> (dejar vacío para no cambiar)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: !usuario ? 'La contraseña es obligatoria' : false,
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Debe contener mayúsculas, minúsculas y números'
                  }
                })}
                placeholder="Mínimo 8 caracteres"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message}
                </p>
              )}
              {!errors.password && (
                <p className="text-sm text-gray-500">
                  Debe contener al menos 8 caracteres, mayúsculas, minúsculas y números
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Guardando...' : (usuario ? 'Actualizar Usuario' : 'Crear Usuario')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
