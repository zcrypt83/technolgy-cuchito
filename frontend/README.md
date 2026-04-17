# Frontend - Sistema de Control de Inventario Technology Cuchito

Aplicación web moderna desarrollada con React, TypeScript, Tailwind CSS y componentes de shadcn/ui.

## 🚀 Tecnologías

- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS v4** - Framework CSS utilitario
- **shadcn/ui** - Componentes UI reutilizables
- **React Router** - Enrutamiento de la aplicación
- **Recharts** - Gráficos y visualización de datos
- **Lucide React** - Iconos modernos
- **Vite** - Build tool ultra-rápido

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes React
│   │   │   ├── almacenes/     # Componentes de almacenes
│   │   │   ├── auditoria/     # Componentes de auditoría
│   │   │   ├── auth/          # Componentes de autenticación
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── inventario/    # Gestión de inventario
│   │   │   ├── layout/        # Layout principal
│   │   │   ├── movimientos/   # Registro de movimientos
│   │   │   ├── productos/     # Gestión de productos
│   │   │   ├── reportes/      # Reportes y análisis
│   │   │   ├── ui/            # Componentes UI reutilizables
│   │   │   └── usuarios/      # Gestión de usuarios
│   │   ├── contexts/          # Contextos de React
│   │   ├── data/              # Datos mock y constantes
│   │   ├── types/             # Definiciones de TypeScript
│   │   ├── App.tsx            # Componente principal
│   │   └── routes.tsx         # Configuración de rutas
│   ├── styles/                # Estilos globales
│   │   ├── index.css
│   │   ├── theme.css
│   │   └── fonts.css
│   └── imports/               # Recursos importados
├── vite.config.ts             # Configuración de Vite
├── postcss.config.mjs         # Configuración de PostCSS
├── package.json
└── tsconfig.json
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- pnpm (gestor de paquetes)

### 1. Instalar dependencias

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno (opcional)

Crea un archivo `.env` para configurar la URL del API:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🎨 Características Principales

### Dashboard Empresarial

- 📊 **KPIs en tiempo real** - Valor total del inventario, productos activos, alertas de stock
- 📈 **Gráficos interactivos** - Visualización de movimientos, productos más vendidos, distribución por categoría
- 🔍 **Filtros avanzados** - Filtrado por fecha, almacén, tipo de movimiento
- 📱 **Diseño responsive** - Adaptable a móviles, tablets y escritorio

### Gestión de Inventario

- 📦 **Vista completa del stock** - Stock por almacén y producto
- ⚠️ **Alertas inteligentes** - Notificaciones de stock bajo/crítico
- 🔄 **Actualización en tiempo real** - Sincronización automática
- 📋 **Detalles del producto** - Modal con información completa

### Movimientos

- ➡️ **Entradas** - Registro de compras y devoluciones
- ⬅️ **Salidas** - Ventas y productos defectuosos
- 🔄 **Transferencias** - Entre almacenes
- ⚙️ **Ajustes** - Correcciones de inventario

### Gestión de Productos

- ➕ **CRUD completo** - Crear, leer, actualizar, eliminar
- 🏷️ **Categorización** - Organización por categorías
- 🏢 **Proveedores** - Asociación con proveedores
- 📸 **Imágenes** - Soporte para imágenes de productos

### Reportes

- 📊 **Reportes personalizados** - Configurables por fecha y parámetros
- 💹 **Análisis de rentabilidad** - Productos más/menos rentables
- 📉 **Tendencias** - Análisis de movimientos históricos
- 📄 **Exportación** - Exportar a PDF y Excel

### Sistema de Usuarios

- 👥 **Gestión de usuarios** - Crear y administrar usuarios
- 🔐 **Control de roles** - Administrador, encargado, operativo
- 🔒 **Autenticación segura** - Login con JWT
- 📝 **Auditoría** - Registro de todas las acciones
- ⚙️ **Configuración administrativa** - Gestión de permisos por rol y acciones auditables

### Almacenes

- 🏭 **Múltiples almacenes** - Gestión centralizada
- 📍 **Ubicaciones** - Direcciones y ciudades
- 👤 **Encargados** - Asignación de responsables
- 📊 **Capacidad** - Control de capacidad por almacén

## 🎯 Componentes UI Principales

El sistema utiliza componentes de **shadcn/ui** personalizados:

- **Button** - Botones con variantes
- **Card** - Tarjetas de contenido
- **Table** - Tablas con ordenamiento y paginación
- **Dialog/Modal** - Ventanas emergentes
- **Form** - Formularios con validación
- **Select** - Selectores desplegables
- **Input** - Campos de entrada
- **Badge** - Etiquetas de estado
- **Tabs** - Pestañas
- **Chart** - Gráficos interactivos
- **Sidebar** - Barra lateral de navegación
- **Avatar** - Avatares de usuario
- **Tooltip** - Información contextual

## 🎨 Tema y Estilos

El sistema utiliza **Tailwind CSS v4** con un tema personalizado definido en `src/styles/theme.css`:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}
```

## 📱 Responsive Design

La aplicación está optimizada para:

- 📱 **Móviles** (320px - 640px)
- 📱 **Tablets** (641px - 1024px)
- 💻 **Escritorio** (1025px+)

## 🔐 Autenticación

### Flujo de autenticación

1. Usuario ingresa credenciales en `/login`
2. El sistema valida contra el API backend
3. Se recibe un token JWT
4. El token se almacena en localStorage
5. Todas las peticiones incluyen el token en headers
6. Al cerrar sesión se elimina el token

### Rutas protegidas

Las rutas requieren autenticación:

- `/dashboard` - Dashboard principal
- `/productos` - Gestión de productos
- `/inventario` - Gestión de inventario
- `/movimientos` - Registro de movimientos
- `/almacenes` - Gestión de almacenes
- `/usuarios` - Gestión de usuarios (Admin)
- `/reportes` - Reportes y análisis

## 🛠️ Scripts Disponibles

```bash
pnpm run dev        # Iniciar servidor de desarrollo
pnpm run build      # Compilar para producción
pnpm run preview    # Vista previa de build de producción
```

## Despliegue en Render (Static Site)

Este frontend se despliega como **Static Site** en Render.

### Pasos

1. Sube el repositorio a GitHub.
2. En Render, crea un **Blueprint** (recomendado) o una **Static Site**.
3. Configura la variable:

```env
VITE_API_URL=https://TU_BACKEND_PUBLICO.onrender.com/api
```

4. Si usas Blueprint, Render tomará automáticamente la configuración de `render.yaml`.
5. Despliega.

Importante: el backend debe estar desplegado como Web Service en Render y su URL debe coincidir con `VITE_API_URL`.

## 🔗 Conectar con Backend

El frontend se comunica con el backend a través de la API REST.

### Configuración del API

Edita `src/app/services/api.ts` para configurar la URL base:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Ejemplo de petición

```typescript
// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

// Petición autenticada
const response = await fetch(`${API_URL}/productos`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## 📊 Datos de Prueba

El sistema puede cargar datos amplios de prueba para testing:

- 120+ productos activos
- 3 almacenes
- 300+ movimientos adicionales (incluye transferencias)
- 5 usuarios con diferentes roles
- 8 categorías
- 4 proveedores

## 🐛 Troubleshooting

### Error de compilación

```bash
# Limpiar cache
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Problema de CORS

Asegúrate de que el backend tenga configurado CORS correctamente para aceptar peticiones desde `http://localhost:5173`

## 📄 Licencia

ISC - Technology Cuchito © 2026
