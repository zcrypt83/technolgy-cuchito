# Diagrama de Componentes - Technology Cuchito

## Estado actual
Diagrama actualizado según la implementación real del repositorio:

- Frontend React + Vite (sitio estático en Render)
- Backend Express + TypeScript (servicio web en Render)
- PostgreSQL (datos operativos)
- Redis Key Value (cache distribuido)
- `admin-settings.json` (configuración de permisos y acciones auditables)
- Sincronización en vivo en frontend (`realtime.ts` + `useLiveData`)

## Diagrama UML (PlantUML)

```plantuml
@startuml
title Diagrama de Componentes - Arquitectura actual (Render)

skinparam componentStyle rectangle
skinparam linetype ortho

package "Render Platform" {
  component "Static Site\ntechnology-cuchito-frontend" as StaticFE
  component "Web Service\ntechnology-cuchito-backend" as WebBE
  database "PostgreSQL\ntechnology-cuchito-db" as PG
  component "Key Value Redis\ntechnology-cuchito-redis" as Redis
}

package "Frontend (React + TS)" as Frontend {
  component "Auth + Rutas Protegidas" as FEAuth
  component "Módulos UI\n(Productos, Inventario,\nMovimientos, Auditoría,\nConfiguración Admin)" as FEMod
  component "API Client\n(fetch)" as FEApi
  component "Realtime Bus\nrealtime.ts" as FEBus
  component "Refresco en vivo\nuseLiveData" as FELive
}

package "Backend (Express + TS)" as Backend {
  component "Middlewares\n(auth, roles, rate limit,\nperformance, error handler)" as BEMw
  component "Routes + Controllers" as BECtrl
  component "Servicios de negocio\n(auditoría, configuración,\nvalidación acceso almacén)" as BESvc
  component "Modelos Sequelize" as BEModel
  artifact "admin-settings.json" as Settings
}

StaticFE --> FEAuth
FEAuth --> FEMod
FEMod --> FEApi
FEApi --> WebBE : HTTPS /api/*
FEMod --> FEBus
FEBus --> FELive
FELive --> FEApi : refresh incremental\n(eventos + polling)

WebBE --> BEMw
BEMw --> BECtrl
BECtrl --> BESvc
BECtrl --> BEModel
BESvc --> Settings
BEModel --> PG
BESvc --> PG
BESvc --> Redis

note right of FELive
El frontend se actualiza sin refrescar
la página cuando cambian datos:
- POST/PUT/DELETE emiten evento
- vistas suscritas refrescan datos
end note

note right of Settings
Configuración administrativa persistida:
- permisos por rol
- acciones auditables
end note

@enduml
```

## Componentes clave

1. `frontend/src/app/services/api.ts`: cliente centralizado para todos los módulos.
2. `frontend/src/app/services/realtime.ts`: bus de eventos local + `storage`.
3. `frontend/src/app/hooks/useLiveData.ts`: refresco reactivo + polling.
4. `backend/src/routes/*`: endpoints REST protegidos por rol.
5. `backend/src/services/configuracionService.ts`: catálogo/permisos auditables persistidos.
6. `backend/src/config/redis.ts`: cache distribuido para rendimiento y escalabilidad.

