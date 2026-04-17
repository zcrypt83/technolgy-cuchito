// Tipos TypeScript para el sistema

export type Rol =
  | 'administrador'
  | 'encargado_almacen'
  | 'usuario_operativo'
  | 'ADMINISTRADOR'
  | 'ENCARGADO_ALMACEN'
  | 'USUARIO_OPERATIVO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
  username?: string;
  activo?: boolean;
  estado?: boolean;
  almacen_asignado_id?: number | null;
  almacenAsignadoId?: number | null;
  almacen_asignado?: Almacen | null;
}

export interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: number;
  marca: string;
  modelo: string;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
  stock_maximo: number;
  proveedor_id: number;
  imagen_url: string | null;
  activo: boolean;
}

export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  capacidad: number;
  encargado_id: number | null;
  activo: boolean;
}

export interface Inventario {
  id: number;
  producto_id: number;
  almacen_id: number;
  stock_actual: number;
  stock_reservado: number;
  stock_disponible: number;
}

export interface Movimiento {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA';
  subtipo: string;
  producto_id: number;
  almacen_id: number;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
  usuario_id: number;
  documento: string;
  fecha: Date;
}

export interface DashboardStats {
  totalProductos: number;
  valorTotalInventario: number;
  productosStockCritico: number;
  productosAgotados: number;
  entradasDelMes: number;
  salidasDelMes: number;
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
}

export interface Alerta {
  id: number;
  tipo: 'STOCK_MINIMO' | 'STOCK_AGOTADO' | 'STOCK_EXCESIVO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  producto_id: number;
  almacen_id: number;
  stock_actual: number;
  stock_minimo: number;
  mensaje: string;
  estado: 'ACTIVA' | 'ATENDIDA' | 'IGNORADA';
  fecha_creacion: Date;
}

export interface Proveedor {
  id: number;
  codigo: string;
  nombre: string;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  activo: boolean;
}
