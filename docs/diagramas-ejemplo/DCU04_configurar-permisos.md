# DCU04_Configurar_Permisos

## Diagrama

Archivo UML: [DCU04_configurar-permisos.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DCU04_configurar-permisos.puml)

## Especificacion del caso de uso

- ID Caso de uso: DCU04
- Nombre del caso de uso: DCU_Configurar_Permisos
- Actor principal: Administrador.
- Descripcion: permite administrar permisos, acciones y configuraciones globales de acceso por rol.
- Precondiciones: usuario autenticado con rol Administrador.

### Flujo basico

1. El administrador abre el panel de configuracion.
2. El sistema muestra roles y permisos actuales.
3. El administrador selecciona un rol o usuario objetivo.
4. Asigna o revoca permisos y acciones.
5. Guarda cambios de configuracion.
6. El sistema aplica configuracion y confirma operacion.

### Flujo alternativo

1. Si el administrador intenta quitar permisos criticos del ultimo administrador activo, el sistema bloquea la accion.
2. Si existe conflicto de reglas, el sistema muestra advertencia y no aplica cambios.
3. Si se pierde conexion, el sistema conserva el estado del formulario para reintentar.

### Postcondiciones

- Permisos y acciones actualizados para el rol/usuario seleccionado.
- Configuracion persistida en backend.
- Registro de auditoria `ACTUALIZAR_PERMISOS`.

### Relaciones

- Incluye `DCU05_Consultar_Auditoria` para trazabilidad de cambios.
