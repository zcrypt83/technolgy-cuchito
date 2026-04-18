# DCU02_Administrar_Productos

## Diagrama

Archivo UML: [DCU02_administrar-productos.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DCU02_administrar-productos.puml)

## Especificacion del caso de uso

- ID Caso de uso: DCU02
- Nombre del caso de uso: DCU_Administrar_Productos
- Actor principal: Administrador (y Encargado con permisos)
- Descripcion: permite crear, editar, consultar y desactivar productos del catalogo.
- Precondiciones: usuario autenticado con permiso `productos.*`.

### Flujo basico

1. El actor abre el modulo de productos.
2. El sistema muestra listado filtrable.
3. El actor selecciona crear o editar.
4. Ingresa datos del producto.
5. Opcionalmente selecciona almacen y stock inicial/actual.
6. El sistema valida y guarda producto.
7. El sistema crea/actualiza inventario cuando se envia stock.

### Flujo alternativo

1. Si el codigo de producto esta duplicado, el sistema rechaza el registro.
2. Si se envia stock sin almacen, el sistema solicita seleccionar almacen.
3. Si el actor no tiene acceso al almacen elegido, responde acceso denegado.

### Postcondiciones

- Producto registrado o actualizado.
- Inventario creado/actualizado por producto-almacen cuando aplica.
- Registro de auditoria `CREAR` o `ACTUALIZAR`.

### Relaciones

- Relacionado con `DCU03_Registrar_Movimiento` para variaciones posteriores de stock.

