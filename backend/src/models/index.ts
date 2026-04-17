import Usuario from './Usuario';
import Almacen from './Almacen';
import Categoria from './Categoria';
import Proveedor from './Proveedor';
import Producto from './Producto';
import Inventario from './Inventario';
import Movimiento from './Movimiento';
import Auditoria from './Auditoria';

// Definir relaciones entre modelos

// Usuario - Almacen (Un usuario puede ser encargado de múltiples almacenes)
Usuario.hasMany(Almacen, { foreignKey: 'encargadoId', as: 'almacenes' });
Almacen.belongsTo(Usuario, { foreignKey: 'encargadoId', as: 'encargado' });

// Usuario - Almacen (almacén operativo asignado por usuario)
Usuario.belongsTo(Almacen, { foreignKey: 'almacenAsignadoId', as: 'almacenAsignado' });
Almacen.hasMany(Usuario, { foreignKey: 'almacenAsignadoId', as: 'usuariosAsignados' });

// Categoria - Producto (Una categoría tiene muchos productos)
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

// Proveedor - Producto (Un proveedor tiene muchos productos)
Proveedor.hasMany(Producto, { foreignKey: 'proveedorId', as: 'productos' });
Producto.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });

// Producto - Inventario (Un producto puede estar en múltiples almacenes)
Producto.hasMany(Inventario, { foreignKey: 'productoId', as: 'inventarios' });
Inventario.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Almacen - Inventario (Un almacén tiene múltiples productos)
Almacen.hasMany(Inventario, { foreignKey: 'almacenId', as: 'inventarios' });
Inventario.belongsTo(Almacen, { foreignKey: 'almacenId', as: 'almacen' });

// Producto - Movimiento
Producto.hasMany(Movimiento, { foreignKey: 'productoId', as: 'movimientos' });
Movimiento.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

// Almacen - Movimiento (origen)
Almacen.hasMany(Movimiento, { foreignKey: 'almacenOrigenId', as: 'movimientosOrigen' });
Movimiento.belongsTo(Almacen, { foreignKey: 'almacenOrigenId', as: 'almacenOrigen' });

// Almacen - Movimiento (destino)
Almacen.hasMany(Movimiento, { foreignKey: 'almacenDestinoId', as: 'movimientosDestino' });
Movimiento.belongsTo(Almacen, { foreignKey: 'almacenDestinoId', as: 'almacenDestino' });

// Usuario - Movimiento
Usuario.hasMany(Movimiento, { foreignKey: 'usuarioId', as: 'movimientos' });
Movimiento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Usuario - Auditoria
Usuario.hasMany(Auditoria, { foreignKey: 'usuarioId', as: 'auditorias' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

export {
  Usuario,
  Almacen,
  Categoria,
  Proveedor,
  Producto,
  Inventario,
  Movimiento,
  Auditoria
};
