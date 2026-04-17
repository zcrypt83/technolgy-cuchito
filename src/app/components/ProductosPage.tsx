import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Eye, X, AlertCircle, Package } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface Producto {
  id: number;
  sku: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
}

interface ProductoFormData {
  sku: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, sku: 'TECH-001', nombre: 'Laptop HP 15.6"', marca: 'HP', categoria: 'Computadoras', precio: 2499, stock: 25, stockMinimo: 10, activo: true },
    { id: 2, sku: 'TECH-002', nombre: 'Mouse Logitech G502', marca: 'Logitech', categoria: 'Periféricos', precio: 159, stock: 5, stockMinimo: 10, activo: true },
    { id: 3, sku: 'TECH-003', nombre: 'Teclado Mecánico RGB', marca: 'Corsair', categoria: 'Periféricos', precio: 299, stock: 15, stockMinimo: 8, activo: true },
    { id: 4, sku: 'TECH-004', nombre: 'Monitor LG 24" Full HD', marca: 'LG', categoria: 'Monitores', precio: 699, stock: 12, stockMinimo: 6, activo: true },
    { id: 5, sku: 'TECH-005', nombre: 'SSD Samsung 1TB', marca: 'Samsung', categoria: 'Almacenamiento', precio: 350, stock: 30, stockMinimo: 15, activo: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Producto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; producto: Producto | null }>({ open: false, producto: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductoFormData>();

  const filteredProducts = productos.filter(p =>
    p.activo && (
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleOpenForm = (producto?: Producto) => {
    if (producto) {
      setEditingProduct(producto);
      reset({
        sku: producto.sku,
        nombre: producto.nombre,
        marca: producto.marca,
        categoria: producto.categoria,
        precio: producto.precio,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo,
      });
    } else {
      setEditingProduct(null);
      reset({
        sku: '',
        nombre: '',
        marca: '',
        categoria: '',
        precio: 0,
        stock: 0,
        stockMinimo: 0,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = (data: ProductoFormData) => {
    if (editingProduct) {
      setProductos(prev => prev.map(p =>
        p.id === editingProduct.id
          ? { ...p, ...data }
          : p
      ));
      toast.success('Producto actualizado correctamente');
    } else {
      const newProducto: Producto = {
        id: Date.now(),
        ...data,
        activo: true,
      };
      setProductos(prev => [newProducto, ...prev]);
      toast.success('Producto creado correctamente');
    }
    handleCloseForm();
  };

  const handleDelete = (producto: Producto) => {
    setDeleteConfirm({ open: true, producto });
  };

  const confirmDelete = () => {
    if (deleteConfirm.producto) {
      setProductos(prev => prev.map(p =>
        p.id === deleteConfirm.producto!.id ? { ...p, activo: false } : p
      ));
      toast.success('Producto eliminado correctamente');
      setDeleteConfirm({ open: false, producto: null });
    }
  };

  const handleView = (producto: Producto) => {
    setViewingProduct(producto);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Productos</h2>
          <p className="text-slate-600 mt-1">Administra el catálogo de productos tecnológicos</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Total: {filteredProducts.length} productos encontrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedProducts.map((producto) => {
                const stockBajo = producto.stock <= producto.stockMinimo;
                return (
                  <tr key={producto.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-slate-700">{producto.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{producto.nombre}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{producto.categoria}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{producto.marca}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-medium text-slate-900">S/ {producto.precio.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-semibold ${stockBajo ? 'text-red-600' : 'text-green-600'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        producto.stock === 0 ? 'bg-red-100 text-red-800' :
                        stockBajo ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {producto.stock === 0 ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(producto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(producto)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(producto)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {editingProduct ? 'Modifica los datos del producto' : 'Completa los datos del nuevo producto'}
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
                    SKU <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('sku', {
                      required: 'El SKU es obligatorio',
                      pattern: {
                        value: /^[A-Z]+-\d+$/,
                        message: 'Formato inválido (ej: TECH-001)'
                      }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.sku ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="TECH-001"
                  />
                  {errors.sku && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.sku.message}
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
                    placeholder="Laptop HP 15.6"
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
                    Marca <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('marca', { required: 'La marca es obligatoria' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.marca ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="HP"
                  />
                  {errors.marca && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.marca.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register('categoria', { required: 'La categoría es obligatoria' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                      errors.categoria ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Computadoras">Computadoras</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Monitores">Monitores</option>
                    <option value="Almacenamiento">Almacenamiento</option>
                    <option value="Redes">Redes</option>
                  </select>
                  {errors.categoria && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoria.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Precio (S/) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('precio', {
                      required: 'El precio es obligatorio',
                      min: { value: 0.01, message: 'El precio debe ser mayor a 0' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.precio ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.precio && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.precio.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock Inicial <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('stock', {
                      required: 'El stock es obligatorio',
                      min: { value: 0, message: 'El stock no puede ser negativo' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.stock ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock Mínimo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('stockMinimo', {
                      required: 'El stock mínimo es obligatorio',
                      min: { value: 1, message: 'El stock mínimo debe ser al menos 1' }
                    })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.stockMinimo ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="10"
                  />
                  {errors.stockMinimo && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.stockMinimo.message}
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
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && viewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detalles del Producto</h3>
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
                  <p className="text-sm text-slate-600 mb-1">Código SKU</p>
                  <p className="font-mono font-semibold text-slate-900">{viewingProduct.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    viewingProduct.stock === 0 ? 'bg-red-100 text-red-800' :
                    viewingProduct.stock <= viewingProduct.stockMinimo ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {viewingProduct.stock === 0 ? 'Agotado' :
                     viewingProduct.stock <= viewingProduct.stockMinimo ? 'Stock Bajo' :
                     'Disponible'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Nombre del Producto</p>
                <p className="text-lg font-semibold text-slate-900">{viewingProduct.nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Categoría</p>
                  <p className="font-medium text-slate-900">{viewingProduct.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Marca</p>
                  <p className="font-medium text-slate-900">{viewingProduct.marca}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Información Financiera</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Precio de Venta</p>
                    <p className="text-xl font-bold text-green-600">S/ {viewingProduct.precio.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">Información de Stock</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Stock Actual</p>
                    <p className={`text-xl font-bold ${
                      viewingProduct.stock <= viewingProduct.stockMinimo ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {viewingProduct.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Stock Mínimo</p>
                    <p className="text-xl font-bold text-orange-600">{viewingProduct.stockMinimo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Valor Total</p>
                    <p className="text-xl font-bold text-blue-600">
                      S/ {(viewingProduct.precio * viewingProduct.stock).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {viewingProduct.stock <= viewingProduct.stockMinimo && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900">Stock en Nivel Crítico</p>
                    <p className="text-sm text-red-700 mt-1">
                      El stock actual está por debajo del mínimo configurado. Se recomienda reabastecer pronto.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, producto: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar Producto?"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm.producto?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
