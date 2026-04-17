# Sistema SaaS - Technology Cuchito

Sistema de control de inventario con arquitectura:

- `frontend/`: React + Vite + TypeScript
- `backend/`: Node.js + Express + PostgreSQL + Sequelize

## Ejecución local rápida

```bash
pnpm install
pnpm run dev:backend
pnpm run dev:frontend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Carga de datos demo (100+ productos)

Este proyecto incluye un seeder incremental que no elimina tu data existente y garantiza volumen de prueba.

```bash
pnpm run seed:bulk-demo
```

El script:

- deja al menos `120` productos activos,
- crea inventario por almacén,
- inserta movimientos y transferencias reales.

## Despliegue completo en Render

Este repositorio ya incluye `render.yaml` para desplegar todo el sistema:

- Frontend (Static Site)
- Backend (Web Service Node.js)
- PostgreSQL (Render Postgres)
- Redis/Key Value (Render Key Value)

### Paso a paso rápido

1. Sube este repositorio a GitHub/GitLab.
2. En Render, ve a **New +** > **Blueprint**.
3. Conecta tu repositorio y selecciona la rama principal.
4. Render detectará `render.yaml` y creará los 4 recursos.
5. Espera que termine el primer deploy.
6. Verifica backend en `/api/health` y luego abre el frontend.

### Variables importantes a revisar después del primer deploy

En el servicio backend (`technology-cuchito-backend`):

- `CORS_ORIGIN` debe coincidir con la URL pública real del frontend.
- `DB_SSL` (`false` para conexión interna de Render; usa `true` si cambias a conexión externa).

En el servicio frontend (`technology-cuchito-frontend`):

- `VITE_API_URL` debe apuntar a la URL pública real del backend + `/api`.

### Inicializar tablas y data (primer despliegue)

Desde el servicio backend en Render (Shell):

```bash
pnpm --filter=technology-cuchito-backend migrate
pnpm --filter=technology-cuchito-backend seed
```

Para cargar volumen demo:

```bash
pnpm --filter=technology-cuchito-backend seed:bulk-demo
```

## Documentación por capa

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
