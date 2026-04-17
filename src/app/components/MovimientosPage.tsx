import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Search, ArrowUp, ArrowDown, ArrowRightLeft, X, AlertCircle } from 'lucide-react';

interface Movimiento {
  id: number;
  tipo: 'entrada' | 'salida' | 'transferencia';
  producto: string;
  cantidad: number;
  almacenOrigen?: string;
  almacenDestino: string;
  fecha: string;
  usuario: string;
  observaciones: string;
}

interface MovimientoFormData {
  tipo: 'entrada' | 'salida' | 'transferencia';
  producto: string;
  cantidad: number;
  almacenOrigen?: string;
  almacenDestino: string;
  observaciones: string;
}

export function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    { id: 1, tipo: 'entrada', producto: 'Laptop HP 15.6"', cantidad: 20, almacenDestino: 'Almacén Principal', fecha: '2026-04-09', usuario: 'Juan Pérez', observaciones: 'Nuevo stock' },
    { id: 2, tipo: 'salida', producto: 'Mouse Logitech G502', cantidad: 15, almacenDestino: 'Almacén Principal', fecha: '2026-04-09', usuario: 'María García', observaciones: 'Venta cliente' },
    { id: 3, tipo: 'transferencia', producto: 'Teclado Mecánico RGB', cantidad: 10, almacenOrigen: 'Almacén Principal', almacenDestino: 'Almacén Secundario', fecha: '2026-04-08', usuario: 'Carlos Rodríguez', observaciones: 'Rebalanceo de stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<MovimientoFormData>({
    defaultValues: {
      tipo: 'entrada',
    },
  });

  const tipoMovimiento = watch('tipo');

  const filteredMovimientos = movimientos.filter(m =>
    (m.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
     m.almacenDestino.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tipoFilter === '' || m.tipo === tipoFilter)
  );

  const paginatedMovimientos = filteredMovimientos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage);

  const handleOpenForm = () => {
    reset({
      tipo: 'entrada',
      producto: '',
      cantidad: 0,
      almacenOrigen: '',
      almacenDestino: '',
      observaciones: '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    reset();
  };

  const onSubmit = (data: MovimientoFormData) => {
    const newMovimiento: Movimiento = {
      id: Date.now(),
      ...data,
      fecha: new Date().toISOString().split('T')[0],
      usuario: 'Usuario Actual',
    };
    setMovimientos(prev => [newMovimiento, ...prev]);
    toast.success('Movimiento registrado correctamente');
    handleCloseForm();
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return <ArrowUp className="h-4 w-4" />;
      case 'salida': return <ArrowDown className="h-4 w-4" />;
      case 'transferencia': return <ArrowRightLeft className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return 'bg-green-100 text-green-800';
      case 'salida': return 'bg-red-100 text-red-800';
      case 'transferencia': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'salida': return 'Salida';
      case 'transferencia': return 'Transferencia';
      default: return tipo;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Movimientos de Inventario</h2>
          <p className="text-slate-600 mt-1">Registra entradas, salidas y transferencias de productos</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Entradas del Día</p>
              <p className="text-3xl font-bold text-green-600 mt-2">20</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Salidas del Día</p>
              <p className="text-3xl font-bold text-red-600 mt-2">15</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Transferencias</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">10</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto o almacén..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Total: {filteredMovimientos.length} movimientos encontrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Almacén</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedMovimientos.map((movimiento) => (
                <tr key={movimiento.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">{movimiento.fecha}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(movimiento.tipo)}`}>
                      {getTipoIcon(movimiento.tipo)}
                      <span className="ml-1">{getTipoLabel(movimiento.tipo)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{movimiento.producto}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-semibold text-slate-900">{movimiento.cantidad}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {movimiento.tipo === 'transferencia' ? (
                        <>
                          <p className="text-slate-600">{movimiento.almacenOrigen}</p>
                          <p className="text-slate-400">→ {movimiento.almacenDestino}</p>
                        </>
                      ) : (
                        <p className="text-slate-900">{movimiento.almacenDestino}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{movimiento.usuario}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{movimiento.observaciones}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Create Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Registrar Movimiento</h3>
                <p className="text-sm text-slate-600 mt-1">Completa los datos del movimiento de inventario</p>
              </div>
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Movimiento <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      tipoMovimiento === 'entrada' ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type="radio"
                        value="entrada"
                        {...register('tipo')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <ArrowUp className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'entrada' ? 'text-green-600' : 'text-slate-600'}`} />
                        <span className={`text-sm font-medium ${tipoMovimiento === 'entrada' ? 'text-green-900' : 'text-slate-900'}`}>
                          Entrada
                        </span>
                      </div>
                    </label>

                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      tipoMovimiento === 'salida' ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type="radio"
                        value="salida"
                        {...register('tipo')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <ArrowDown className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'salida' ? 'text-red-600' : 'text-slate-600'}`} />
                        <span className={`text-sm font-medium ${tipoMovimiento === 'salida' ? 'text-red-900' : 'text-slate-900'}`}>
                          Salida
                        </span>
                      </div>
                    </label>

                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      tipoMovimiento === 'transferencia' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <input
                        type="radio"
                        value="transferencia"
                        {...register('tipo')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <ArrowRightLeft className={`h-6 w-6 mx-auto mb-1 ${tipoMovimiento === 'transferencia' ? 'text-blue-600' : 'text-slate-600'}`} />
                        <span className={`text-sm font-medium ${tipoMovimiento === 'transferencia' ? 'text-blue-900' : 'text-slate-900'}`}>
                          Transferencia
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Producto <span className="text-red-600">*</span>
                    </label>
                    <select
                      {...register('producto', { required: 'El producto es obligatorio' })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                        errors.producto ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Laptop HP 15.6">Laptop HP 15.6"</option>
                      <option value="Mouse Logitech G502">Mouse Logitech G502</option>
                      <option value="Teclado Mecánico RGB">Teclado Mecánico RGB</option>
                      <option value="Monitor LG 24">Monitor LG 24"</option>
                    </select>
                    {errors.producto && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.producto.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cantidad <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('cantidad', {
                        required: 'La cantidad es obligatoria',
                        min: { value: 1, message: 'Mínimo 1 unidad' }
                      })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                        errors.cantidad ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.cantidad && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.cantidad.message}
                      </p>
                    )}
                  </div>
                </div>

                {tipoMovimiento === 'transferencia' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Almacén Origen <span className="text-red-600">*</span>
                    </label>
                    <select
                      {...register('almacenOrigen', {
                        required: tipoMovimiento === 'transferencia' ? 'El almacén origen es obligatorio' : false
                      })}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                        errors.almacenOrigen ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Almacén Principal">Almacén Principal</option>
                      <option value="Almacén Secundario">Almacén Secundario</option>
                      <option value="Almacén Norte">Almacén Norte</option>
                    </select>
                    {errors.almacenOrigen && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.almacenOrigen.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Almacén {tipoMovimiento === 'transferencia' ? 'Destino' : ''} <span className="text-red-600">*</span>
                  </label>
                  <select
                    {...register('almacenDestino', { required: 'El almacén es obligatorio' })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white ${
                      errors.almacenDestino ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Almacén Principal">Almacén Principal</option>
                    <option value="Almacén Secundario">Almacén Secundario</option>
                    <option value="Almacén Norte">Almacén Norte</option>
                  </select>
                  {errors.almacenDestino && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.almacenDestino.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    {...register('observaciones')}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Ingrese cualquier detalle adicional..."
                  />
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
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
