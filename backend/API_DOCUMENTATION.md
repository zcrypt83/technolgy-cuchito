# 📡 Documentación de API REST

## Base URL

```
http://localhost:5000/api
```

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Incluir el token en el header:

```
Authorization: Bearer {token}
```

---

## 🔐 Autenticación

### POST /auth/login

Iniciar sesión en el sistema.

**Body:**
```json
{
  "email": "admin@technologycuchito.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Admin Principal",
    "email": "admin@technologycuchito.com",
    "rol": "administrador"
  }
}
```

### POST /auth/register

Registrar un nuevo usuario (solo Admin).

**Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "email": "usuario@example.com",
  "password": "password123",
  "rol": "usuario_operativo",
  "telefono": "+51 999 888 777"
}
```

### GET /auth/profile

Obtener perfil del usuario autenticado.

**Response:**
```json
{
  "id": 1,
  "nombre": "Admin Principal",
  "email": "admin@technologycuchito.com",
  "rol": "administrador",
  "telefono": "+51 999 888 777",
  "estado": true
}
```

---

## 📦 Productos

### GET /productos

Listar todos los productos.

**Query Parameters:**
- `search` (string): Buscar por nombre o código
- `categoriaId` (number): Filtrar por categoría
- `proveedorId` (number): Filtrar por proveedor
- `page` (number): Página actual (default: 1)
- `limit` (number): Registros por página (default: 50)

**Response:**
```json
{
  "productos": [
    {
      "id": 1,
      "codigo": "LAP-001",
      "nombre": "Laptop HP Pavilion 15",
      "categoriaId": 1,
      "proveedorId": 1,
      "precioCompra": 2200,
      "precioVenta": 2800,
      "unidadMedida": "unidad",
      "stockMinimo": 5,
      "stockMaximo": 50,
      "estado": true,
      "categoria": { "id": 1, "nombre": "Laptops" },
      "proveedor": { "id": 1, "nombre": "TechWorld Perú SAC" },
      "inventarios": [...]
    }
  ],
  "total": 33,
  "page": 1,
  "totalPages": 1
}
```

### GET /productos/:id

Obtener un producto por ID.

### POST /productos

Crear nuevo producto (Admin/Encargado).

**Body:**
```json
{
  "codigo": "NEW-001",
  "nombre": "Nuevo Producto",
  "categoriaId": 1,
  "proveedorId": 1,
  "precioCompra": 100,
  "precioVenta": 150,
  "unidadMedida": "unidad",
  "stockMinimo": 10,
  "stockMaximo": 100
}
```

### PUT /productos/:id

Actualizar producto (Admin/Encargado).

### DELETE /productos/:id

Eliminar producto (Admin) - Soft delete.

---

## 📊 Inventario

### GET /inventario

Listar inventario completo.

**Query Parameters:**
- `almacenId` (number): Filtrar por almacén
- `search` (string): Buscar por producto
- `stockBajo` (boolean): Solo productos con stock bajo
- `page` (number): Página actual
- `limit` (number): Registros por página

**Response:**
```json
{
  "inventario": [
    {
      "id": 1,
      "productoId": 1,
      "almacenId": 1,
      "cantidad": 45,
      "ultimaActualizacion": "2026-04-05T10:30:00Z",
      "producto": {
        "codigo": "LAP-001",
        "nombre": "Laptop HP Pavilion 15",
        "stockMinimo": 5
      },
      "almacen": {
        "codigo": "ALM-001",
        "nombre": "Almacén Principal Lima"
      }
    }
  ],
  "total": 99,
  "page": 1,
  "totalPages": 2
}
```

### GET /inventario/producto/:productoId

Obtener inventario de un producto específico en todos los almacenes.

### PUT /inventario/:id

Actualizar cantidad de inventario (Admin/Encargado).

**Body:**
```json
{
  "cantidad": 50
}
```

---

## 🔄 Movimientos

### GET /movimientos

Listar movimientos.

**Query Parameters:**
- `tipo` (string): entrada|salida|transferencia|ajuste
- `almacenId` (number): Filtrar por almacén
- `fechaInicio` (date): Fecha desde
- `fechaFin` (date): Fecha hasta
- `page` (number): Página
- `limit` (number): Registros por página

**Response:**
```json
{
  "movimientos": [
    {
      "id": 1,
      "tipo": "entrada",
      "productoId": 1,
      "almacenOrigenId": null,
      "almacenDestinoId": 1,
      "cantidad": 20,
      "motivo": "Compra a proveedor",
      "numeroDocumento": "DOC-000001",
      "fecha": "2026-04-05T10:00:00Z",
      "usuarioId": 1,
      "producto": {...},
      "almacenDestino": {...},
      "usuario": {...}
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```

### POST /movimientos

Crear nuevo movimiento (actualiza inventario automáticamente).

**Body para Entrada:**
```json
{
  "tipo": "entrada",
  "productoId": 1,
  "almacenDestinoId": 1,
  "cantidad": 20,
  "motivo": "Compra a proveedor",
  "numeroDocumento": "DOC-123456"
}
```

**Body para Salida:**
```json
{
  "tipo": "salida",
  "productoId": 1,
  "almacenOrigenId": 1,
  "cantidad": 5,
  "motivo": "Venta",
  "numeroDocumento": "VEN-123456"
}
```

**Body para Transferencia:**
```json
{
  "tipo": "transferencia",
  "productoId": 1,
  "almacenOrigenId": 1,
  "almacenDestinoId": 2,
  "cantidad": 10,
  "motivo": "Reubicación de stock",
  "numeroDocumento": "TRF-123456"
}
```

---

## 🏭 Almacenes

### GET /almacenes

Listar almacenes.

**Query Parameters:**
- `search` (string): Buscar por nombre, código o ciudad
- `estado` (boolean): Filtrar por estado

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Almacén Principal Lima",
    "codigo": "ALM-001",
    "direccion": "Av. Industrial 1500, Lima",
    "ciudad": "Lima",
    "capacidad": 10000,
    "encargadoId": 2,
    "estado": true,
    "encargado": {
      "id": 2,
      "nombre": "Carlos Mendoza",
      "email": "carlos.mendoza@technologycuchito.com"
    }
  }
]
```

### GET /almacenes/:id

Obtener almacén por ID con inventarios.

### POST /almacenes

Crear almacén (Admin).

**Body:**
```json
{
  "nombre": "Nuevo Almacén",
  "codigo": "ALM-004",
  "direccion": "Dirección completa",
  "ciudad": "Ciudad",
  "capacidad": 5000,
  "encargadoId": 2
}
```

### PUT /almacenes/:id

Actualizar almacén (Admin).

### DELETE /almacenes/:id

Eliminar almacén (Admin) - Soft delete.

---

## 👥 Usuarios

### GET /usuarios

Listar usuarios (Admin).

**Query Parameters:**
- `search` (string): Buscar por nombre o email
- `rol` (string): Filtrar por rol
- `estado` (boolean): Filtrar por estado

### GET /usuarios/:id

Obtener usuario por ID.

### POST /usuarios

Crear usuario (Admin).

**Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "email": "usuario@example.com",
  "password": "password123",
  "rol": "usuario_operativo",
  "telefono": "+51 999 888 777"
}
```

### PUT /usuarios/:id

Actualizar usuario (Admin).

### DELETE /usuarios/:id

Eliminar usuario (Admin) - Soft delete.

### POST /usuarios/:id/change-password

Cambiar contraseña de usuario.

**Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}
```

---

## 🏷️ Categorías

### GET /categorias

Listar categorías con contador de productos.

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Laptops",
    "descripcion": "Computadoras portátiles",
    "estado": true,
    "totalProductos": 5
  }
]
```

### GET /categorias/:id

Obtener categoría con productos.

### POST /categorias

Crear categoría (Admin/Encargado).

**Body:**
```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción de la categoría"
}
```

### PUT /categorias/:id

Actualizar categoría (Admin/Encargado).

### DELETE /categorias/:id

Eliminar categoría (Admin) - Solo si no tiene productos.

---

## 🏢 Proveedores

### GET /proveedores

Listar proveedores con contador de productos.

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "TechWorld Perú SAC",
    "ruc": "20456789012",
    "direccion": "Av. La Marina 2000",
    "telefono": "+51 1 7894561",
    "email": "ventas@techworld.pe",
    "contacto": "Roberto Silva",
    "estado": true,
    "totalProductos": 10
  }
]
```

### GET /proveedores/:id

Obtener proveedor con productos.

### POST /proveedores

Crear proveedor (Admin/Encargado).

**Body:**
```json
{
  "nombre": "Nuevo Proveedor",
  "ruc": "20123456789",
  "direccion": "Dirección",
  "telefono": "+51 1 1234567",
  "email": "contacto@proveedor.com",
  "contacto": "Nombre del Contacto"
}
```

### PUT /proveedores/:id

Actualizar proveedor (Admin/Encargado).

### DELETE /proveedores/:id

Eliminar proveedor (Admin) - Solo si no tiene productos.

---

## 📝 Auditoría

### GET /auditoria

Listar registros de auditoría (Admin).

**Query Parameters:**
- `entidad` (string): Filtrar por entidad (producto, almacen, usuario, etc.)
- `accion` (string): Filtrar por acción (crear, actualizar, eliminar)
- `fechaInicio` (date): Desde
- `fechaFin` (date): Hasta
- `page` (number): Página
- `limit` (number): Registros por página

**Response:**
```json
{
  "auditorias": [
    {
      "id": 1,
      "usuarioId": 1,
      "accion": "crear",
      "entidad": "producto",
      "entidadId": 5,
      "detalles": "Creó el producto LAP-005",
      "ipAddress": "192.168.1.100",
      "fecha": "2026-04-05T10:30:00Z",
      "usuario": {
        "nombre": "Admin Principal",
        "email": "admin@technologycuchito.com",
        "rol": "administrador"
      }
    }
  ],
  "total": 500,
  "page": 1,
  "totalPages": 10
}
```

### GET /auditoria/usuario/:usuarioId

Auditoría por usuario específico (Admin).

### GET /auditoria/entidad/:entidad/:entidadId

Auditoría de una entidad específica (Admin).

---

## 🏥 Health Check

### GET /health

Verificar estado del servidor.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-05T10:30:00Z",
  "uptime": 3600.5
}
```

---

## 🔐 Roles y Permisos

| Endpoint | Administrador | Encargado Almacén | Usuario Operativo |
|----------|---------------|-------------------|-------------------|
| POST /productos | ✅ | ✅ | ❌ |
| DELETE /productos | ✅ | ❌ | ❌ |
| POST /movimientos | ✅ | ✅ | ✅ |
| POST /usuarios | ✅ | ❌ | ❌ |
| GET /auditoria | ✅ | ❌ | ❌ |
| DELETE /almacenes | ✅ | ❌ | ❌ |

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 📊 Ejemplo de Flujo Completo

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@technologycuchito.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Obtener productos
const productosResponse = await fetch('http://localhost:5000/api/productos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { productos } = await productosResponse.json();

// 3. Crear movimiento de entrada
const movimientoResponse = await fetch('http://localhost:5000/api/movimientos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tipo: 'entrada',
    productoId: 1,
    almacenDestinoId: 1,
    cantidad: 20,
    motivo: 'Compra a proveedor',
    numeroDocumento: 'DOC-123456'
  })
});
```

---

**Technology Cuchito** - Sistema de Control de Inventario
© 2026 Todos los derechos reservados
