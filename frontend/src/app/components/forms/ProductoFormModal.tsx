import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Producto, Categoria, Proveedor } from '../../types';

interface ProductoFormData {
  sku: string;
  nombre: string;
  descripcion?: string;
  marca: string;
  modelo?: string;
  categoria_id: number;
  proveedor_id: number;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
  stock_maximo: number;
}

interface ProductoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoFormData) => void;
  producto?: Producto | null;
  categorias: Categoria[];
  proveedores: Proveedor[];
  loading?: boolean;
}

export function ProductoFormModal({
  open,
  onClose,
  onSubmit,
  producto,
  categorias,
  proveedores,
  loading = false
}: ProductoFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductoFormData>();

  useEffect(() => {
    if (producto) {
      reset({
        sku: producto.sku,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        marca: producto.marca || '',
        modelo: producto.modelo || '',
        categoria_id: producto.categoria_id,
        proveedor_id: producto.proveedor_id,
        precio_compra: Number(producto.precio_compra || 0),
        precio_venta: Number(producto.precio_venta || 0),
        stock_minimo: producto.stock_minimo,
        stock_maximo: producto.stock_maximo,
      });
    } else {
      reset({
        sku: '',
        nombre: '',
        descripcion: '',
        marca: '',
        modelo: '',
        categoria_id: 0,
        proveedor_id: 0,
        precio_compra: 0,
        precio_venta: 0,
        stock_minimo: 10,
        stock_maximo: 100,
      });
    }
  }, [producto, reset, open]);

  const handleFormSubmit = (data: ProductoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {producto ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {producto ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                Código SKU <span className="text-red-600">*</span>
              </Label>
              <Input
                id="sku"
                {...register('sku', {
                  required: 'El SKU es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message: 'SKU debe contener solo letras mayúsculas, números y guiones'
                  }
                })}
                placeholder="TECH-001"
                className={errors.sku ? 'border-red-500' : ''}
              />
              {errors.sku && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.sku.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Producto <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                placeholder="Laptop HP 15.6"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">
                Marca <span className="text-red-600">*</span>
              </Label>
              <Input
                id="marca"
                {...register('marca', { required: 'La marca es obligatoria' })}
                placeholder="HP"
                className={errors.marca ? 'border-red-500' : ''}
              />
              {errors.marca && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.marca.message}
                </p>
              )}
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...register('modelo')}
                placeholder="Pavilion 15-eg3000"
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('categoria_id', {
                  required: 'La categoría es obligatoria',
                  valueAsNumber: true
                })}
                className={`w-full px-3 py-2 border rounded-md ${errors.categoria_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value={0}>Seleccionar categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.categoria_id.message}
                </p>
              )}
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="proveedor">
                Proveedor <span className="text-red-600">*</span>
              </Label>
              <select
                {...register('proveedor_id', {
                  required: 'El proveedor es obligatorio',
                  valueAsNumber: true
                })}
                className={`w-full px-3 py-2 border rounded-md ${errors.proveedor_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value={0}>Seleccionar proveedor...</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
              {errors.proveedor_id && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.proveedor_id.message}
                </p>
              )}
            </div>

            {/* Precio Compra */}
            <div className="space-y-2">
              <Label htmlFor="precio_compra">
                Precio de Compra (S/) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="precio_compra"
                type="number"
                step="0.01"
                {...register('precio_compra', {
                  required: 'El precio de compra es obligatorio',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                })}
                placeholder="0.00"
                className={errors.precio_compra ? 'border-red-500' : ''}
              />
              {errors.precio_compra && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.precio_compra.message}
                </p>
              )}
            </div>

            {/* Precio Venta */}
            <div className="space-y-2">
              <Label htmlFor="precio_venta">
                Precio de Venta (S/) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="precio_venta"
                type="number"
                step="0.01"
                {...register('precio_venta', {
                  required: 'El precio de venta es obligatorio',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                })}
                placeholder="0.00"
                className={errors.precio_venta ? 'border-red-500' : ''}
              />
              {errors.precio_venta && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.precio_venta.message}
                </p>
              )}
            </div>

            {/* Stock Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="stock_minimo">
                Stock Mínimo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="stock_minimo"
                type="number"
                {...register('stock_minimo', {
                  required: 'El stock mínimo es obligatorio',
                  valueAsNumber: true,
                  min: { value: 1, message: 'El stock mínimo debe ser al menos 1' }
                })}
                placeholder="10"
                className={errors.stock_minimo ? 'border-red-500' : ''}
              />
              {errors.stock_minimo && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.stock_minimo.message}
                </p>
              )}
            </div>

            {/* Stock Máximo */}
            <div className="space-y-2">
              <Label htmlFor="stock_maximo">
                Stock Máximo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="stock_maximo"
                type="number"
                {...register('stock_maximo', {
                  required: 'El stock máximo es obligatorio',
                  valueAsNumber: true,
                  min: { value: 1, message: 'El stock máximo debe ser al menos 1' }
                })}
                placeholder="100"
                className={errors.stock_maximo ? 'border-red-500' : ''}
              />
              {errors.stock_maximo && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.stock_maximo.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                {...register('descripcion')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Guardando...' : (producto ? 'Actualizar Producto' : 'Crear Producto')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
