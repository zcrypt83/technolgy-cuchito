# DCU05_Consultar_Auditoria

## Diagrama

Archivo UML: [DCU05_consultar-auditoria.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DCU05_consultar-auditoria.puml)

## Especificacion del caso de uso

- ID Caso de uso: DCU05
- Nombre del caso de uso: DCU_Consultar_Auditoria
- Actor principal: Administrador.
- Descripcion: permite revisar trazabilidad de acciones realizadas en el sistema.
- Precondiciones: usuario autenticado con permiso `auditoria.ver`.

### Flujo basico

1. El administrador abre el modulo de auditoria.
2. El sistema muestra registros ordenados por fecha.
3. El administrador aplica filtros por usuario, modulo, accion o rango de fechas.
4. El sistema muestra resultados segun filtros.
5. El administrador consulta detalle de un evento.
6. Opcionalmente exporta reporte.

### Flujo alternativo

1. Si no existen registros en el rango solicitado, el sistema muestra lista vacia.
2. Si el usuario no tiene permiso de exportacion, el sistema deshabilita esa opcion.
3. Si ocurre error de consulta, el sistema registra incidente y muestra mensaje controlado.

### Postcondiciones

- El administrador visualiza eventos y trazabilidad del sistema.
- Si se exporta, se genera archivo del reporte.

### Relaciones

- Es incluido por `DCU04_Configurar_Permisos`.
- Recibe eventos de `DCU01`, `DCU02` y `DCU03`.
