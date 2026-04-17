# Sistema SaaS de Control de Inventario - Technology Cuchito

## 📋 Descripción del Proyecto

Sistema SaaS (Software as a Service) de Control de Inventario desarrollado para **Technology Cuchito**, una empresa peruana dedicada a la comercialización de productos tecnológicos. Este sistema automatiza y centraliza la gestión integral del inventario, permitiendo un control eficiente de productos, almacenes, movimientos y generación de reportes en tiempo real.

---

## 🎯 Objetivos del Sistema

### Objetivo Principal
Implementar una plataforma tecnológica SaaS que **automatice, optimice y centralice** la gestión integral del inventario de Technology Cuchito, mejorando la eficiencia operativa, reduciendo errores y facilitando la toma de decisiones estratégicas.

### Objetivos Específicos
- ✅ **Automatización de Procesos**: Eliminar procesos manuales y automatizar alertas
- ✅ **Centralización de Información**: Unificar datos en una única plataforma
- ✅ **Control en Tiempo Real**: Visibilidad inmediata de stock disponible
- ✅ **Trazabilidad Completa**: Registro detallado de todos los movimientos
- ✅ **Seguridad de la Información**: Protección de datos con control de acceso basado en roles
- ✅ **Escalabilidad Empresarial**: Capacidad de crecimiento sin limitaciones técnicas

---

## 🏗️ Arquitectura del Sistema

### Patrón de Arquitectura: N-Capas + MVC + API REST

#### **Frontend (Capa de Presentación)**
- **React 18.3.1** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Framework CSS
- **React Router 7** - Navegación
- **Recharts** - Gráficos y visualizaciones
- **Shadcn/UI** - Componentes UI empresariales
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast
- **Date-fns** - Manejo de fechas

#### **Backend (Capa de Lógica de Negocio)**
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework API REST
- **TypeScript** - Tipado estático
- **JWT** - Autenticación y autorización
- **Bcrypt** - Cifrado de contraseñas

#### **Base de Datos (Capa de Datos)**
- **PostgreSQL 14+** - Sistema de gestión de base de datos relacional

---

## 👥 Roles y Permisos

### 1. **Administrador**
- ✅ Acceso total al sistema
- ✅ Gestión de usuarios y permisos
- ✅ Configuración del sistema
- ✅ Todos los almacenes
- ✅ Todos los reportes

### 2. **Encargado de Almacén**
- ✅ Gestión de productos de su almacén asignado
- ✅ Registro de entradas y salidas
- ✅ Transferencias entre almacenes
- ✅ Reportes operativos de su almacén
- ❌ No puede crear usuarios ni configurar sistema

### 3. **Usuario Operativo**
- ✅ Consulta de productos y stock
- ✅ Registro de salidas por ventas
- ✅ Reportes básicos
- ❌ No puede modificar productos ni configuraciones

---

## 🧩 Módulos del Sistema

### 1. **Módulo de Autenticación y Seguridad**
- Inicio de sesión seguro con JWT
- Gestión de usuarios
- Control de acceso basado en roles (RBAC)
- Auditoría de accesos

### 2. **Módulo de Gestión de Productos**
- Registro y actualización de productos
- Búsqueda y filtrado avanzado
- Gestión de categorías
- Eliminación lógica

### 3. **Módulo de Gestión de Almacenes**
- Registro de almacenes
- Asignación de encargados
- Vista consolidada multi-almacén

### 4. **Módulo de Gestión de Inventario**
- Registro de entradas de inventario
- Registro de salidas de inventario
- Consulta de stock en tiempo real
- Transferencias entre almacenes
- Ajustes de inventario

### 5. **Módulo de Alertas y Notificaciones**
- Alertas de stock mínimo
- Alertas de productos agotados
- Notificaciones en tiempo real
- Centro de notificaciones

### 6. **Módulo de Reportes e Inteligencia de Negocio**
- Dashboard ejecutivo con KPIs
- Reporte de stock actual
- Reporte de movimientos
- Análisis de rotación de productos
- Exportación de reportes (PDF/Excel)

### 7. **Módulo de Historial y Auditoría**
- Historial de movimientos
- Log de auditoría de cambios
- Trazabilidad completa

---

## 📊 Dashboard Ejecutivo - KPIs Principales

- 📦 **Total de Productos** en inventario
- 💰 **Valor Total del Inventario**
- ⚠️ **Productos en Stock Crítico**
- 🚫 **Productos Agotados**
- 📥 **Entradas del Mes**
- 📤 **Salidas del Mes**
- 🔥 **Top 10 Productos Más Vendidos**
- 🏭 **Distribución de Stock por Almacén**

### Visualizaciones Incluidas
- Gráfico de líneas: Evolución de inventario
- Gráfico de barras: Ventas por categoría
- Gráfico de pastel: Distribución de stock
- Gráfico de área: Tendencias de movimientos

---

## 🗂️ Estructura de la Base de Datos

### Tablas Principales

1. **usuarios** - Gestión de usuarios del sistema
2. **productos** - Catálogo de productos
3. **categorias** - Clasificación de productos
4. **almacenes** - Puntos de almacenamiento
5. **inventario** - Stock por producto y almacén
6. **movimientos** - Historial de entradas y salidas
7. **transferencias** - Traslados entre almacenes
8. **transferencia_detalles** - Detalle de transferencias
9. **ventas** - Registro de ventas
10. **venta_detalles** - Productos vendidos
11. **proveedores** - Base de proveedores
12. **producto_proveedor** - Relación productos-proveedores
13. **alertas** - Sistema de alertas
14. **notificaciones** - Notificaciones a usuarios
15. **auditoria** - Log de auditoría del sistema
16. **configuracion** - Parámetros del sistema

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd technology-cuchito-inventory
```

2. **Instalar dependencias del frontend**
```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
cp .env.example .env

# Editar con tus configuraciones
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Technology Cuchito Inventory
```

4. **Configurar la base de datos**
```bash
# Crear base de datos
createdb technology_cuchito_db

# Ejecutar migraciones (scripts SQL en /database)
psql -d technology_cuchito_db -f database/schema.sql
psql -d technology_cuchito_db -f database/seed.sql
```

5. **Iniciar el servidor backend**
```bash
cd backend
npm install
npm run dev
```

6. **Iniciar el frontend**
```bash
npm run dev
```

7. **Acceder al sistema**
```
http://localhost:5173
```

---

## 👤 Usuarios de Prueba

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador

### Encargado de Almacén
- **Usuario**: `encargado`
- **Contraseña**: `encargado123`
- **Rol**: Encargado de Almacén (Almacén Principal)

### Usuario Operativo
- **Usuario**: `operador`
- **Contraseña**: `operador123`
- **Rol**: Usuario Operativo

---

## 📁 Estructura del Proyecto

```
technology-cuchito-inventory/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes React
│   │   │   ├── auth/           # Componentes de autenticación
│   │   │   ├── dashboard/      # Dashboard y KPIs
│   │   │   ├── productos/      # Gestión de productos
│   │   │   ├── almacenes/      # Gestión de almacenes
│   │   │   ├── inventario/     # Gestión de inventario
│   │   │   ├── reportes/       # Módulo de reportes
│   │   │   ├── layout/         # Layout principal
│   │   │   └── ui/             # Componentes UI reutilizables
│   │   ├── contexts/           # Contextos de React
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Servicios API
│   │   ├── types/              # Tipos TypeScript
│   │   ├── utils/              # Utilidades
│   │   ├── routes.tsx          # Configuración de rutas
│   │   └── App.tsx             # Componente principal
│   ├── styles/                 # Estilos globales
│   └── imports/                # Archivos importados
├── database/                   # Scripts de base de datos
│   ├── schema.sql             # Esquema de base de datos
│   └── seed.sql               # Datos de prueba
├── backend/                    # Código del backend
│   ├── src/
│   │   ├── controllers/       # Controladores
│   │   ├── models/            # Modelos de datos
│   │   ├── routes/            # Rutas API
│   │   ├── middleware/        # Middleware
│   │   └── services/          # Servicios de negocio
│   └── server.ts              # Servidor Express
├── docs/                       # Documentación
│   ├── problematica.md        # Problemática detallada
│   ├── solucion.md            # Solución propuesta
│   └── api.md                 # Documentación de API
├── diagramas/                  # Diagramas UML (PlantUML)
│   ├── casos-uso.puml
│   ├── secuencia-*.puml
│   └── entidad-relacion.puml
└── README.md                   # Este archivo
```

---

## 📊 Diagramas UML

El proyecto incluye diagramas completos en PlantUML:

### 1. **Diagrama de Casos de Uso**
- Casos de uso por actor (Administrador, Encargado, Usuario Operativo)
- Relaciones include y extend
- Archivo: `/diagrama-casos-uso.puml`

### 2. **Diagramas de Secuencia**
- Por cada actor del sistema
- Flujos completos de interacción
- Archivos:
  - `/diagrama-secuencia-administrador.puml`
  - `/diagrama-secuencia-encargado-almacen.puml`
  - `/diagrama-secuencia-usuario-operativo.puml`

### 3. **Diagrama de Entidad-Relación**
- Modelo completo de base de datos
- Relaciones y cardinalidades
- Archivo: `/diagrama-entidad-relacion.puml`

---

## 🔒 Seguridad

### Medidas Implementadas

1. **Autenticación JWT**
   - Tokens con expiración de 8 horas
   - Renovación automática de sesión
   - Logout seguro

2. **Cifrado de Contraseñas**
   - Bcrypt con salt
   - Mínimo 8 caracteres

3. **Control de Acceso**
   - RBAC (Role-Based Access Control)
   - Permisos granulares por módulo
   - Middleware de autorización

4. **Auditoría**
   - Log de todas las operaciones críticas
   - Registro de accesos
   - Trazabilidad completa

5. **Protección de API**
   - Validación de entrada de datos
   - Sanitización de inputs
   - Rate limiting
   - CORS configurado

6. **HTTPS**
   - Conexiones seguras en producción
   - Certificados SSL/TLS

---

## 📈 Beneficios Esperados

### Operativos
- ⬇️ Reducción del 70% en tiempo de registro de productos
- ⬇️ Reducción del 80% en tiempo de consulta de stock
- ⬇️ Eliminación del 95% de errores manuales
- ⬇️ Reducción del 60% en tiempo de generación de reportes

### Económicos
- ⬇️ Reducción del 40% en pérdidas por mermas
- ⬇️ Reducción del 50% en productos obsoletos
- ⬇️ Reducción del 30% en costos de almacenamiento
- 📈 ROI esperado: 250% en el primer año

### Estratégicos
- ✅ Toma de decisiones basada en datos
- ✅ Ventaja competitiva
- ✅ Escalabilidad del negocio
- ✅ Mejor servicio al cliente

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18.3.1
- TypeScript
- Tailwind CSS v4
- React Router 7
- Recharts
- Shadcn/UI
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- JWT
- Bcrypt

### Base de Datos
- PostgreSQL 14+

### Herramientas de Desarrollo
- Git
- PlantUML (para diagramas)
- ESLint
- Prettier

---

## 📝 Metodología de Desarrollo

### RUP (Rational Unified Process)
- **Fase de Inicio**: Definición de visión y requerimientos
- **Fase de Elaboración**: Diseño de arquitectura y prototipos
- **Fase de Construcción**: Desarrollo iterativo e incremental
- **Fase de Transición**: Despliegue y capacitación

### ABP (Aprendizaje Basado en Proyectos)
- Aprendizaje continuo durante el desarrollo
- Trabajo colaborativo
- Reflexión y mejora continua

---

## 🤝 Equipo de Desarrollo

**Instituto Superior Tecnológico Privado IDAT**  
Carrera de Desarrollo de Sistemas Front-End y Back-End

- **Jairo Aranya Huaman** - Responsable de Proyecto
- **Henry Raul Monroy Gutierrez** - Analista de Negocio/Sistemas
- **Eduardo Enrique Sánchez Peña** - Arquitecto de Software/Base de Datos
- **John Flores Marconi** - Desarrollador Backend
- **Ivan Zarate Soncco** - Desarrollador Frontend/QA

**Docente**: Ayquipa Cordova, Godofredo Beltran

---

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el sistema:

- **Email**: soporte@technologycuchito.com
- **Teléfono**: +51 XXX XXX XXX
- **Horario de atención**: Lunes a Viernes, 9:00 AM - 6:00 PM

---

## 📄 Licencia

Este proyecto es propiedad de **Technology Cuchito** y está protegido bajo licencia privada. Todos los derechos reservados.

---

## 🔄 Actualizaciones y Versiones

### Versión 1.0.0 (Marzo 2026)
- ✅ Implementación inicial del sistema
- ✅ Módulos principales completados
- ✅ Dashboard ejecutivo
- ✅ Sistema de alertas
- ✅ Reportes básicos

### Próximas Versiones (Planificadas)
- 📱 Aplicación móvil
- 📊 Reportes avanzados con BI
- 🔗 Integración con sistemas contables
- 📧 Notificaciones por email/SMS
- 📱 App móvil para encargados

---

**Sistema SaaS de Control de Inventario - Technology Cuchito**  
_Transformando la gestión de inventarios con tecnología de vanguardia_

© 2026 Technology Cuchito. Todos los derechos reservados.
