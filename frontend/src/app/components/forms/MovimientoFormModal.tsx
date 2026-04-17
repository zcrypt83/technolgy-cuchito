import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle, ArrowUp, ArrowDown, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Producto, Almacen } from '../../types';

interface MovimientoFormData {
  tipo: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
  producto_id: number;
  cantidad: number;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
  motivo?: string;
  observaciones?: string;
}

interface MovimientoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MovimientoFormData) => void;
  productos: Producto[];
  almacenes: Almacen[];
  tipoInicial?: 'entrada' | 'salida' | 'transferencia';
  loading?: boolean;
}

export function MovimientoFormModal({
  open,
  onClose,
  onSubmit,
  productos,
  almacenes,
  tipoInicial = 'entrada',
  loading = false
}: MovimientoFormModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MovimientoFormData>({
    defaultValues: {
      tipo: tipoInicial
    }
  });

  const tipoMovimiento = watch('tipo');

  useEffect(() => {
    reset({
      tipo: tipoInicial,
      producto_id: 0,
      cantidad: 0,
      almacen_origen_id: 0,
      almacen_destino_id: 0,
      motivo: '',
      observaciones: '',
    });
  }, [reset, open, tipoInicial]);

  const handleFormSubmit = (data: MovimientoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Registrar Movimiento</DialogTitle>
              <DialogDescription className="mt-1">
                Completa los datos del movimiento de inventario
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tipo de Movimiento */}
          <div className="space-y-2">
            <Label>
              Tipo de Movimiento <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoMovimiento === 'entrada' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="entrada"
                  {...register('tipo')}
                  className="sr-only"
                />
                <div className="text-center">
                  <ArrowUp className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'entrada' ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${tipoMovimiento === 'entrada' ? 'text-green-900' : 'text-gray-900'}`}>
                    Entrada
                  </span>
                </div>
              </label>

              <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoMovimiento === 'salida' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="salida"
                  {...register('tipo')}
                  className="sr-only"
                />
                <div className="text-center">
                  <ArrowDown className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'salida' ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${tipoMovimiento === 'salida' ? 'text-red-900' : 'text-gray-900'}`}>
                    Salida
                  </span>
                </div>
              </label>

              <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                tipoMovimiento === 'transferencia' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="transferencia"
                  {...register('tipo')}
                  className="sr-only"
                />
                <div className="text-center">
                  <ArrowRightLeft className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'transferencia' ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${tipoMovimiento === 'transferencia' ? 'text-blue-900' : 'text-gray-900'}`}>
                    Transferencia
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Producto */}
            <div className="space-y-2">
              <Label htmlFor="producto">
                Producto <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('producto_id', {
                  required: 'El producto es obligatorio',
                  setValueAs: (value) => Number(value),
                  validate: (value) => Number.isInteger(value) && value > 0 ? true : 'Selecciona un producto válido'
                })}
                className={`w-full px-3 py-2 border rounded-md ${errors.producto_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value={0}>Seleccionar producto...</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} ({producto.sku})
                  </option>
                ))}
              </select>
              {errors.producto_id && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.producto_id.message}
                </p>
              )}
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                step={1}
                {...register('cantidad', {
                  required: 'La cantidad es obligatoria',
                  setValueAs: (value) => {
                    if (typeof value === 'number') return value;
                    if (typeof value === 'string') {
                      const normalized = value.trim().replace(',', '.');
                      const parsed = Number(normalized);
                      return Number.isFinite(parsed) ? parsed : 0;
                    }
                    return 0;
                  },
                  min: { value: 1, message: 'Mínimo 1 unidad' }
                })}
                placeholder="0"
                className={errors.cantidad ? 'border-red-500' : ''}
              />
              {errors.cantidad && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.cantidad.message}
                </p>
              )}
            </div>

            {/* Almacén Origen (solo para transferencias) */}
            {tipoMovimiento === 'transferencia' && (
              <div className="space-y-2">
                <Label htmlFor="almacen_origen">
                  Almacén Origen <span className="text-red-600">*</span>
                </Label>
                <select
                  {...register('almacen_origen_id', {
                    required: tipoMovimiento === 'transferencia' ? 'El almacén origen es obligatorio' : false,
                    setValueAs: (value) => Number(value),
                    validate: (value) =>
                      tipoMovimiento !== 'transferencia' || (Number.isInteger(value) && value > 0)
                        ? true
                        : 'Selecciona un almacén origen válido'
                  })}
                  className={`w-full px-3 py-2 border rounded-md ${errors.almacen_origen_id ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={0}>Seleccionar almacén...</option>
                  {almacenes.map((almacen) => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
                {errors.almacen_origen_id && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.almacen_origen_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Almacén Destino */}
            <div className="space-y-2">
              <Label htmlFor="almacen_destino">
                Almacén {tipoMovimiento === 'transferencia' ? 'Destino' : ''} <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('almacen_destino_id', {
                  required: 'El almacén es obligatorio',
                  setValueAs: (value) => Number(value),
                  validate: (value) => Number.isInteger(value) && value > 0 ? true : 'Selecciona un almacén válido'
                })}
                className={`w-full px-3 py-2 border rounded-md ${errors.almacen_destino_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value={0}>Seleccionar almacén...</option>
                {almacenes.map((almacen) => (
                  <option key={almacen.id} value={almacen.id}>
                    {almacen.nombre}
                  </option>
                ))}
              </select>
              {errors.almacen_destino_id && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.almacen_destino_id.message}
                </p>
              )}
            </div>

            {/* Motivo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                {...register('motivo')}
                placeholder={
                  tipoMovimiento === 'entrada' ? 'Compra a proveedor' :
                  tipoMovimiento === 'salida' ? 'Venta a cliente' :
                  'Rebalanceo de stock'
                }
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <textarea
                id="observaciones"
                {...register('observaciones')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                placeholder="Ingrese cualquier detalle adicional..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
