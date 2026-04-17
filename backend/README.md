# Backend - Sistema de Control de Inventario Technology Cuchito

Backend API REST desarrollado con Node.js, Express, TypeScript y PostgreSQL.

## 🚀 Tecnologías

- **Node.js** - Entorno de ejecución JavaScript
- **Express** - Framework web
- **TypeScript** - Superset tipado de JavaScript
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de la aplicación
│   │   ├── config.ts
│   │   └── database.ts
│   ├── controllers/     # Controladores de las rutas
│   │   ├── authController.ts
│   │   ├── productoController.ts
│   │   ├── inventarioController.ts
│   │   └── movimientoController.ts
│   ├── database/        # Migraciones y seeders
│   │   ├── migrations/
│   │   └── seeders/
│   ├── middleware/      # Middlewares personalizados
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/          # Modelos de Sequelize
│   │   ├── Usuario.ts
│   │   ├── Producto.ts
│   │   ├── Almacen.ts
│   │   ├── Categoria.ts
│   │   ├── Proveedor.ts
│   │   ├── Inventario.ts
│   │   ├── Movimiento.ts
│   │   ├── Auditoria.ts
│   │   └── index.ts
│   ├── routes/          # Definición de rutas
│   │   ├── authRoutes.ts
│   │   ├── productoRoutes.ts
│   │   ├── inventarioRoutes.ts
│   │   └── movimientoRoutes.ts
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Funciones utilitarias
│   └── server.ts        # Archivo principal del servidor
├── .env.example         # Variables de entorno ejemplo
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- pnpm (gestor de paquetes)

### 1. Instalar dependencias

```bash
cd backend
pnpm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=technology_cuchito_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_jwt_secret_super_secreto
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Crear la base de datos

```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea la base de datos
CREATE DATABASE technology_cuchito_db;

# Sal de PostgreSQL
\q
```

### 4. Ejecutar migraciones y seeders

```bash
# Crear las tablas
pnpm run migrate

# Poblar la base de datos con datos de prueba
pnpm run seed

# O ejecutar ambos comandos
pnpm run setup
```

`pnpm run migrate` ahora es seguro por defecto (no borra datos).  
Solo fuerza recreación total si defines `DB_SYNC_FORCE=true`.

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con hot reload)
pnpm run dev

# Modo producción
pnpm run build
pnpm start
```

El servidor estará disponible en `http://localhost:5000`

## ☁️ Despliegue en Render (Backend)

Este backend ya está preparado para Render con:

- `DATABASE_URL` (Render Postgres)
- `REDIS_URL` (Render Key Value)
- `PORT` automático de Render

Variables mínimas recomendadas en producción:

```env
NODE_ENV=production
JWT_SECRET=<secret seguro>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CORS_ORIGIN=https://tu-frontend.onrender.com
```

Nota: para despliegue integral del sistema (frontend + backend + postgres + redis), usa el `render.yaml` del directorio raíz.

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

### Productos

- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/:id` - Obtener un producto por ID
- `POST /api/productos` - Crear nuevo producto (Admin/Encargado)
- `PUT /api/productos/:id` - Actualizar producto (Admin/Encargado)
- `DELETE /api/productos/:id` - Eliminar producto (Admin)

### Inventario

- `GET /api/inventario` - Listar inventario
- `GET /api/inventario/producto/:productoId` - Inventario por producto
- `PUT /api/inventario/:id` - Actualizar inventario (Admin/Encargado)

### Movimientos

- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Registrar nuevo movimiento

### Health Check

- `GET /api/health` - Verificar estado del servidor

## 🔐 Autenticación

El API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a las rutas protegidas, debes incluir el token en el header de autorización:

```
Authorization: Bearer {tu_token_jwt}
```

### Roles de usuario

- **administrador** - Acceso completo al sistema
- **encargado_almacen** - Gestión de inventario y movimientos
- **usuario_operativo** - Registrar movimientos y consultar inventario

## 📝 Datos de Prueba

Después de ejecutar el seeder, puedes usar estas credenciales para probar:

```
Email: admin@technologycuchito.com
Password: password123
Rol: administrador
```

## 🗄️ Esquema de Base de Datos

El sistema incluye las siguientes tablas:

- **usuarios** - Usuarios del sistema
- **almacenes** - Almacenes de la empresa
- **categorias** - Categorías de productos
- **proveedores** - Proveedores
- **productos** - Productos del inventario
- **inventario** - Stock por producto y almacén
- **movimientos** - Registro de movimientos (entradas, salidas, transferencias)
- **auditoria** - Registro de acciones del sistema

## 🛠️ Scripts Disponibles

```bash
pnpm run dev         # Iniciar en modo desarrollo
pnpm run build       # Compilar TypeScript a JavaScript
pnpm start           # Iniciar servidor en producción
pnpm run migrate     # Ejecutar migraciones
pnpm run seed        # Poblar base de datos
pnpm run seed:bulk-demo  # Seed incremental: 100+ productos + movimientos + transferencias
pnpm run setup       # Migrar y poblar
pnpm test            # Ejecutar tests
```

## 📦 Seed de Volumen (100+ productos)

Si necesitas cargar datos amplios de prueba sin borrar información existente:

```bash
pnpm run seed:bulk-demo
```

Este script:

- asegura al menos `120` productos activos,
- crea inventario faltante por almacén,
- inserta movimientos y transferencias reales para pruebas funcionales.

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

Verifica que PostgreSQL esté corriendo:
```bash
# Linux/Mac
sudo service postgresql status

# Windows
pg_ctl status
```

### Error de permisos

Asegúrate de que el usuario de PostgreSQL tenga permisos para crear bases de datos y tablas.

## 📄 Licencia

ISC - Technology Cuchito © 2026
