import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Search, Plus, Eye, Edit, Trash2, Package, TrendingUp, AlertCircle } from 'lucide-react';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import type { Producto } from '../../types';
import { ProductoFormModal } from '../forms/ProductoFormModal';
import { ConfirmDialog } from '../forms/ConfirmDialog';
import { useLiveData } from '../../hooks/useLiveData';

export const ProductosPage = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<any | null>(null);
  const [detallesOpen, setDetallesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);

  // Estados para formulario
  const [formOpen, setFormOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; producto: any | null }>({
    open: false,
    producto: null
  });

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const [productosRes, categoriasRes, proveedoresRes, almacenesRes] = await Promise.all([
        api.getProductos({ limit: 1000 }),
        api.getCategorias(),
        api.getProveedores(),
        api.getAlmacenes(),
      ]);

      setProductos(productosRes.data || productosRes);
      setCategorias(categoriasRes.data || categoriasRes);
      setProveedores(proveedoresRes.data || proveedoresRes);
      setAlmacenes((almacenesRes.data || almacenesRes).filter((a: any) => a.activo !== false));
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(true);
  }, []);

  useLiveData(() => loadData(false), { pollMs: 15000 });

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.marca && p.marca.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategoria = selectedCategoria === null || p.categoria_id === selectedCategoria;

      return matchesSearch && matchesCategoria && p.activo;
    });
  }, [searchTerm, selectedCategoria, productos]);

  const handleOpenForm = (producto?: any) => {
    setEditingProducto(producto || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProducto(null);
  };

  const handleSubmitForm = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingProducto) {
        await api.updateProducto(editingProducto.id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        await api.createProducto(data);
        toast.success('Producto creado correctamente');
      }

      await loadData(false);
      handleCloseForm();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      toast.error(error?.message || 'Error al guardar producto');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (producto: any) => {
    setDeleteConfirm({ open: true, producto });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.producto) return;

    try {
      await api.deleteProducto(deleteConfirm.producto.id);
      toast.success('Producto eliminado correctamente');
      await loadData(false);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setDeleteConfirm({ open: false, producto: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo de productos tecnológicos</p>
        </div>
        {hasPermission('productos.crear') && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Productos</CardTitle>
          <CardDescription>Total: {productosFiltrados.length} productos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategoria?.toString() || ''}
              onChange={(e) => setSelectedCategoria(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-gray-200 rounded-md bg-white text-sm"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => cat && (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-right">Stock Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map((producto) => {
                  const categoria = categorias.find(c => c.id === producto.categoria_id);
                  const stockBajo = producto.stock_actual <= producto.stock_minimo;

                  return (
                    <TableRow key={producto.id}>
                      <TableCell className="font-mono text-sm">{producto.sku}</TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{categoria?.nombre || '-'}</TableCell>
                      <TableCell>{producto.marca || '-'}</TableCell>
                      <TableCell className="text-right">
                        S/ {Number(producto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={stockBajo ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                          {producto.stock_actual || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockBajo ? 'destructive' : 'default'}>
                          {producto.stock_actual === 0 ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'Disponible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedProducto(producto); setDetallesOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('productos.editar') && (
                            <Button variant="ghost" size="sm" onClick={() => handleOpenForm(producto)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('productos.eliminar') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(producto)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detallesOpen} onOpenChange={setDetallesOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles del Producto</DialogTitle>
            <DialogDescription>
              Información completa del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedProducto && (() => {
            const categoria = categorias.find(c => c.id === selectedProducto.categoria_id);
            const stockBajo = selectedProducto.stock_actual <= selectedProducto.stock_minimo;

            return (
              <div className="space-y-6">
                {/* Información General */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Código SKU</p>
                        <p className="text-sm font-mono font-semibold">{selectedProducto.sku}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <Badge variant={stockBajo ? 'destructive' : 'default'} className="mt-1">
                          {selectedProducto.stock_actual === 0 ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'Disponible'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Nombre del Producto</p>
                      <p className="text-sm font-semibold">{selectedProducto.nombre}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        <p className="text-sm font-medium">{categoria?.nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Marca</p>
                        <p className="text-sm font-medium">{selectedProducto.marca}</p>
                      </div>
                    </div>
                    
                    {selectedProducto.modelo && (
                      <div>
                        <p className="text-sm text-gray-500">Modelo</p>
                        <p className="text-sm font-medium">{selectedProducto.modelo}</p>
                      </div>
                    )}
                    
                    {selectedProducto.descripcion && (
                      <div>
                        <p className="text-sm text-gray-500">Descripción</p>
                        <p className="text-sm text-gray-700">{selectedProducto.descripcion}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Información de Precios y Stock */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Precios y Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Precio de Compra</p>
                        <p className="text-sm font-semibold text-gray-700">
                          S/ {Number(selectedProducto.precio_compra || selectedProducto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio de Venta</p>
                        <p className="text-sm font-semibold text-green-600">
                          S/ {Number(selectedProducto.precio_venta || selectedProducto.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Stock Total</p>
                        <p className={`text-lg font-bold ${stockBajo ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedProducto.stock_actual || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stock Mínimo</p>
                        <p className="text-sm font-semibold text-orange-600">{selectedProducto.stock_minimo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stock Máximo</p>
                        <p className="text-sm font-semibold text-blue-600">{selectedProducto.stock_maximo}</p>
                      </div>
                    </div>

                    {stockBajo && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Stock en Nivel Crítico</p>
                          <p className="text-xs text-red-700 mt-1">
                            El stock actual está por debajo del mínimo configurado. Se recomienda reabastecer pronto.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Información del producto simplificada - Eliminar secciones que requieren datos adicionales */}
                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
                  <p>Categoría: {categoria?.nombre || '-'}</p>
                  <p>Marca: {selectedProducto.marca || '-'}</p>
                  {selectedProducto.descripcion && <p className="mt-2">Descripción: {selectedProducto.descripcion}</p>}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Formulario de Producto */}
      <ProductoFormModal
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        producto={editingProducto}
        categorias={categorias}
        proveedores={proveedores}
        almacenes={almacenes}
        loading={formLoading}
      />

      {/* Confirmación de Eliminación */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, producto: null })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Producto?"
        description={`¿Estás seguro de que deseas eliminar "${deleteConfirm.producto?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
};
