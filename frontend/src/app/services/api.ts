import { env } from '../../config/env';
import { emitDataChanged } from './realtime';

const API_URL = env.API_URL;

type AnyRecord = Record<string, any>;

const toNumber = (value: any, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBool = (value: any, fallback = true): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const toArray = (payload: any, keys: string[] = []): any[] => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeResponseList = <T>(payload: any, keys: string[], mapper: (item: any) => T) => {
  const items = toArray(payload, keys).map(mapper);

  return {
    data: items,
    total: payload?.total ?? items.length,
    page: payload?.page ?? 1,
    totalPages: payload?.totalPages ?? 1,
  };
};

const normalizeUsuario = (raw: AnyRecord = {}) => {
  const almacenes = Array.isArray(raw.almacenes) ? raw.almacenes : [];
  const almacenAsignadoId =
    raw.almacen_asignado_id ??
    raw.almacenAsignadoId ??
    raw.almacenAsignado?.id ??
    almacenes[0]?.id ??
    null;

  return {
    id: raw.id,
    nombre: raw.nombre ?? '',
    email: raw.email ?? '',
    username: raw.username ?? (raw.email ? String(raw.email).split('@')[0] : ''),
    rol: raw.rol ?? 'usuario_operativo',
    telefono: raw.telefono ?? '',
    estado: toBool(raw.estado, true),
    activo: toBool(raw.activo ?? raw.estado, true),
    almacen_asignado_id: almacenAsignadoId,
    almacenAsignadoId,
    almacen_asignado: raw.almacenAsignado ?? null,
    almacenes,
  };
};

const normalizeAlmacen = (raw: AnyRecord = {}) => {
  const encargadoId = raw.encargado_id ?? raw.encargadoId ?? raw.encargado?.id ?? null;
  const capacidad = toNumber(raw.capacidad ?? raw.capacidad_maxima, 0);

  return {
    id: raw.id,
    codigo: raw.codigo ?? '',
    nombre: raw.nombre ?? '',
    direccion: raw.direccion ?? '',
    ciudad: raw.ciudad ?? '',
    telefono: raw.telefono ?? raw.encargado?.telefono ?? '',
    encargado_id: encargadoId,
    encargadoId,
    capacidad,
    capacidad_maxima: capacidad,
    estado: toBool(raw.estado, true),
    activo: toBool(raw.activo ?? raw.estado, true),
    encargado: raw.encargado,
  };
};

const normalizeProducto = (raw: AnyRecord = {}) => {
  const inventarios = Array.isArray(raw.inventarios) ? raw.inventarios : [];
  const stockActual = toNumber(
    raw.stock_actual ??
      raw.stockActual ??
      raw.cantidad ??
      inventarios.reduce((sum, inv) => sum + toNumber(inv?.cantidad, 0), 0),
    0
  );

  const stockMinimo = toNumber(raw.stock_minimo ?? raw.stockMinimo, 0);
  const stockMaximo = toNumber(raw.stock_maximo ?? raw.stockMaximo, 0);

  const codigo = raw.codigo ?? raw.sku ?? '';
  const categoriaId = raw.categoria_id ?? raw.categoriaId ?? raw.categoria?.id ?? null;
  const proveedorId = raw.proveedor_id ?? raw.proveedorId ?? raw.proveedor?.id ?? null;

  const precioCompra = toNumber(raw.precio_compra ?? raw.precioCompra ?? raw.precio, 0);
  const precioVenta = toNumber(raw.precio_venta ?? raw.precioVenta ?? raw.precio, 0);

  return {
    id: raw.id,
    codigo,
    sku: codigo,
    nombre: raw.nombre ?? '',
    descripcion: raw.descripcion ?? '',
    marca: raw.marca ?? '',
    modelo: raw.modelo ?? '',
    categoria_id: categoriaId,
    categoriaId,
    proveedor_id: proveedorId,
    proveedorId,
    precio: precioVenta,
    precio_compra: precioCompra,
    precioCompra,
    precio_venta: precioVenta,
    precioVenta,
    stock_minimo: stockMinimo,
    stockMinimo,
    stock_maximo: stockMaximo,
    stockMaximo,
    stock_actual: stockActual,
    stockActual,
    unidad_medida: raw.unidad_medida ?? raw.unidadMedida ?? 'unidad',
    unidadMedida: raw.unidad_medida ?? raw.unidadMedida ?? 'unidad',
    estado: toBool(raw.estado, true),
    activo: toBool(raw.activo ?? raw.estado, true),
    categoria: raw.categoria,
    proveedor: raw.proveedor,
    inventarios,
  };
};

const normalizeInventario = (raw: AnyRecord = {}) => {
  const producto = raw.producto ? normalizeProducto(raw.producto) : undefined;
  const almacen = raw.almacen ? normalizeAlmacen(raw.almacen) : undefined;

  const stockActual = toNumber(raw.stock_actual ?? raw.stockActual ?? raw.cantidad, 0);
  const stockReservado = toNumber(raw.stock_reservado ?? raw.stockReservado, 0);

  return {
    id: raw.id,
    producto_id: raw.producto_id ?? raw.productoId ?? producto?.id ?? null,
    productoId: raw.producto_id ?? raw.productoId ?? producto?.id ?? null,
    almacen_id: raw.almacen_id ?? raw.almacenId ?? almacen?.id ?? null,
    almacenId: raw.almacen_id ?? raw.almacenId ?? almacen?.id ?? null,
    stock_actual: stockActual,
    stockActual,
    stock_reservado: stockReservado,
    stockReservado,
    stock_disponible: stockActual - stockReservado,
    stockDisponible: stockActual - stockReservado,
    ultima_actualizacion: raw.ultima_actualizacion ?? raw.ultimaActualizacion ?? null,
    producto,
    almacen,
  };
};

const normalizeMovimiento = (raw: AnyRecord = {}) => {
  const producto = raw.producto ? normalizeProducto(raw.producto) : undefined;
  const almacenOrigen = raw.almacenOrigen ? normalizeAlmacen(raw.almacenOrigen) : undefined;
  const almacenDestino = raw.almacenDestino ? normalizeAlmacen(raw.almacenDestino) : undefined;
  const almacen = almacenDestino ?? almacenOrigen ?? null;

  const motivo = raw.motivo ?? raw.subtipo ?? '';
  const subtipo = String(motivo).toLowerCase().includes('venta')
    ? 'venta'
    : String(motivo).toLowerCase().includes('compra')
      ? 'compra'
      : motivo;

  const precioUnitario = toNumber(
    raw.precio_unitario ?? raw.precioUnitario ?? producto?.precio_venta ?? producto?.precio ?? 0,
    0
  );
  const cantidad = toNumber(raw.cantidad, 0);

  return {
    id: raw.id,
    tipo: raw.tipo ?? '',
    subtipo,
    producto_id: raw.producto_id ?? raw.productoId ?? producto?.id ?? null,
    productoId: raw.producto_id ?? raw.productoId ?? producto?.id ?? null,
    almacen_origen_id: raw.almacen_origen_id ?? raw.almacenOrigenId ?? almacenOrigen?.id ?? null,
    almacenOrigenId: raw.almacen_origen_id ?? raw.almacenOrigenId ?? almacenOrigen?.id ?? null,
    almacen_destino_id: raw.almacen_destino_id ?? raw.almacenDestinoId ?? almacenDestino?.id ?? null,
    almacenDestinoId: raw.almacen_destino_id ?? raw.almacenDestinoId ?? almacenDestino?.id ?? null,
    cantidad,
    motivo,
    documento: raw.documento ?? raw.numeroDocumento ?? null,
    numeroDocumento: raw.documento ?? raw.numeroDocumento ?? null,
    precio_unitario: precioUnitario,
    precioUnitario,
    valor_total: toNumber(raw.valor_total ?? raw.valorTotal, precioUnitario * cantidad),
    valorTotal: toNumber(raw.valor_total ?? raw.valorTotal, precioUnitario * cantidad),
    usuario: raw.usuario ? normalizeUsuario(raw.usuario) : undefined,
    fecha: raw.fecha,
    producto,
    almacenOrigen,
    almacenDestino,
    almacen,
  };
};

const normalizeAuditoria = (raw: AnyRecord = {}) => {
  return {
    id: raw.id,
    usuario_id: raw.usuario_id ?? raw.usuarioId ?? raw.usuario?.id ?? null,
    usuarioId: raw.usuario_id ?? raw.usuarioId ?? raw.usuario?.id ?? null,
    accion: raw.accion ?? '',
    tabla: raw.tabla ?? raw.entidad ?? '',
    entidad: raw.entidad ?? raw.tabla ?? '',
    registro_id: raw.registro_id ?? raw.entidadId ?? raw.entidad_id ?? null,
    entidadId: raw.registro_id ?? raw.entidadId ?? raw.entidad_id ?? null,
    detalles: raw.detalles ?? '',
    ip_address: raw.ip_address ?? raw.ipAddress ?? '',
    ipAddress: raw.ip_address ?? raw.ipAddress ?? '',
    fecha: raw.fecha ? new Date(raw.fecha) : null,
    usuario: raw.usuario ? normalizeUsuario(raw.usuario) : undefined,
  };
};

const normalizeCategoria = (raw: AnyRecord = {}) => ({
  ...raw,
  estado: toBool(raw.estado, true),
  activo: toBool(raw.activo ?? raw.estado, true),
});

const normalizeProveedor = (raw: AnyRecord = {}) => ({
  ...raw,
  estado: toBool(raw.estado, true),
  activo: toBool(raw.activo ?? raw.estado, true),
});

const mapProductoPayload = (producto: AnyRecord) => {
  const payload: AnyRecord = {
    codigo: producto.codigo ?? producto.sku,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoriaId: producto.categoriaId ?? producto.categoria_id,
    proveedorId: producto.proveedorId ?? producto.proveedor_id,
    precioCompra: toNumber(producto.precioCompra ?? producto.precio_compra ?? producto.precio, 0),
    precioVenta: toNumber(producto.precioVenta ?? producto.precio_venta ?? producto.precio, 0),
    unidadMedida: producto.unidadMedida ?? producto.unidad_medida ?? 'unidad',
    stockMinimo: toNumber(producto.stockMinimo ?? producto.stock_minimo, 0),
    stockMaximo: toNumber(producto.stockMaximo ?? producto.stock_maximo, 0),
    estado: toBool(producto.estado ?? producto.activo, true),
  };

  const stockActualRaw = producto.stockActual ?? producto.stock_actual ?? producto.stockInicial ?? producto.stock_inicial;
  const almacenIdRaw = producto.almacenId ?? producto.almacen_id;
  const hasAlmacen = almacenIdRaw !== undefined && almacenIdRaw !== null && almacenIdRaw !== '';

  if (hasAlmacen) {
    payload.almacenId = toNumber(almacenIdRaw, 0);
  }

  if (hasAlmacen && stockActualRaw !== undefined && stockActualRaw !== null && stockActualRaw !== '') {
    payload.stockActual = toNumber(stockActualRaw, 0);
  }

  return payload;
};

const mapAlmacenPayload = (almacen: AnyRecord) => ({
  codigo: almacen.codigo,
  nombre: almacen.nombre,
  direccion: almacen.direccion,
  ciudad: almacen.ciudad,
  capacidad: toNumber(almacen.capacidad ?? almacen.capacidad_maxima, 0),
  encargadoId: almacen.encargadoId ?? almacen.encargado_id ?? undefined,
  estado: toBool(almacen.estado ?? almacen.activo, true),
});

const mapUsuarioPayload = (usuario: AnyRecord) => ({
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  telefono: usuario.telefono,
  password: usuario.password,
  estado: toBool(usuario.estado ?? usuario.activo, true),
  almacenAsignadoId:
    usuario.rol === 'administrador'
      ? null
      : (usuario.almacenAsignadoId ?? usuario.almacen_asignado_id ?? null),
});

const mapMovimientoPayload = (movimiento: AnyRecord) => {
  const productoId = toNumber(movimiento.productoId ?? movimiento.producto_id, 0);
  const almacenOrigenId = toNumber(movimiento.almacenOrigenId ?? movimiento.almacen_origen_id, 0);
  const almacenDestinoId = toNumber(movimiento.almacenDestinoId ?? movimiento.almacen_destino_id, 0);
  const motivo = String(movimiento.motivo ?? movimiento.subtipo ?? '').trim();

  return {
    tipo: movimiento.tipo,
    productoId,
    cantidad: toNumber(movimiento.cantidad, 0),
    almacenOrigenId: almacenOrigenId > 0 ? almacenOrigenId : undefined,
    almacenDestinoId: almacenDestinoId > 0 ? almacenDestinoId : undefined,
    motivo: motivo || 'Movimiento registrado',
    numeroDocumento: movimiento.numeroDocumento ?? movimiento.documento ?? undefined,
  };
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const method = String(options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    cache: method === 'GET' ? 'no-store' : options.cache,
    headers,
  });

  const rawBody = await response.text();
  let body: any = null;
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { error: rawBody };
    }
  }

  if (!response.ok) {
    throw new Error(body?.error || body?.message || 'Error en la peticion');
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !endpoint.startsWith('/auth/')) {
    emitDataChanged({ endpoint, method });
  }

  return body;
};

export const login = async (email: string, password: string) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = async (userData: any) => request('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const getProfile = async () => normalizeUsuario(await request('/auth/profile'));

export const getProductos = async (params?: {
  search?: string;
  categoriaId?: number;
  proveedorId?: number;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/productos${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['productos'], normalizeProducto);
};

export const getProductoById = async (id: number) => normalizeProducto(await request(`/productos/${id}`));

export const createProducto = async (producto: any) =>
  normalizeProducto(await request('/productos', {
    method: 'POST',
    body: JSON.stringify(mapProductoPayload(producto)),
  }));

export const updateProducto = async (id: number, producto: any) =>
  normalizeProducto(await request(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapProductoPayload(producto)),
  }));

export const deleteProducto = async (id: number) =>
  request(`/productos/${id}`, { method: 'DELETE' });

export const getInventario = async (params?: {
  almacenId?: number;
  search?: string;
  stockBajo?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/inventario${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['inventario'], normalizeInventario);
};

export const getInventarioByProducto = async (productoId: number) =>
  normalizeResponseList(await request(`/inventario/producto/${productoId}`), [], normalizeInventario);

export const updateInventario = async (id: number, cantidad: number) =>
  normalizeInventario(await request(`/inventario/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad }),
  }));

export const getMovimientos = async (params?: {
  tipo?: string;
  almacenId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/movimientos${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['movimientos'], normalizeMovimiento);
};

export const createMovimiento = async (movimiento: any) =>
  normalizeMovimiento(await request('/movimientos', {
    method: 'POST',
    body: JSON.stringify(mapMovimientoPayload(movimiento)),
  }));

export const getAlmacenes = async (params?: { search?: string; estado?: boolean }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/almacenes${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, [], normalizeAlmacen);
};

export const getAlmacenById = async (id: number) => normalizeAlmacen(await request(`/almacenes/${id}`));

export const createAlmacen = async (almacen: any) =>
  normalizeAlmacen(await request('/almacenes', {
    method: 'POST',
    body: JSON.stringify(mapAlmacenPayload(almacen)),
  }));

export const updateAlmacen = async (id: number, almacen: any) =>
  normalizeAlmacen(await request(`/almacenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapAlmacenPayload(almacen)),
  }));

export const deleteAlmacen = async (id: number) =>
  request(`/almacenes/${id}`, { method: 'DELETE' });

export const getUsuarios = async (params?: { search?: string; rol?: string; estado?: boolean }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/usuarios${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, [], normalizeUsuario);
};

export const getUsuarioById = async (id: number) => normalizeUsuario(await request(`/usuarios/${id}`));

export const createUsuario = async (usuario: any) =>
  normalizeUsuario(await request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(mapUsuarioPayload(usuario)),
  }));

export const updateUsuario = async (id: number, usuario: any) =>
  normalizeUsuario(await request(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapUsuarioPayload(usuario)),
  }));

export const deleteUsuario = async (id: number) =>
  request(`/usuarios/${id}`, { method: 'DELETE' });

export const changePassword = async (id: number, oldPassword: string, newPassword: string) =>
  request(`/usuarios/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });

export const getCategorias = async (params?: { search?: string; estado?: boolean }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/categorias${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, [], normalizeCategoria);
};

export const getCategoriaById = async (id: number) => normalizeCategoria(await request(`/categorias/${id}`));

export const createCategoria = async (categoria: any) =>
  normalizeCategoria(await request('/categorias', {
    method: 'POST',
    body: JSON.stringify(categoria),
  }));

export const updateCategoria = async (id: number, categoria: any) =>
  normalizeCategoria(await request(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  }));

export const deleteCategoria = async (id: number) =>
  request(`/categorias/${id}`, { method: 'DELETE' });

export const getProveedores = async (params?: { search?: string; estado?: boolean }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/proveedores${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, [], normalizeProveedor);
};

export const getProveedorById = async (id: number) => normalizeProveedor(await request(`/proveedores/${id}`));

export const createProveedor = async (proveedor: any) =>
  normalizeProveedor(await request('/proveedores', {
    method: 'POST',
    body: JSON.stringify(proveedor),
  }));

export const updateProveedor = async (id: number, proveedor: any) =>
  normalizeProveedor(await request(`/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proveedor),
  }));

export const deleteProveedor = async (id: number) =>
  request(`/proveedores/${id}`, { method: 'DELETE' });

export const getAuditorias = async (params?: {
  entidad?: string;
  accion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/auditoria${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['auditorias'], normalizeAuditoria);
};

export const getAuditoriasByUsuario = async (usuarioId: number, params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/auditoria/usuario/${usuarioId}${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['auditorias'], normalizeAuditoria);
};

export const getAuditoriasByEntidad = async (entidad: string, entidadId: number, params?: { page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const payload = await request(`/auditoria/entidad/${entidad}/${entidadId}${queryParams ? `?${queryParams}` : ''}`);
  return normalizeResponseList(payload, ['auditorias'], normalizeAuditoria);
};

export const getRolePermissions = async () => request('/configuracion/permisos-rol');

export const getConfiguracionAdmin = async () => request('/configuracion/admin');

export const updateRolePermissions = async (rolePermissions: Record<string, string[]>) =>
  request('/configuracion/permisos', {
    method: 'PUT',
    body: JSON.stringify({ rolePermissions }),
  });

export const updateAuditActions = async (auditEnabledActions: string[]) =>
  request('/configuracion/acciones-auditoria', {
    method: 'PUT',
    body: JSON.stringify({ auditEnabledActions }),
  });

export const healthCheck = async () => request('/health');

export const handleApiError = (error: any) => {
  if (error?.message) return error.message;
  return 'Error desconocido en la peticion';
};
