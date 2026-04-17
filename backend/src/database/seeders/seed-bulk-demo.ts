import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import sequelize from '../../config/database';
import {
  Usuario,
  Categoria,
  Proveedor,
  Producto,
  Almacen,
  Inventario,
  Movimiento
} from '../../models/index';

type MovementKind = 'entrada' | 'salida' | 'transferencia' | 'ajuste';

const TARGET_PRODUCTS = 120;
const TARGET_NEW_MOVEMENTS = 300;
const TARGET_NEW_TRANSFERS = 80;

const randomInt = (min: number, max: number) => {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const randomItem = <T>(items: T[]): T => items[randomInt(0, items.length - 1)];

const randomDateInLastDays = (days: number): Date => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - days);
  const timestamp = randomInt(past.getTime(), now.getTime());
  return new Date(timestamp);
};

const buildProviderRuc = (index: number): string => String(20990000000 + index).slice(0, 11);

const ensureUsers = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const baseUsers = [
    {
      nombre: 'Admin Principal',
      email: 'admin@technologycuchito.com',
      rol: 'administrador' as const,
      telefono: '+51 999 888 777'
    },
    {
      nombre: 'Carlos Mendoza',
      email: 'carlos.mendoza@technologycuchito.com',
      rol: 'encargado_almacen' as const,
      telefono: '+51 988 777 666'
    },
    {
      nombre: 'María Torres',
      email: 'maria.torres@technologycuchito.com',
      rol: 'encargado_almacen' as const,
      telefono: '+51 977 666 555'
    },
    {
      nombre: 'Juan Pérez',
      email: 'juan.perez@technologycuchito.com',
      rol: 'usuario_operativo' as const,
      telefono: '+51 966 555 444'
    }
  ];

  for (const user of baseUsers) {
    const found = await Usuario.findOne({
      where: { email: { [Op.iLike]: user.email } }
    });

    if (!found) {
      await Usuario.create({
        ...user,
        password: passwordHash,
        estado: true
      });
    }
  }

  const users = await Usuario.findAll({
    where: { estado: true },
    order: [['id', 'ASC']]
  });

  if (!users.length) {
    throw new Error('No hay usuarios activos disponibles para registrar movimientos.');
  }

  return users;
};

const ensureCategorias = async () => {
  const baseCategorias = [
    'Laptops',
    'Componentes PC',
    'Periféricos',
    'Almacenamiento',
    'Monitores',
    'Redes',
    'Audio',
    'Accesorios'
  ];

  for (const nombre of baseCategorias) {
    const found = await Categoria.findOne({ where: { nombre } });
    if (!found) {
      await Categoria.create({
        nombre,
        descripcion: `Categoría ${nombre}`,
        estado: true
      });
    }
  }

  return Categoria.findAll({
    where: { estado: true },
    order: [['id', 'ASC']]
  });
};

const ensureProveedores = async () => {
  const baseProviders = Array.from({ length: 6 }).map((_, idx) => {
    const number = idx + 1;
    return {
      nombre: `Proveedor Demo ${number}`,
      ruc: buildProviderRuc(number),
      direccion: `Av. Demo ${100 + number}, Lima`,
      telefono: `+51 1 6000${String(number).padStart(3, '0')}`,
      email: `proveedor${number}@demo.pe`,
      contacto: `Contacto ${number}`,
      estado: true
    };
  });

  for (const provider of baseProviders) {
    const found = await Proveedor.findOne({ where: { ruc: provider.ruc } });
    if (!found) {
      await Proveedor.create(provider);
    }
  }

  return Proveedor.findAll({
    where: { estado: true },
    order: [['id', 'ASC']]
  });
};

const ensureAlmacenes = async (users: Usuario[]) => {
  const encargados = users.filter((user) => user.rol === 'encargado_almacen');
  const baseWarehouses = [
    {
      nombre: 'Almacén Principal Lima',
      codigo: 'ALM-001',
      direccion: 'Av. Industrial 1500, Lima',
      ciudad: 'Lima',
      capacidad: 10000,
      encargadoId: encargados[0]?.id
    },
    {
      nombre: 'Almacén Norte Trujillo',
      codigo: 'ALM-002',
      direccion: 'Panamericana Norte Km 560, Trujillo',
      ciudad: 'Trujillo',
      capacidad: 5000,
      encargadoId: encargados[1]?.id || encargados[0]?.id
    },
    {
      nombre: 'Almacén Sur Arequipa',
      codigo: 'ALM-003',
      direccion: 'Parque Industrial s/n, Arequipa',
      ciudad: 'Arequipa',
      capacidad: 5000,
      encargadoId: encargados[0]?.id
    }
  ];

  for (const warehouse of baseWarehouses) {
    const found = await Almacen.findOne({ where: { codigo: warehouse.codigo } });
    if (!found) {
      await Almacen.create({
        ...warehouse,
        estado: true
      });
    }
  }

  const warehouses = await Almacen.findAll({
    where: { estado: true },
    order: [['id', 'ASC']]
  });

  if (!warehouses.length) {
    throw new Error('No hay almacenes activos disponibles.');
  }

  return warehouses;
};

const buildProductName = (index: number) => {
  const families = [
    'Laptop Empresarial',
    'Monitor IPS',
    'SSD NVMe',
    'Router WiFi',
    'Teclado Mecánico',
    'Mouse Inalámbrico',
    'Procesador',
    'Tarjeta Madre',
    'Memoria RAM',
    'Auricular Gamer'
  ];
  const family = families[index % families.length];
  return `${family} Serie ${String(index + 1).padStart(3, '0')}`;
};

const ensureProducts = async (categorias: Categoria[], proveedores: Proveedor[]) => {
  if (!categorias.length || !proveedores.length) {
    throw new Error('Se requieren categorías y proveedores para crear productos.');
  }

  const currentCount = await Producto.count({ where: { estado: true } });
  const productsToCreate = Math.max(0, TARGET_PRODUCTS - currentCount);

  const newProducts = [];
  for (let i = 0; i < productsToCreate; i++) {
    const sequence = currentCount + i + 1;
    const categoria = randomItem(categorias);
    const proveedor = randomItem(proveedores);
    const precioCompra = randomInt(30, 3000);
    const precioVenta = Number((precioCompra * randomInt(120, 165) / 100).toFixed(2));

    newProducts.push({
      codigo: `AUTO-${String(sequence).padStart(4, '0')}`,
      nombre: buildProductName(sequence),
      descripcion: `Producto de catálogo automático #${sequence}`,
      categoriaId: categoria.id!,
      proveedorId: proveedor.id!,
      precioCompra,
      precioVenta,
      unidadMedida: 'unidad',
      stockMinimo: randomInt(5, 30),
      stockMaximo: randomInt(120, 800),
      estado: true
    });
  }

  if (newProducts.length) {
    await Producto.bulkCreate(newProducts);
  }

  const products = await Producto.findAll({
    where: { estado: true },
    order: [['id', 'ASC']]
  });

  return { products, createdCount: newProducts.length };
};

const ensureInventario = async (products: Producto[], warehouses: Almacen[]) => {
  const createdRecords: any[] = [];

  for (const product of products) {
    for (const warehouse of warehouses) {
      const found = await Inventario.findOne({
        where: {
          productoId: product.id,
          almacenId: warehouse.id
        }
      });

      if (!found) {
        createdRecords.push({
          productoId: product.id,
          almacenId: warehouse.id,
          cantidad: randomInt(40, 180),
          ultimaActualizacion: new Date()
        });
      }
    }
  }

  if (createdRecords.length) {
    await Inventario.bulkCreate(createdRecords);
  }

  const inventory = await Inventario.findAll({
    where: {
      productoId: { [Op.in]: products.map((p) => p.id) },
      almacenId: { [Op.in]: warehouses.map((w) => w.id) }
    }
  });

  return { inventory, createdCount: createdRecords.length };
};

const seedMovements = async (
  users: Usuario[],
  warehouses: Almacen[],
  inventory: Inventario[]
) => {
  const inventoryByProduct = new Map<number, Inventario[]>();
  const inventoryByPair = new Map<string, Inventario>();

  for (const inv of inventory) {
    const list = inventoryByProduct.get(inv.productoId) || [];
    list.push(inv);
    inventoryByProduct.set(inv.productoId, list);
    inventoryByPair.set(`${inv.productoId}:${inv.almacenId}`, inv);
  }

  const productIds = [...inventoryByProduct.keys()];
  if (!productIds.length) {
    throw new Error('No hay inventario disponible para crear movimientos.');
  }

  let createdMovements = 0;
  let createdTransfers = 0;
  let docCounter = 1;
  const maxAttempts = TARGET_NEW_MOVEMENTS * 8;

  const createDocument = () => `AUTO-MOV-${String(Date.now()).slice(-6)}-${String(docCounter++).padStart(4, '0')}`;

  const applyUpdate = async (
    inv: Inventario,
    newQty: number
  ) => {
    inv.cantidad = Math.max(0, newQty);
    inv.ultimaActualizacion = new Date();
    await inv.save();
  };

  for (let attempts = 0; attempts < maxAttempts && createdMovements < TARGET_NEW_MOVEMENTS; attempts++) {
    const forceTransfer = createdTransfers < TARGET_NEW_TRANSFERS &&
      TARGET_NEW_MOVEMENTS - createdMovements <= TARGET_NEW_TRANSFERS - createdTransfers;
    const kind = forceTransfer
      ? 'transferencia'
      : (randomItem<MovementKind>(['entrada', 'salida', 'ajuste', 'transferencia']));

    const productId = randomItem(productIds);
    const productInventory = inventoryByProduct.get(productId) || [];
    const user = randomItem(users);

    if (!productInventory.length) {
      continue;
    }

    if (kind === 'entrada') {
      const target = randomItem(productInventory);
      const qty = randomInt(5, 35);
      await applyUpdate(target, target.cantidad + qty);

      await Movimiento.create({
        tipo: 'entrada',
        productoId: productId,
        almacenDestinoId: target.almacenId,
        cantidad: qty,
        motivo: 'Reposición automática de stock',
        usuarioId: user.id,
        numeroDocumento: createDocument(),
        fecha: randomDateInLastDays(120)
      });
      createdMovements++;
      continue;
    }

    if (kind === 'salida') {
      const candidates = productInventory.filter((inv) => inv.cantidad > 5);
      if (!candidates.length) {
        continue;
      }

      const origin = randomItem(candidates);
      const qty = randomInt(1, Math.min(20, origin.cantidad));
      await applyUpdate(origin, origin.cantidad - qty);

      await Movimiento.create({
        tipo: 'salida',
        productoId: productId,
        almacenOrigenId: origin.almacenId,
        cantidad: qty,
        motivo: 'Salida por venta automática',
        usuarioId: user.id,
        numeroDocumento: createDocument(),
        fecha: randomDateInLastDays(120)
      });
      createdMovements++;
      continue;
    }

    if (kind === 'ajuste') {
      const target = randomItem(productInventory);
      const adjustment = randomInt(-15, 15) || 5;
      const nextQty = Math.max(0, target.cantidad + adjustment);
      const delta = Math.abs(nextQty - target.cantidad);

      if (delta === 0) {
        continue;
      }

      await applyUpdate(target, nextQty);

      await Movimiento.create({
        tipo: 'ajuste',
        productoId: productId,
        almacenDestinoId: target.almacenId,
        cantidad: delta,
        motivo: adjustment >= 0 ? 'Ajuste positivo automático' : 'Ajuste negativo automático',
        usuarioId: user.id,
        numeroDocumento: createDocument(),
        fecha: randomDateInLastDays(120)
      });
      createdMovements++;
      continue;
    }

    const originCandidates = productInventory.filter((inv) => inv.cantidad > 5);
    if (originCandidates.length < 1 || warehouses.length < 2) {
      continue;
    }

    const origin = randomItem(originCandidates);
    const destinationWarehouseOptions = warehouses.filter((warehouse) => warehouse.id !== origin.almacenId);
    if (!destinationWarehouseOptions.length) {
      continue;
    }

    const destinationWarehouse = randomItem(destinationWarehouseOptions);
    const destination = inventoryByPair.get(`${productId}:${destinationWarehouse.id}`);
    if (!destination) {
      continue;
    }

    const qty = randomInt(1, Math.min(25, origin.cantidad));
    if (qty <= 0) {
      continue;
    }

    await applyUpdate(origin, origin.cantidad - qty);
    await applyUpdate(destination, destination.cantidad + qty);

    await Movimiento.create({
      tipo: 'transferencia',
      productoId: productId,
      almacenOrigenId: origin.almacenId,
      almacenDestinoId: destination.almacenId,
      cantidad: qty,
      motivo: 'Transferencia automática de balance',
      usuarioId: user.id,
      numeroDocumento: createDocument(),
      fecha: randomDateInLastDays(120)
    });

    createdMovements++;
    createdTransfers++;
  }

  return { createdMovements, createdTransfers };
};

const seedBulkDemo = async () => {
  try {
    console.log('🌱 Iniciando seed incremental de demo (100+ productos)...');

    const users = await ensureUsers();
    const categorias = await ensureCategorias();
    const proveedores = await ensureProveedores();
    const almacenes = await ensureAlmacenes(users);

    const { products, createdCount: createdProducts } = await ensureProducts(categorias, proveedores);
    const { inventory, createdCount: createdInventory } = await ensureInventario(products, almacenes);
    const { createdMovements, createdTransfers } = await seedMovements(users, almacenes, inventory);

    const totalProducts = await Producto.count({ where: { estado: true } });
    const totalMovements = await Movimiento.count();
    const totalTransfers = await Movimiento.count({ where: { tipo: 'transferencia' } });

    console.log('✅ Seed incremental completado.');
    console.log(`
📊 Resumen:
- Productos creados en esta ejecución: ${createdProducts}
- Productos activos totales: ${totalProducts}
- Inventarios creados en esta ejecución: ${createdInventory}
- Movimientos creados en esta ejecución: ${createdMovements}
- Transferencias creadas en esta ejecución: ${createdTransfers}
- Movimientos totales en BD: ${totalMovements}
- Transferencias totales en BD: ${totalTransfers}
    `);
  } catch (error) {
    console.error('❌ Error en seed incremental:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedBulkDemo();

