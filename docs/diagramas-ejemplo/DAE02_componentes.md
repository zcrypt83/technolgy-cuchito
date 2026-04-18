# Diagrama de componentes

Este diagrama presenta los componentes actuales implementados en el sistema.

## Componentes principales

1. Frontend:
- Modulos: autenticacion, dashboard, productos, inventario, movimientos, auditoria, configuracion.
- Servicios: `api.ts`, `realtime.ts`, `useLiveData`.

2. Backend:
- Rutas REST: auth, productos, inventario, movimientos, almacenes, usuarios, categorias, proveedores, auditoria, configuracion.
- Controladores y servicios de negocio.
- Middleware de autenticacion, roles, rate limiting y manejo de errores.

3. Datos:
- PostgreSQL (tablas operativas).
- Redis (cache distribuido).
- Archivo de configuracion administrativa (`admin-settings.json`).

4. Infraestructura:
- Render Static Site (frontend).
- Render Web Service (backend).
- Render Postgres.
- Render Key Value.

Archivo UML: [DAE02_componentes.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DAE02_componentes.puml)

