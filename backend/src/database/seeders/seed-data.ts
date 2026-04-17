import bcrypt from 'bcryptjs';
import { Usuario, Categoria, Proveedor, Producto, Almacen, Inventario, Movimiento } from '../../models/index';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // 1. Crear usuarios
    console.log('👤 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usuarios = await Usuario.bulkCreate([
      {
        nombre: 'Admin Principal',
        email: 'admin@technologycuchito.com',
        password: hashedPassword,
        rol: 'administrador',
        telefono: '+51 999 888 777',
        estado: true
      },
      {
        nombre: 'Carlos Mendoza',
        email: 'carlos.mendoza@technologycuchito.com',
        password: hashedPassword,
        rol: 'encargado_almacen',
        telefono: '+51 988 777 666',
        estado: true
      },
      {
        nombre: 'María Torres',
        email: 'maria.torres@technologycuchito.com',
        password: hashedPassword,
        rol: 'encargado_almacen',
        telefono: '+51 977 666 555',
        estado: true
      },
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@technologycuchito.com',
        password: hashedPassword,
        rol: 'usuario_operativo',
        telefono: '+51 966 555 444',
        estado: true
      },
      {
        nombre: 'Ana García',
        email: 'ana.garcia@technologycuchito.com',
        password: hashedPassword,
        rol: 'usuario_operativo',
        telefono: '+51 955 444 333',
        estado: true
      }
    ]);

    // 2. Crear categorías
    console.log('📁 Creando categorías...');
    const categorias = await Categoria.bulkCreate([
      { nombre: 'Laptops', descripcion: 'Computadoras portátiles de diferentes marcas', estado: true },
      { nombre: 'Componentes PC', descripcion: 'Componentes para ensamblaje de computadoras', estado: true },
      { nombre: 'Periféricos', descripcion: 'Teclados, ratones, auriculares y más', estado: true },
      { nombre: 'Almacenamiento', descripcion: 'Discos duros, SSDs y memorias USB', estado: true },
      { nombre: 'Monitores', descripcion: 'Pantallas y monitores para computadora', estado: true },
      { nombre: 'Redes', descripcion: 'Routers, switches y accesorios de red', estado: true },
      { nombre: 'Audio', descripcion: 'Altavoces y equipos de audio', estado: true },
      { nombre: 'Accesorios', descripcion: 'Cables, adaptadores y otros accesorios', estado: true }
    ]);

    // 3. Crear proveedores
    console.log('🏢 Creando proveedores...');
    const proveedores = await Proveedor.bulkCreate([
      {
        nombre: 'TechWorld Perú SAC',
        ruc: '20456789012',
        direccion: 'Av. La Marina 2000, San Miguel',
        telefono: '+51 1 7894561',
        email: 'ventas@techworld.pe',
        contacto: 'Roberto Silva',
        estado: true
      },
      {
        nombre: 'Digital Solutions EIRL',
        ruc: '20567890123',
        direccion: 'Jr. Puno 450, Cercado de Lima',
        telefono: '+51 1 4567890',
        email: 'info@digitalsolutions.pe',
        contacto: 'Patricia Ramos',
        estado: true
      },
      {
        nombre: 'Importaciones Tech SAC',
        ruc: '20678901234',
        direccion: 'Av. Argentina 3500, Callao',
        telefono: '+51 1 6543210',
        email: 'contacto@importech.pe',
        contacto: 'Luis Martínez',
        estado: true
      },
      {
        nombre: 'Grupo Tecnológico del Sur',
        ruc: '20789012345',
        direccion: 'Av. Ejército 1200, Arequipa',
        telefono: '+51 54 234567',
        email: 'ventas@grupotech.pe',
        contacto: 'Carmen Flores',
        estado: true
      }
    ]);

    // 4. Crear almacenes
    console.log('🏭 Creando almacenes...');
    const almacenes = await Almacen.bulkCreate([
      {
        nombre: 'Almacén Principal Lima',
        codigo: 'ALM-001',
        direccion: 'Av. Industrial 1500, Lima',
        ciudad: 'Lima',
        capacidad: 10000,
        encargadoId: usuarios[1].id,
        estado: true
      },
      {
        nombre: 'Almacén Norte Trujillo',
        codigo: 'ALM-002',
        direccion: 'Panamericana Norte Km 560, Trujillo',
        ciudad: 'Trujillo',
        capacidad: 5000,
        encargadoId: usuarios[2].id,
        estado: true
      },
      {
        nombre: 'Almacén Sur Arequipa',
        codigo: 'ALM-003',
        direccion: 'Parque Industrial s/n, Arequipa',
        ciudad: 'Arequipa',
        capacidad: 5000,
        encargadoId: usuarios[1].id,
        estado: true
      }
    ]);

    // 4.b Asignar almacén operativo a encargados y operadores
    await usuarios[1].update({ almacenAsignadoId: almacenes[0].id }); // Carlos -> Lima
    await usuarios[2].update({ almacenAsignadoId: almacenes[1].id }); // María -> Trujillo
    await usuarios[3].update({ almacenAsignadoId: almacenes[0].id }); // Juan -> Lima
    await usuarios[4].update({ almacenAsignadoId: almacenes[1].id }); // Ana -> Trujillo

    // 5. Crear productos (50 productos variados)
    console.log('📦 Creando productos...');
    const productosData = [
      // Laptops
      { codigo: 'LAP-001', nombre: 'Laptop HP Pavilion 15', categoriaId: categorias[0].id, proveedorId: proveedores[0].id, precioCompra: 2200, precioVenta: 2800, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },
      { codigo: 'LAP-002', nombre: 'Laptop Dell Inspiron 14', categoriaId: categorias[0].id, proveedorId: proveedores[1].id, precioCompra: 2000, precioVenta: 2600, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },
      { codigo: 'LAP-003', nombre: 'Laptop Lenovo ThinkPad', categoriaId: categorias[0].id, proveedorId: proveedores[0].id, precioCompra: 3500, precioVenta: 4200, unidadMedida: 'unidad', stockMinimo: 3, stockMaximo: 30 },
      { codigo: 'LAP-004', nombre: 'Laptop ASUS VivoBook', categoriaId: categorias[0].id, proveedorId: proveedores[2].id, precioCompra: 1800, precioVenta: 2400, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 40 },
      { codigo: 'LAP-005', nombre: 'Laptop Acer Aspire 5', categoriaId: categorias[0].id, proveedorId: proveedores[1].id, precioCompra: 1600, precioVenta: 2100, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },

      // Componentes PC
      { codigo: 'CPU-001', nombre: 'Procesador Intel Core i7-13700K', categoriaId: categorias[1].id, proveedorId: proveedores[0].id, precioCompra: 1500, precioVenta: 1900, unidadMedida: 'unidad', stockMinimo: 10, stockMaximo: 100 },
      { codigo: 'CPU-002', nombre: 'Procesador AMD Ryzen 7 5800X', categoriaId: categorias[1].id, proveedorId: proveedores[2].id, precioCompra: 1200, precioVenta: 1600, unidadMedida: 'unidad', stockMinimo: 10, stockMaximo: 100 },
      { codigo: 'GPU-001', nombre: 'Tarjeta Gráfica NVIDIA RTX 4070', categoriaId: categorias[1].id, proveedorId: proveedores[0].id, precioCompra: 2500, precioVenta: 3200, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },
      { codigo: 'GPU-002', nombre: 'Tarjeta Gráfica AMD RX 7800 XT', categoriaId: categorias[1].id, proveedorId: proveedores[2].id, precioCompra: 2200, precioVenta: 2900, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },
      { codigo: 'RAM-001', nombre: 'Memoria RAM DDR5 32GB Corsair', categoriaId: categorias[1].id, proveedorId: proveedores[1].id, precioCompra: 450, precioVenta: 600, unidadMedida: 'unidad', stockMinimo: 20, stockMaximo: 200 },
      { codigo: 'RAM-002', nombre: 'Memoria RAM DDR4 16GB Kingston', categoriaId: categorias[1].id, proveedorId: proveedores[0].id, precioCompra: 180, precioVenta: 250, unidadMedida: 'unidad', stockMinimo: 30, stockMaximo: 300 },
      { codigo: 'MB-001', nombre: 'Tarjeta Madre ASUS ROG Strix', categoriaId: categorias[1].id, proveedorId: proveedores[0].id, precioCompra: 800, precioVenta: 1100, unidadMedida: 'unidad', stockMinimo: 10, stockMaximo: 80 },

      // Periféricos
      { codigo: 'TEC-001', nombre: 'Teclado Mecánico Logitech G915', categoriaId: categorias[2].id, proveedorId: proveedores[1].id, precioCompra: 450, precioVenta: 600, unidadMedida: 'unidad', stockMinimo: 15, stockMaximo: 150 },
      { codigo: 'TEC-002', nombre: 'Teclado Razer BlackWidow V3', categoriaId: categorias[2].id, proveedorId: proveedores[2].id, precioCompra: 380, precioVenta: 520, unidadMedida: 'unidad', stockMinimo: 15, stockMaximo: 150 },
      { codigo: 'MOU-001', nombre: 'Mouse Logitech G502 Hero', categoriaId: categorias[2].id, proveedorId: proveedores[1].id, precioCompra: 150, precioVenta: 210, unidadMedida: 'unidad', stockMinimo: 25, stockMaximo: 250 },
      { codigo: 'MOU-002', nombre: 'Mouse Razer DeathAdder V3', categoriaId: categorias[2].id, proveedorId: proveedores[2].id, precioCompra: 180, precioVenta: 250, unidadMedida: 'unidad', stockMinimo: 25, stockMaximo: 250 },
      { codigo: 'AUR-001', nombre: 'Auriculares HyperX Cloud II', categoriaId: categorias[2].id, proveedorId: proveedores[0].id, precioCompra: 220, precioVenta: 300, unidadMedida: 'unidad', stockMinimo: 20, stockMaximo: 200 },
      { codigo: 'WEB-001', nombre: 'Webcam Logitech C920', categoriaId: categorias[2].id, proveedorId: proveedores[1].id, precioCompra: 180, precioVenta: 250, unidadMedida: 'unidad', stockMinimo: 15, stockMaximo: 150 },

      // Almacenamiento
      { codigo: 'SSD-001', nombre: 'SSD Samsung 980 PRO 1TB', categoriaId: categorias[3].id, proveedorId: proveedores[0].id, precioCompra: 280, precioVenta: 380, unidadMedida: 'unidad', stockMinimo: 30, stockMaximo: 300 },
      { codigo: 'SSD-002', nombre: 'SSD Western Digital Black SN850 2TB', categoriaId: categorias[3].id, proveedorId: proveedores[2].id, precioCompra: 480, precioVenta: 650, unidadMedida: 'unidad', stockMinimo: 20, stockMaximo: 200 },
      { codigo: 'HDD-001', nombre: 'Disco Duro Seagate 4TB', categoriaId: categorias[3].id, proveedorId: proveedores[1].id, precioCompra: 280, precioVenta: 380, unidadMedida: 'unidad', stockMinimo: 25, stockMaximo: 250 },
      { codigo: 'USB-001', nombre: 'Memoria USB SanDisk 128GB', categoriaId: categorias[3].id, proveedorId: proveedores[0].id, precioCompra: 45, precioVenta: 70, unidadMedida: 'unidad', stockMinimo: 50, stockMaximo: 500 },

      // Monitores
      { codigo: 'MON-001', nombre: 'Monitor LG UltraGear 27" 144Hz', categoriaId: categorias[4].id, proveedorId: proveedores[0].id, precioCompra: 800, precioVenta: 1100, unidadMedida: 'unidad', stockMinimo: 10, stockMaximo: 100 },
      { codigo: 'MON-002', nombre: 'Monitor ASUS TUF 24" 165Hz', categoriaId: categorias[4].id, proveedorId: proveedores[1].id, precioCompra: 550, precioVenta: 750, unidadMedida: 'unidad', stockMinimo: 12, stockMaximo: 120 },
      { codigo: 'MON-003', nombre: 'Monitor Dell UltraSharp 32" 4K', categoriaId: categorias[4].id, proveedorId: proveedores[0].id, precioCompra: 1500, precioVenta: 1950, unidadMedida: 'unidad', stockMinimo: 5, stockMaximo: 50 },

      // Redes
      { codigo: 'ROU-001', nombre: 'Router TP-Link Archer AX6000', categoriaId: categorias[5].id, proveedorId: proveedores[1].id, precioCompra: 450, precioVenta: 600, unidadMedida: 'unidad', stockMinimo: 15, stockMaximo: 150 },
      { codigo: 'SWI-001', nombre: 'Switch Cisco 24 puertos Gigabit', categoriaId: categorias[5].id, proveedorId: proveedores[2].id, precioCompra: 850, precioVenta: 1150, unidadMedida: 'unidad', stockMinimo: 8, stockMaximo: 80 },
      { codigo: 'CAB-001', nombre: 'Cable de Red Cat6 305m', categoriaId: categorias[5].id, proveedorId: proveedores[0].id, precioCompra: 180, precioVenta: 260, unidadMedida: 'rollo', stockMinimo: 20, stockMaximo: 200 },

      // Audio
      { codigo: 'SPK-001', nombre: 'Altavoces Logitech Z623', categoriaId: categorias[6].id, proveedorId: proveedores[1].id, precioCompra: 280, precioVenta: 380, unidadMedida: 'unidad', stockMinimo: 15, stockMaximo: 150 },
      { codigo: 'MIC-001', nombre: 'Micrófono Blue Yeti', categoriaId: categorias[6].id, proveedorId: proveedores[0].id, precioCompra: 320, precioVenta: 430, unidadMedida: 'unidad', stockMinimo: 12, stockMaximo: 120 },

      // Accesorios
      { codigo: 'CAB-002', nombre: 'Cable HDMI 2.1 3m', categoriaId: categorias[7].id, proveedorId: proveedores[1].id, precioCompra: 25, precioVenta: 45, unidadMedida: 'unidad', stockMinimo: 100, stockMaximo: 1000 },
      { codigo: 'CAB-003', nombre: 'Cable USB-C 2m', categoriaId: categorias[7].id, proveedorId: proveedores[0].id, precioCompra: 15, precioVenta: 30, unidadMedida: 'unidad', stockMinimo: 100, stockMaximo: 1000 },
      { codigo: 'HUB-001', nombre: 'Hub USB 3.0 7 puertos', categoriaId: categorias[7].id, proveedorId: proveedores[2].id, precioCompra: 65, precioVenta: 95, unidadMedida: 'unidad', stockMinimo: 30, stockMaximo: 300 },
      { codigo: 'ADA-001', nombre: 'Adaptador USB-C a HDMI', categoriaId: categorias[7].id, proveedorId: proveedores[1].id, precioCompra: 35, precioVenta: 55, unidadMedida: 'unidad', stockMinimo: 40, stockMaximo: 400 }
    ];

    const productos = await Producto.bulkCreate(productosData.map(p => ({ ...p, estado: true })));

    // 6. Crear registros de inventario
    console.log('📊 Creando registros de inventario...');
    const inventarioData: any[] = [];

    productos.forEach((producto) => {
      almacenes.forEach((almacen) => {
        const cantidad = Math.floor(Math.random() * 100) + 20; // Entre 20 y 120
        inventarioData.push({
          productoId: producto.id,
          almacenId: almacen.id,
          cantidad,
          ultimaActualizacion: new Date()
        });
      });
    });

    await Inventario.bulkCreate(inventarioData);

    // 7. Crear movimientos (últimos 100 movimientos)
    console.log('📝 Creando movimientos...');
    const tiposMovimiento = ['entrada', 'salida', 'transferencia', 'ajuste'];
    const motivos = {
      entrada: ['Compra a proveedor', 'Devolución de cliente', 'Ajuste de inventario'],
      salida: ['Venta', 'Merma', 'Producto defectuoso'],
      transferencia: ['Reubicación de stock', 'Balance entre almacenes'],
      ajuste: ['Corrección de inventario', 'Ajuste por auditoría']
    };

    const movimientosData: any[] = [];

    for (let i = 0; i < 100; i++) {
      const tipo = tiposMovimiento[Math.floor(Math.random() * tiposMovimiento.length)] as 'entrada' | 'salida' | 'transferencia' | 'ajuste';
      const producto = productos[Math.floor(Math.random() * productos.length)];
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const cantidad = Math.floor(Math.random() * 50) + 1;
      const motivosArray = motivos[tipo];
      const motivo = motivosArray[Math.floor(Math.random() * motivosArray.length)];

      // Fecha aleatoria en los últimos 6 meses
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 180));

      const movimiento: any = {
        tipo,
        productoId: producto.id,
        cantidad,
        motivo,
        usuarioId: usuario.id,
        numeroDocumento: `DOC-${String(i + 1).padStart(6, '0')}`,
        fecha
      };

      if (tipo === 'entrada' || tipo === 'salida') {
        movimiento.almacenDestinoId = almacenes[Math.floor(Math.random() * almacenes.length)].id;
      } else if (tipo === 'transferencia') {
        const almacenOrigen = almacenes[Math.floor(Math.random() * almacenes.length)];
        let almacenDestino = almacenes[Math.floor(Math.random() * almacenes.length)];
        while (almacenDestino.id === almacenOrigen.id) {
          almacenDestino = almacenes[Math.floor(Math.random() * almacenes.length)];
        }
        movimiento.almacenOrigenId = almacenOrigen.id;
        movimiento.almacenDestinoId = almacenDestino.id;
      } else {
        movimiento.almacenDestinoId = almacenes[Math.floor(Math.random() * almacenes.length)].id;
      }

      movimientosData.push(movimiento);
    }

    await Movimiento.bulkCreate(movimientosData);

    console.log('✅ Seeding completado exitosamente');
    console.log(`
    📊 Resumen:
    - Usuarios: ${usuarios.length}
    - Categorías: ${categorias.length}
    - Proveedores: ${proveedores.length}
    - Productos: ${productos.length}
    - Almacenes: ${almacenes.length}
    - Registros de inventario: ${inventarioData.length}
    - Movimientos: ${movimientosData.length}
    `);

  } catch (error) {
    console.error('❌ Error en el seeding:', error);
    throw error;
  }
};

export default seedDatabase;

// Ejecutar si es llamado directamente (con mejor detección)
const fileUrl = new URL(import.meta.url).pathname;
const argUrl = new URL(`file://${process.argv[1]}`).pathname;
const isDirectCall = fileUrl === argUrl;

if (isDirectCall) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el seeding:', error);
      process.exit(1);
    });
}
