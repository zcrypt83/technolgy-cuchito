# DCU03_Registrar_Movimiento

## Diagrama

Archivo UML: [DCU03_registrar-movimiento.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DCU03_registrar-movimiento.puml)

## Especificacion del caso de uso

- ID Caso de uso: DCU03
- Nombre del caso de uso: DCU_Registrar_Movimiento
- Actor principal: Administrador, Encargado de Almacen o Usuario Operativo autorizado.
- Descripcion: permite registrar entradas, salidas y transferencias de inventario entre almacenes.
- Precondiciones: usuario autenticado y con permiso `movimientos.crear`.

### Flujo basico

1. El actor abre el modulo de movimientos.
2. Selecciona tipo de movimiento: entrada, salida o transferencia.
3. Selecciona producto y almacenes segun el tipo.
4. Ingresa cantidad y motivo.
5. El sistema valida stock disponible y reglas de negocio.
6. El sistema registra el movimiento.
7. El sistema actualiza inventario y refleja cambios en tiempo real.

### Flujo alternativo

1. Si la cantidad es menor a 1, el sistema muestra validacion.
2. Si no hay stock suficiente para salida/transferencia, el sistema rechaza el registro.
3. Si faltan campos obligatorios, el sistema muestra mensaje de datos incompletos.

### Postcondiciones

- Movimiento registrado en historial.
- Stock actualizado en el/los almacenes involucrados.
- Registro de auditoria `REGISTRAR_MOVIMIENTO`.

### Relaciones

- Relacionado con `DCU02_Administrar_Productos`.
- Relacionado con `DCU05_Consultar_Auditoria`.
