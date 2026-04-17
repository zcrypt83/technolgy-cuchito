# 📘 Guía Rápida de Uso - Sistema de Inventario v2.0

## 🚀 Inicio Rápido

### Ejecutar la Aplicación

La aplicación se ejecuta automáticamente en el entorno de Figma Make. Todos los componentes están en:

```
/src/app/
```

### Navegación

La aplicación tiene 5 páginas principales accesibles desde el menú superior:

1. **Dashboard** - Vista general con KPIs
2. **Productos** - Gestión completa de productos
3. **Almacenes** - Gestión de centros de distribución
4. **Usuarios** - Administración de usuarios y permisos
5. **Movimientos** - Registro de entradas/salidas/transferencias

---

## 📦 Gestión de Productos

### Crear Nuevo Producto

1. Click en botón "Nuevo Producto" (azul, esquina superior derecha)
2. Completar formulario:
   - **SKU**: Formato TECH-XXX (ej: TECH-001)
   - **Nombre**: Mínimo 3 caracteres
   - **Marca**: Requerido
   - **Categoría**: Seleccionar del dropdown
   - **Precio**: Mayor a 0
   - **Stock Inicial**: No negativo
   - **Stock Mínimo**: Mínimo 1
3. Click "Crear Producto"
4. ✅ Toast de confirmación aparecerá

### Editar Producto

1. Click en icono de lápiz verde en la columna "Acciones"
2. Modal se abre con datos actuales
3. Modificar campos necesarios
4. Click "Actualizar Producto"
5. ✅ Toast de confirmación

### Eliminar Producto

1. Click en icono de basura rojo en "Acciones"
2. Diálogo de confirmación aparece:
   - Título: "¿Eliminar Producto?"
   - Descripción con nombre del producto
3. Click "Eliminar" para confirmar
4. ✅ Toast de confirmación

### Buscar Productos

- Escribir en barra de búsqueda superior
- Busca en: nombre, SKU, marca
- Resultados en tiempo real

### Paginación

- 10 productos por página
- Botones "Anterior" y "Siguiente" en parte inferior
- Contador de página actual

---

## 🏢 Gestión de Almacenes

### Crear Nuevo Almacén

1. Click en "Nuevo Almacén"
2. Completar formulario:
   - **Código**: Formato ALM-XXX (ej: ALM-001)
   - **Nombre**: Mínimo 3 caracteres
   - **Dirección**: Requerida
   - **Ciudad**: Requerida
   - **Capacidad Máxima**: Mínimo 1
   - **Encargado**: Nombre completo
   - **Teléfono**: 9 dígitos
3. Click "Crear Almacén"

### Indicadores de Capacidad

Los almacenes muestran barras de progreso con colores:

- 🟢 **Verde**: < 70% utilizado
- 🟡 **Amarillo**: 70-89% utilizado
- 🔴 **Rojo**: ≥ 90% utilizado

---

## 👥 Gestión de Usuarios

### Crear Nuevo Usuario

1. Click en "Nuevo Usuario"
2. Completar formulario:
   - **Nombre Completo**: Mínimo 3 caracteres
   - **Email**: Formato válido
   - **Teléfono**: 9 dígitos
   - **Rol**: Seleccionar (Admin/Encargado/Operario)
   - **Almacén Asignado**: Seleccionar del dropdown
   - **Contraseña**: Mínimo 8 caracteres
3. Click "Crear Usuario"

### Roles Disponibles

- 🟣 **Administrador**: Acceso completo al sistema
- 🔵 **Encargado**: Gestión de almacén asignado
- 🟢 **Operario**: Operaciones básicas

### Filtrar por Rol

- Usar dropdown "Todos los roles" en la barra de búsqueda
- Seleccionar rol deseado
- Tabla se actualiza automáticamente

---

## 📊 Registro de Movimientos

### Tipos de Movimientos

#### 1. 🟢 Entrada (↑)
- Ingreso de productos al almacén
- Aumenta el stock
- Ejemplo: Compra a proveedor

#### 2. 🔴 Salida (↓)
- Egreso de productos del almacén
- Disminuye el stock
- Ejemplo: Venta a cliente

#### 3. 🔵 Transferencia (⇄)
- Traslado entre almacenes
- Disminuye stock en origen
- Aumenta stock en destino

### Registrar Nuevo Movimiento

1. Click en "Nuevo Movimiento"
2. Seleccionar tipo (botones visuales con iconos)
3. Completar datos según tipo:

   **Para Entrada/Salida:**
   - Producto
   - Cantidad
   - Almacén
   - Observaciones (opcional)

   **Para Transferencia:**
   - Producto
   - Cantidad
   - Almacén Origen
   - Almacén Destino
   - Observaciones (opcional)

4. Click "Registrar Movimiento"

### Estadísticas del Día

En la parte superior se muestran 3 KPIs:
- Entradas del día
- Salidas del día
- Transferencias del día

---

## 🎨 Entender los Indicadores Visuales

### Productos

| Badge | Significado |
|-------|-------------|
| 🔴 Agotado | Stock = 0 |
| 🟡 Stock Bajo | Stock ≤ Stock Mínimo |
| 🟢 Disponible | Stock > Stock Mínimo |

### Estados de Validación

| Color | Significado |
|-------|-------------|
| Borde Rojo | Campo con error |
| Mensaje Rojo | Error de validación |
| Borde Azul | Campo enfocado |
| Borde Gris | Campo normal |

---

## ⚡ Atajos y Tips

### Búsqueda Eficiente
- La búsqueda es en tiempo real (sin necesidad de Enter)
- Busca en múltiples campos simultáneamente
- No distingue mayúsculas/minúsculas

### Validación en Tiempo Real
- Los errores aparecen mientras escribes
- El botón submit se activa solo con datos válidos
- Iconos de alerta indican campos con problemas

### Navegación Rápida
- Los tabs superiores cambian de página instantáneamente
- El tab activo se resalta en azul
- Usa las flechas del teclado en los selects

### Confirmaciones
- **IMPORTANTE**: Todas las eliminaciones requieren confirmación
- Puedes cancelar con:
  - Botón "Cancelar"
  - Click fuera del diálogo
  - Tecla ESC (en algunos casos)

---

## 🔔 Sistema de Notificaciones (Toast)

### Tipos de Notificaciones

1. **Éxito** (Verde): Operación completada
   - "Producto creado correctamente"
   - "Usuario actualizado correctamente"

2. **Error** (Rojo): Operación falló
   - "Error al cargar datos"
   - "Error de validación"

3. **Info** (Azul): Información general
   - "Funcionalidad en desarrollo"

### Ubicación
- Esquina superior derecha
- Desaparecen automáticamente después de 3-5 segundos
- Múltiples notificaciones se apilan verticalmente

---

## 📱 Responsive Design

### Mobile (< 640px)
- Navegación se adapta
- Tablas con scroll horizontal
- Modales ocupan ancho completo
- Grids cambian a columna única

### Tablet (640px - 1024px)
- Grid de 2 columnas en almacenes
- Tablas con scroll si necesario
- Formularios en 2 columnas

### Desktop (> 1024px)
- Grid de 3-4 columnas
- Tablas completas visibles
- Formularios optimizados
- Modales centrados

---

## 🐛 Solución de Problemas Comunes

### "El formulario no se envía"
✅ Revisa que todos los campos obligatorios (*) estén completos
✅ Verifica que no haya mensajes de error en rojo
✅ Asegúrate de que los formatos sean correctos (SKU, email, etc.)

### "No veo el producto que busco"
✅ Revisa filtros activos
✅ Verifica la página actual de paginación
✅ El producto puede estar inactivo (eliminado)

### "El modal no se cierra"
✅ Click en el botón X superior derecho
✅ Click en "Cancelar"
✅ Click fuera del modal (en el fondo oscuro)

### "No aparecen datos"
✅ Los datos son de ejemplo (mock data)
✅ Para datos reales, conectar con backend
✅ Revisar consola del navegador (F12)

---

## 🔐 Seguridad y Mejores Prácticas

### Contraseñas
- Mínimo 8 caracteres
- Solo se solicita al crear usuario
- Al editar usuario, la contraseña no se modifica

### Eliminación de Datos
- Soft delete (marca como inactivo)
- Los datos no se borran físicamente
- Siempre requiere confirmación

### Validación
- Frontend: react-hook-form
- Backend: express-validator (cuando se conecte)
- Doble validación para seguridad

---

## 📊 Datos de Ejemplo

### Productos Iniciales
- 5 productos tecnológicos
- Diferentes categorías
- Niveles de stock variados

### Almacenes Iniciales
- 3 almacenes en diferentes ubicaciones
- Capacidades variadas
- Diferentes niveles de ocupación

### Usuarios Iniciales
- 4 usuarios con diferentes roles
- Asignados a diferentes almacenes

### Movimientos Iniciales
- 3 movimientos de ejemplo
- Entrada, salida y transferencia

---

## 🎯 Próximos Pasos

### Para Desarrolladores

1. **Conectar con Backend**:
   ```typescript
   // Reemplazar datos mock por llamadas API
   const productos = await api.getProductos();
   ```

2. **Agregar Loading States**:
   ```typescript
   const [loading, setLoading] = useState(false);
   ```

3. **Implementar Error Handling**:
   ```typescript
   try {
     await api.createProducto(data);
   } catch (error) {
     toast.error(error.message);
   }
   ```

### Para Usuarios

1. Explorar todas las páginas
2. Probar crear/editar/eliminar en cada módulo
3. Familiarizarse con los filtros y búsquedas
4. Revisar las validaciones de formularios

---

## 📞 Soporte

Para más información, consulta:
- `README.md` - Documentación general
- `MEJORAS_IMPLEMENTADAS_v2.md` - Detalles técnicos completos
- `sistema-inventario-review.md` - Revisión original

---

## ✅ Checklist de Funcionalidades Probadas

- [ ] Crear producto
- [ ] Editar producto
- [ ] Eliminar producto (con confirmación)
- [ ] Buscar productos
- [ ] Navegar páginas de productos
- [ ] Ver detalles de producto
- [ ] Crear almacén
- [ ] Editar almacén
- [ ] Ver capacidad de almacenes
- [ ] Crear usuario
- [ ] Filtrar usuarios por rol
- [ ] Registrar entrada de productos
- [ ] Registrar salida de productos
- [ ] Registrar transferencia
- [ ] Ver estadísticas en Dashboard

---

*Guía actualizada: 9 de abril, 2026*
*Versión del Sistema: 2.0.0*
