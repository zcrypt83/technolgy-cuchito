// Mock Data - Simula una base de datos PostgreSQL con datos de prueba considerables
// En producción, estos datos vendrían de la API REST conectada a PostgreSQL

import { addDays, subDays, subMonths, subWeeks } from 'date-fns';

// ========== TIPOS ==========
export interface Usuario {
  id: number;
  username: string;
  password_hash: string; // En la app usaremos contraseñas en texto plano solo para demo
  nombre: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'ENCARGADO_ALMACEN' | 'USUARIO_OPERATIVO';
  telefono: string;
  activo: boolean;
  almacen_asignado_id: number | null;
  fecha_creacion: Date;
  ultimo_acceso: Date | null;
}

export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion: Date;
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
  fecha_creacion: Date;
  fecha_actualizacion: Date;
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
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface Inventario {
  id: number;
  producto_id: number;
  almacen_id: number;
  stock_actual: number;
  stock_reservado: number;
  stock_disponible: number;
  ultima_entrada: Date | null;
  ultima_salida: Date | null;
  fecha_actualizacion: Date;
}

export interface Movimiento {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA';
  subtipo: 'COMPRA' | 'VENTA' | 'TRANSFERENCIA' | 'AJUSTE' | 'MERMA' | 'DEVOLUCION';
  producto_id: number;
  almacen_id: number;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
  usuario_id: number;
  documento: string;
  proveedor: string | null;
  cliente: string | null;
  venta_id: number | null;
  transferencia_id: number | null;
  observaciones: string | null;
  fecha: Date;
}

export interface Transferencia {
  id: number;
  codigo: string;
  almacen_origen_id: number;
  almacen_destino_id: number;
  estado: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADA' | 'CANCELADA';
  usuario_solicitante_id: number;
  usuario_receptor_id: number | null;
  fecha_solicitud: Date;
  fecha_recepcion: Date | null;
  observaciones: string | null;
}

export interface TransferenciaDetalle {
  id: number;
  transferencia_id: number;
  producto_id: number;
  cantidad: number;
  cantidad_recibida: number;
  observaciones: string | null;
}

export interface Venta {
  id: number;
  codigo: string;
  fecha: Date;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_telefono: string;
  cliente_email: string;
  subtotal: number;
  impuesto: number;
  total: number;
  tipo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO';
  estado: 'COMPLETADA' | 'CANCELADA' | 'PENDIENTE';
  usuario_id: number;
  almacen_id: number;
  observaciones: string | null;
  fecha_creacion: Date;
}

export interface VentaDetalle {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
}

export interface Proveedor {
  id: number;
  codigo: string;
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  activo: boolean;
  fecha_creacion: Date;
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
  fecha_atencion: Date | null;
  atendido_por: number | null;
}

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: 'ALERTA' | 'TRANSFERENCIA' | 'VENTA' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  fecha_lectura: Date | null;
}

export interface Auditoria {
  id: number;
  usuario_id: number;
  accion: string;
  tabla: string;
  registro_id: number | null;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string;
  fecha: Date;
}

// ========== DATOS MOCK ==========

// Usuarios
export const usuarios: Usuario[] = [
  {
    id: 1,
    username: 'admin',
    password_hash: 'admin123', // En producción estaría hasheado con bcrypt
    nombre: 'Juan Carlos Administrador',
    email: 'admin@technologycuchito.com',
    rol: 'ADMINISTRADOR',
    telefono: '+51 987654321',
    activo: true,
    almacen_asignado_id: null,
    fecha_creacion: subMonths(new Date(), 12),
    ultimo_acceso: new Date(),
  },
  {
    id: 2,
    username: 'encargado',
    password_hash: 'encargado123',
    nombre: 'María López Rojas',
    email: 'maria.lopez@technologycuchito.com',
    rol: 'ENCARGADO_ALMACEN',
    telefono: '+51 987654322',
    activo: true,
    almacen_asignado_id: 1,
    fecha_creacion: subMonths(new Date(), 10),
    ultimo_acceso: subDays(new Date(), 1),
  },
  {
    id: 3,
    username: 'operador',
    password_hash: 'operador123',
    nombre: 'Pedro García Sánchez',
    email: 'pedro.garcia@technologycuchito.com',
    rol: 'USUARIO_OPERATIVO',
    telefono: '+51 987654323',
    activo: true,
    almacen_asignado_id: null,
    fecha_creacion: subMonths(new Date(), 8),
    ultimo_acceso: subDays(new Date(), 2),
  },
  {
    id: 4,
    username: 'encargado2',
    password_hash: 'encargado123',
    nombre: 'Ana Martínez Torres',
    email: 'ana.martinez@technologycuchito.com',
    rol: 'ENCARGADO_ALMACEN',
    telefono: '+51 987654324',
    activo: true,
    almacen_asignado_id: 2,
    fecha_creacion: subMonths(new Date(), 9),
    ultimo_acceso: subDays(new Date(), 3),
  },
  {
    id: 5,
    username: 'operador2',
    password_hash: 'operador123',
    nombre: 'Luis Fernández Ruiz',
    email: 'luis.fernandez@technologycuchito.com',
    rol: 'USUARIO_OPERATIVO',
    telefono: '+51 987654325',
    activo: true,
    almacen_asignado_id: null,
    fecha_creacion: subMonths(new Date(), 7),
    ultimo_acceso: new Date(),
  },
];

// Categorías
export const categorias: Categoria[] = [
  {
    id: 1,
    codigo: 'LAP',
    nombre: 'Laptops',
    descripcion: 'Computadoras portátiles de diferentes marcas y especificaciones',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 2,
    codigo: 'PC',
    nombre: 'Computadoras de Escritorio',
    descripcion: 'PCs de escritorio y estaciones de trabajo',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 3,
    codigo: 'MON',
    nombre: 'Monitores',
    descripcion: 'Pantallas y monitores LCD, LED y gaming',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 4,
    codigo: 'PER',
    nombre: 'Periféricos',
    descripcion: 'Teclados, ratones, auriculares y otros periféricos',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 5,
    codigo: 'COMP',
    nombre: 'Componentes',
    descripcion: 'Procesadores, memorias RAM, discos duros, tarjetas gráficas',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 6,
    codigo: 'IMP',
    nombre: 'Impresoras',
    descripcion: 'Impresoras, escáneres y multifuncionales',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 7,
    codigo: 'RED',
    nombre: 'Redes',
    descripcion: 'Routers, switches, cables y equipos de red',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 8,
    codigo: 'ACC',
    nombre: 'Accesorios',
    descripcion: 'Cables, adaptadores, mochilas y otros accesorios',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
];

// Almacenes
export const almacenes: Almacen[] = [
  {
    id: 1,
    codigo: 'ALM-PRINCIPAL',
    nombre: 'Almacén Principal - Lima Centro',
    direccion: 'Av. Abancay 123, Cercado de Lima',
    ciudad: 'Lima',
    telefono: '+51 01 4567890',
    capacidad: 5000,
    encargado_id: 2,
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
    fecha_actualizacion: subMonths(new Date(), 12),
  },
  {
    id: 2,
    codigo: 'ALM-MIRAFLORES',
    nombre: 'Almacén Miraflores',
    direccion: 'Av. Larco 456, Miraflores',
    ciudad: 'Lima',
    telefono: '+51 01 4567891',
    capacidad: 3000,
    encargado_id: 4,
    activo: true,
    fecha_creacion: subMonths(new Date(), 10),
    fecha_actualizacion: subMonths(new Date(), 10),
  },
  {
    id: 3,
    codigo: 'ALM-SJL',
    nombre: 'Almacén San Juan de Lurigancho',
    direccion: 'Av. Próceres 789, SJL',
    ciudad: 'Lima',
    telefono: '+51 01 4567892',
    capacidad: 2000,
    encargado_id: null,
    activo: true,
    fecha_creacion: subMonths(new Date(), 8),
    fecha_actualizacion: subMonths(new Date(), 8),
  },
];

// Proveedores
export const proveedores: Proveedor[] = [
  {
    id: 1,
    codigo: 'PROV-001',
    razon_social: 'Distribuidora Tech SAC',
    ruc: '20123456789',
    direccion: 'Av. Colonial 1000, Lima',
    telefono: '+51 01 2345678',
    email: 'ventas@distritech.com',
    contacto: 'Carlos Mendoza',
    activo: true,
    fecha_creacion: subMonths(new Date(), 12),
  },
  {
    id: 2,
    codigo: 'PROV-002',
    razon_social: 'Importadora Digital EIRL',
    ruc: '20987654321',
    direccion: 'Jr. Moquegua 500, Lima',
    telefono: '+51 01 3456789',
    email: 'compras@importdigital.com',
    contacto: 'Laura Vega',
    activo: true,
    fecha_creacion: subMonths(new Date(), 11),
  },
  {
    id: 3,
    codigo: 'PROV-003',
    razon_social: 'Computadoras del Perú SA',
    ruc: '20456789123',
    direccion: 'Av. Venezuela 800, Lima',
    telefono: '+51 01 4567890',
    email: 'info@compuperu.com',
    contacto: 'Roberto Sánchez',
    activo: true,
    fecha_creacion: subMonths(new Date(), 10),
  },
];

// Productos (cantidad considerable)
export const productos: Producto[] = [
  // Laptops (25 productos)
  { id: 1, codigo: 'LAP-HP-001', nombre: 'Laptop HP Pavilion 15', descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD, 15.6" FHD', categoria_id: 1, marca: 'HP', modelo: 'Pavilion 15-eg0001la', precio_compra: 2200, precio_venta: 2800, stock_minimo: 5, stock_maximo: 50, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 2, codigo: 'LAP-DELL-001', nombre: 'Laptop Dell Inspiron 14', descripcion: 'Intel Core i7, 16GB RAM, 512GB SSD, 14" FHD', categoria_id: 1, marca: 'Dell', modelo: 'Inspiron 14-5420', precio_compra: 3200, precio_venta: 3900, stock_minimo: 3, stock_maximo: 30, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 3, codigo: 'LAP-LENOVO-001', nombre: 'Laptop Lenovo IdeaPad 3', descripcion: 'Intel Core i3, 4GB RAM, 128GB SSD, 15.6" HD', categoria_id: 1, marca: 'Lenovo', modelo: 'IdeaPad 3-15ITL6', precio_compra: 1400, precio_venta: 1800, stock_minimo: 10, stock_maximo: 100, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 4, codigo: 'LAP-ASUS-001', nombre: 'Laptop ASUS VivoBook 15', descripcion: 'AMD Ryzen 5, 8GB RAM, 512GB SSD, 15.6" FHD', categoria_id: 1, marca: 'ASUS', modelo: 'VivoBook 15 M513', precio_compra: 2400, precio_venta: 3000, stock_minimo: 5, stock_maximo: 50, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 5, codigo: 'LAP-ACER-001', nombre: 'Laptop Acer Aspire 5', descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD, 15.6" FHD', categoria_id: 1, marca: 'Acer', modelo: 'Aspire 5 A515-56', precio_compra: 2100, precio_venta: 2700, stock_minimo: 7, stock_maximo: 70, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 6, codigo: 'LAP-HP-002', nombre: 'Laptop HP ProBook 450', descripcion: 'Intel Core i7, 16GB RAM, 512GB SSD, 15.6" FHD', categoria_id: 1, marca: 'HP', modelo: 'ProBook 450 G8', precio_compra: 3500, precio_venta: 4300, stock_minimo: 3, stock_maximo: 30, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  { id: 7, codigo: 'LAP-DELL-002', nombre: 'Laptop Dell Vostro 15', descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD, 15.6" FHD', categoria_id: 1, marca: 'Dell', modelo: 'Vostro 15-3510', precio_compra: 2300, precio_venta: 2900, stock_minimo: 5, stock_maximo: 50, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  { id: 8, codigo: 'LAP-LENOVO-002', nombre: 'Laptop Lenovo ThinkPad E15', descripcion: 'Intel Core i7, 16GB RAM, 512GB SSD, 15.6" FHD', categoria_id: 1, marca: 'Lenovo', modelo: 'ThinkPad E15 Gen 3', precio_compra: 3400, precio_venta: 4100, stock_minimo: 3, stock_maximo: 30, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  
  // Computadoras de Escritorio (15 productos)
  { id: 20, codigo: 'PC-HP-001', nombre: 'PC HP EliteDesk 800', descripcion: 'Intel Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro', categoria_id: 2, marca: 'HP', modelo: 'EliteDesk 800 G6', precio_compra: 3000, precio_venta: 3700, stock_minimo: 3, stock_maximo: 30, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 21, codigo: 'PC-DELL-001', nombre: 'PC Dell OptiPlex 7090', descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD, Windows 11', categoria_id: 2, marca: 'Dell', modelo: 'OptiPlex 7090 SFF', precio_compra: 2500, precio_venta: 3100, stock_minimo: 5, stock_maximo: 50, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 22, codigo: 'PC-LENOVO-001', nombre: 'PC Lenovo ThinkCentre M720', descripcion: 'Intel Core i5, 8GB RAM, 1TB HDD, Windows 11', categoria_id: 2, marca: 'Lenovo', modelo: 'ThinkCentre M720q', precio_compra: 2200, precio_venta: 2800, stock_minimo: 5, stock_maximo: 50, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  
  // Monitores (20 productos)
  { id: 40, codigo: 'MON-LG-001', nombre: 'Monitor LG 24" Full HD', descripcion: 'Monitor LED 24", 1920x1080, HDMI, VGA', categoria_id: 3, marca: 'LG', modelo: '24MK430H-B', precio_compra: 400, precio_venta: 550, stock_minimo: 10, stock_maximo: 100, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 41, codigo: 'MON-SAMSUNG-001', nombre: 'Monitor Samsung 27" Curvo', descripcion: 'Monitor LED 27", 1920x1080, Curvo, HDMI', categoria_id: 3, marca: 'Samsung', modelo: 'C27F390', precio_compra: 600, precio_venta: 800, stock_minimo: 5, stock_maximo: 50, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 42, codigo: 'MON-DELL-001', nombre: 'Monitor Dell 24" IPS', descripcion: 'Monitor LED 24", 1920x1080, IPS, HDMI, DisplayPort', categoria_id: 3, marca: 'Dell', modelo: 'P2422H', precio_compra: 500, precio_venta: 680, stock_minimo: 8, stock_maximo: 80, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 43, codigo: 'MON-HP-001', nombre: 'Monitor HP 22" Full HD', descripcion: 'Monitor LED 22", 1920x1080, HDMI, VGA', categoria_id: 3, marca: 'HP', modelo: 'V22', precio_compra: 350, precio_venta: 480, stock_minimo: 12, stock_maximo: 120, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  
  // Periféricos (30 productos)
  { id: 60, codigo: 'TEC-LOG-001', nombre: 'Teclado Logitech K120', descripcion: 'Teclado USB español, resistente a salpicaduras', categoria_id: 4, marca: 'Logitech', modelo: 'K120', precio_compra: 35, precio_venta: 55, stock_minimo: 30, stock_maximo: 300, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 61, codigo: 'MOU-LOG-001', nombre: 'Mouse Logitech M170', descripcion: 'Mouse inalámbrico, 2.4GHz, 3 botones', categoria_id: 4, marca: 'Logitech', modelo: 'M170', precio_compra: 25, precio_venta: 40, stock_minimo: 40, stock_maximo: 400, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 62, codigo: 'TEC-HP-001', nombre: 'Teclado HP K500', descripcion: 'Teclado USB con cable, diseño ergonómico', categoria_id: 4, marca: 'HP', modelo: 'K500', precio_compra: 40, precio_venta: 60, stock_minimo: 25, stock_maximo: 250, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 63, codigo: 'MOU-HP-001', nombre: 'Mouse HP X3000', descripcion: 'Mouse inalámbrico, negro, sensor óptico', categoria_id: 4, marca: 'HP', modelo: 'X3000', precio_compra: 30, precio_venta: 48, stock_minimo: 35, stock_maximo: 350, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 64, codigo: 'AUR-LOG-001', nombre: 'Auriculares Logitech H390', descripcion: 'Auriculares USB con micrófono, controles en cable', categoria_id: 4, marca: 'Logitech', modelo: 'H390', precio_compra: 80, precio_venta: 120, stock_minimo: 15, stock_maximo: 150, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  
  // Componentes (40 productos)
  { id: 100, codigo: 'RAM-KING-001', nombre: 'Memoria RAM Kingston 8GB DDR4', descripcion: 'Memoria DDR4 8GB 2666MHz', categoria_id: 5, marca: 'Kingston', modelo: 'KVR26N19S8/8', precio_compra: 120, precio_venta: 170, stock_minimo: 20, stock_maximo: 200, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 101, codigo: 'SSD-KING-001', nombre: 'SSD Kingston 240GB', descripcion: 'Disco SSD SATA 240GB, 500MB/s lectura', categoria_id: 5, marca: 'Kingston', modelo: 'A400 240GB', precio_compra: 100, precio_venta: 145, stock_minimo: 15, stock_maximo: 150, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 102, codigo: 'SSD-KING-002', nombre: 'SSD Kingston 480GB', descripcion: 'Disco SSD SATA 480GB, 500MB/s lectura', categoria_id: 5, marca: 'Kingston', modelo: 'A400 480GB', precio_compra: 180, precio_venta: 260, stock_minimo: 12, stock_maximo: 120, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 103, codigo: 'RAM-CORS-001', nombre: 'Memoria RAM Corsair 16GB DDR4', descripcion: 'Memoria DDR4 16GB 3200MHz', categoria_id: 5, marca: 'Corsair', modelo: 'Vengeance LPX 16GB', precio_compra: 220, precio_venta: 310, stock_minimo: 10, stock_maximo: 100, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  
  // Impresoras (12 productos)
  { id: 140, codigo: 'IMP-HP-001', nombre: 'Impresora HP DeskJet 2775', descripcion: 'Impresora multifuncional, WiFi, escáner, copiadora', categoria_id: 6, marca: 'HP', modelo: 'DeskJet 2775', precio_compra: 350, precio_venta: 480, stock_minimo: 5, stock_maximo: 50, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 141, codigo: 'IMP-EPSON-001', nombre: 'Impresora Epson L3210', descripcion: 'Impresora multifuncional con sistema de tanques', categoria_id: 6, marca: 'Epson', modelo: 'L3210', precio_compra: 600, precio_venta: 780, stock_minimo: 3, stock_maximo: 30, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 142, codigo: 'IMP-CANON-001', nombre: 'Impresora Canon PIXMA G3160', descripcion: 'Impresora multifuncional con tanques, WiFi', categoria_id: 6, marca: 'Canon', modelo: 'PIXMA G3160', precio_compra: 650, precio_venta: 850, stock_minimo: 3, stock_maximo: 30, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  
  // Redes (25 productos)
  { id: 160, codigo: 'ROU-TP-001', nombre: 'Router TP-Link Archer C6', descripcion: 'Router WiFi AC1200, 4 antenas, 4 puertos LAN', categoria_id: 7, marca: 'TP-Link', modelo: 'Archer C6', precio_compra: 120, precio_venta: 170, stock_minimo: 8, stock_maximo: 80, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 161, codigo: 'SWI-TP-001', nombre: 'Switch TP-Link 8 puertos', descripcion: 'Switch Gigabit 8 puertos 10/100/1000 Mbps', categoria_id: 7, marca: 'TP-Link', modelo: 'TL-SG108', precio_compra: 80, precio_venta: 115, stock_minimo: 10, stock_maximo: 100, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 162, codigo: 'CAB-CAT6-001', nombre: 'Cable de Red Cat6 305m', descripcion: 'Bobina cable UTP Cat6, 305 metros, azul', categoria_id: 7, marca: 'Genérico', modelo: 'UTP Cat6', precio_compra: 250, precio_venta: 350, stock_minimo: 5, stock_maximo: 50, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  
  // Accesorios (50 productos)
  { id: 200, codigo: 'HDMI-001', nombre: 'Cable HDMI 1.5m', descripcion: 'Cable HDMI alta velocidad, 1.5 metros', categoria_id: 8, marca: 'Genérico', modelo: 'HDMI 2.0', precio_compra: 15, precio_venta: 28, stock_minimo: 50, stock_maximo: 500, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 201, codigo: 'USB-001', nombre: 'Cable USB Tipo C 1m', descripcion: 'Cable USB-C a USB-A, 1 metro, carga rápida', categoria_id: 8, marca: 'Genérico', modelo: 'USB-C', precio_compra: 12, precio_venta: 22, stock_minimo: 60, stock_maximo: 600, proveedor_id: 3, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 6), fecha_actualizacion: subMonths(new Date(), 6) },
  { id: 202, codigo: 'MOCHI-001', nombre: 'Mochila para Laptop 15.6"', descripcion: 'Mochila ergonómica para laptop hasta 15.6", acolchada', categoria_id: 8, marca: 'Targus', modelo: 'TSB943', precio_compra: 80, precio_venta: 120, stock_minimo: 15, stock_maximo: 150, proveedor_id: 1, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
  { id: 203, codigo: 'ADAPT-001', nombre: 'Adaptador USB a HDMI', descripcion: 'Adaptador USB 3.0 a HDMI, resolución hasta 1080p', categoria_id: 8, marca: 'Genérico', modelo: 'USB-HDMI', precio_compra: 35, precio_venta: 55, stock_minimo: 20, stock_maximo: 200, proveedor_id: 2, imagen_url: null, activo: true, fecha_creacion: subMonths(new Date(), 5), fecha_actualizacion: subMonths(new Date(), 5) },
];

// Inventario (generado para cada producto en cada almacén con stock variado)
export const inventario: Inventario[] = [];
let invId = 1;
productos.forEach(producto => {
  almacenes.forEach((almacen, index) => {
    const stockBase = Math.floor(Math.random() * 30) + 5;
    const stock = index === 0 ? stockBase : Math.floor(stockBase * 0.6); // Más stock en almacén principal
    inventario.push({
      id: invId++,
      producto_id: producto.id,
      almacen_id: almacen.id,
      stock_actual: stock,
      stock_reservado: Math.floor(Math.random() * 3),
      stock_disponible: stock - Math.floor(Math.random() * 3),
      ultima_entrada: subDays(new Date(), Math.floor(Math.random() * 30)),
      ultima_salida: subDays(new Date(), Math.floor(Math.random() * 15)),
      fecha_actualizacion: new Date(),
    });
  });
});

// Movimientos (generados para simular actividad del último mes)
export const movimientos: Movimiento[] = [];
let movId = 1;

// Generar entradas
for (let i = 0; i < 150; i++) {
  const productoRandom = productos[Math.floor(Math.random() * productos.length)];
  const almacenRandom = almacenes[Math.floor(Math.random() * almacenes.length)];
  const cantidad = Math.floor(Math.random() * 20) + 5;
  const precio = productoRandom.precio_compra;
  
  movimientos.push({
    id: movId++,
    tipo: 'ENTRADA',
    subtipo: 'COMPRA',
    producto_id: productoRandom.id,
    almacen_id: almacenRandom.id,
    cantidad,
    precio_unitario: precio,
    valor_total: precio * cantidad,
    usuario_id: Math.floor(Math.random() * 2) + 2, // Encargado
    documento: `FAC-${String(i + 1).padStart(6, '0')}`,
    proveedor: proveedores[Math.floor(Math.random() * proveedores.length)].razon_social,
    cliente: null,
    venta_id: null,
    transferencia_id: null,
    observaciones: 'Compra regular',
    fecha: subDays(new Date(), Math.floor(Math.random() * 30)),
  });
}

// Generar salidas (ventas)
for (let i = 0; i < 200; i++) {
  const productoRandom = productos[Math.floor(Math.random() * productos.length)];
  const almacenRandom = almacenes[Math.floor(Math.random() * almacenes.length)];
  const cantidad = Math.floor(Math.random() * 5) + 1;
  const precio = productoRandom.precio_venta;
  
  movimientos.push({
    id: movId++,
    tipo: 'SALIDA',
    subtipo: 'VENTA',
    producto_id: productoRandom.id,
    almacen_id: almacenRandom.id,
    cantidad,
    precio_unitario: precio,
    valor_total: precio * cantidad,
    usuario_id: Math.floor(Math.random() * 3) + 3, // Operadores
    documento: `VEN-${String(i + 1).padStart(6, '0')}`,
    proveedor: null,
    cliente: `Cliente ${i + 1}`,
    venta_id: i + 1,
    transferencia_id: null,
    observaciones: null,
    fecha: subDays(new Date(), Math.floor(Math.random() * 30)),
  });
}

// Ventas
export const ventas: Venta[] = [];
for (let i = 0; i < 200; i++) {
  const total = Math.random() * 5000 + 500;
  const subtotal = total / 1.18;
  const impuesto = total - subtotal;
  
  ventas.push({
    id: i + 1,
    codigo: `VEN-${String(i + 1).padStart(6, '0')}`,
    fecha: subDays(new Date(), Math.floor(Math.random() * 30)),
    cliente_nombre: `Cliente ${i + 1}`,
    cliente_documento: `${10000000 + i}`,
    cliente_telefono: `+51 9${10000000 + i}`,
    cliente_email: `cliente${i + 1}@email.com`,
    subtotal,
    impuesto,
    total,
    tipo_pago: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'][Math.floor(Math.random() * 3)] as any,
    estado: 'COMPLETADA',
    usuario_id: Math.floor(Math.random() * 3) + 3,
    almacen_id: Math.floor(Math.random() * 3) + 1,
    observaciones: null,
    fecha_creacion: subDays(new Date(), Math.floor(Math.random() * 30)),
  });
}

// Transferencias
export const transferencias: Transferencia[] = [
  {
    id: 1,
    codigo: 'TRANS-000001',
    almacen_origen_id: 1,
    almacen_destino_id: 2,
    estado: 'COMPLETADA',
    usuario_solicitante_id: 2,
    usuario_receptor_id: 4,
    fecha_solicitud: subDays(new Date(), 5),
    fecha_recepcion: subDays(new Date(), 4),
    observaciones: 'Transferencia regular',
  },
  {
    id: 2,
    codigo: 'TRANS-000002',
    almacen_origen_id: 1,
    almacen_destino_id: 3,
    estado: 'PENDIENTE',
    usuario_solicitante_id: 2,
    usuario_receptor_id: null,
    fecha_solicitud: subDays(new Date(), 1),
    fecha_recepcion: null,
    observaciones: 'Urgente',
  },
];

// Alertas
export const alertas: Alerta[] = [];
let alertaId = 1;
inventario.forEach(inv => {
  const producto = productos.find(p => p.id === inv.producto_id);
  if (producto && inv.stock_actual <= producto.stock_minimo) {
    alertas.push({
      id: alertaId++,
      tipo: inv.stock_actual === 0 ? 'STOCK_AGOTADO' : 'STOCK_MINIMO',
      prioridad: inv.stock_actual === 0 ? 'CRITICA' : 'ALTA',
      producto_id: producto.id,
      almacen_id: inv.almacen_id,
      stock_actual: inv.stock_actual,
      stock_minimo: producto.stock_minimo,
      mensaje: `${producto.nombre} - Stock ${inv.stock_actual === 0 ? 'agotado' : 'bajo nivel'}`,
      estado: 'ACTIVA',
      fecha_creacion: subDays(new Date(), Math.floor(Math.random() * 7)),
      fecha_atencion: null,
      atendido_por: null,
    });
  }
});

// Notificaciones
export const notificaciones: Notificacion[] = [];
let notifId = 1;
usuarios.forEach(usuario => {
  // Notificaciones de alertas
  for (let i = 0; i < 3; i++) {
    const alerta = alertas[Math.floor(Math.random() * alertas.length)];
    if (alerta) {
      notificaciones.push({
        id: notifId++,
        usuario_id: usuario.id,
        tipo: 'ALERTA',
        titulo: '⚠️ Alerta de Stock',
        mensaje: alerta.mensaje,
        leida: Math.random() > 0.5,
        fecha: subDays(new Date(), Math.floor(Math.random() * 7)),
        fecha_lectura: Math.random() > 0.5 ? subDays(new Date(), Math.floor(Math.random() * 5)) : null,
      });
    }
  }
});

// Auditoría
export const auditoria: Auditoria[] = [];
let auditId = 1;
for (let i = 0; i < 100; i++) {
  auditoria.push({
    id: auditId++,
    usuario_id: Math.floor(Math.random() * 5) + 1,
    accion: ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'INICIO_SESION'][Math.floor(Math.random() * 4)],
    tabla: ['productos', 'movimientos', 'ventas', 'usuarios'][Math.floor(Math.random() * 4)],
    registro_id: Math.floor(Math.random() * 100),
    datos_anteriores: {},
    datos_nuevos: {},
    ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
    fecha: subDays(new Date(), Math.floor(Math.random() * 30)),
  });
}

// Helper functions para consultas
export const getProductoById = (id: number) => productos.find(p => p.id === id);
export const getAlmacenById = (id: number) => almacenes.find(a => a.id === id);
export const getUsuarioById = (id: number) => usuarios.find(u => u.id === id);
export const getCategoriaById = (id: number) => categorias.find(c => c.id === id);
export const getProveedorById = (id: number) => proveedores.find(p => p.id === id);
export const getInventarioByProductoAlmacen = (productoId: number, almacenId: number) => 
  inventario.find(i => i.producto_id === productoId && i.almacen_id === almacenId);

export const getStockTotalProducto = (productoId: number) => {
  return inventario
    .filter(i => i.producto_id === productoId)
    .reduce((sum, i) => sum + i.stock_actual, 0);
};

export const getStockPorAlmacen = (productoId: number) => {
  return inventario
    .filter(i => i.producto_id === productoId)
    .map(i => ({
      almacen_id: i.almacen_id,
      cantidad: i.stock_actual
    }));
};

export const getValorTotalInventario = () => {
  return inventario.reduce((sum, inv) => {
    const producto = getProductoById(inv.producto_id);
    return sum + (producto ? inv.stock_actual * producto.precio_venta : 0);
  }, 0);
};