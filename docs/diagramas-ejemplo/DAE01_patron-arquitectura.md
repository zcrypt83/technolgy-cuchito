# Diseno del patron de arquitectura del proyecto

## Elemento

- Patron de arquitectura: N capas + MVC + API REST.
- Objetivo principal: separar responsabilidades para mejorar mantenibilidad, seguridad y escalabilidad.

## Estructura del sistema

1. Capa de presentacion: Frontend React + Vite.
2. Capa de logica de negocio: Backend Node.js + Express + TypeScript.
3. Capa de datos: PostgreSQL con Sequelize.
4. Capa de integracion: API REST (`/api/*`) y sincronizacion en vivo en frontend.
5. Capa de cache distribuido: Redis (Render Key Value).

## Flujo de interaccion

1. El usuario interactua con frontend.
2. El frontend envia solicitudes HTTP al backend.
3. El backend valida autenticacion/roles y reglas de negocio.
4. El backend persiste/consulta en PostgreSQL y cachea cuando aplica.
5. El backend responde al frontend.
6. El frontend actualiza vistas en tiempo real sin recargar.

## Responsables tecnicos (por rol de trabajo)

- Backend/API: rutas, controladores, reglas de inventario, auditoria.
- Frontend/UI: formularios, dashboards, consumo API, actualizacion en vivo.
- Datos e infraestructura: modelo relacional, despliegue Render (Web + Static + Postgres + Redis).

## Diagrama conceptual

Archivo UML: [DAE01_patron-arquitectura.puml](/E:/study/IDAT/IV-CICLO/PROYECTO%20DE%20INTEGRACION%20DE%20LOS%20COMPONENTES%20DE%20LAS%20CAPAS_DE%20DATOS%20NEGOCIO%20Y%20VISTA/Desarrollar%20sistema%20SaaS/docs/diagramas-ejemplo/DAE01_patron-arquitectura.puml)

