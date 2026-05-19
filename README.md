# Laurel Ingestor

Monorepo con **API de ingesta** (`api/`) y **dashboard en React** (`client/`).

La API (NestJS + Fastify) recibe lotes de actividades con `activityId` (UUID) para idempotencia; valida, deduplica y persiste detrás de un repositorio abstracto (hoy en memoria). El client consume `GET/POST /activities` para validar el flujo de punta a punta.

## Estructura

| Carpeta   | Contenido |
|-----------|-----------|
| `api/`    | Backend NestJS: código, tests, `activities.rest`, `.env.example` |
| `client/` | Frontend: Vite + React + TypeScript + Tailwind; dashboard de ingesta |

## Requisitos

- **Node:** alineado con Vite 8 (p. ej. **20.19+** o **22.12+**). Si `npm run dev` en `client` falla con Rolldown/bindings, subí Node y borrá `node_modules` + lockfile en `client`, luego `npm install`.

## Levantar todo (local)

Terminal 1 — API:

```bash
cd api
npm install
cp .env.example .env   # opcional: PORT, INGEST_API_KEY
npm run start:dev
```

Por defecto el API escucha en **http://localhost:3000**. El client asume esa URL salvo que definas `VITE_API_BASE_URL`.

Terminal 2 — dashboard:

```bash
cd client
npm install
cp .env.example .env   # opcional
npm run dev
```

Abrí **http://localhost:5173**. CORS en el API está habilitado para ese origen (ver `api/src/main.ts`).

**API key:** el client envía `x-api-key` (default `dev-local-key`). Si definís `INGEST_API_KEY` en `api/.env`, usá el mismo valor en `client` vía `VITE_INGEST_API_KEY`.

## API: tests

```bash
cd api
npm run test
npm run test:e2e
npm run lint && npm run build
```

Desde la raíz (si usás el `package.json` raíz): `npm run test:api`, `npm run test:e2e:api`, etc.

## Arquitectura (resumen)

### API

- **Presentation:** controllers (`api/src/activities/presentation`).
- **Application:** servicio, DTOs, `ActivitiesRepository` (`api/src/activities/application`).
- **Infrastructure:** repo en memoria (`api/src/activities/infrastructure`).
- **Batch:** idempotencia con `persistedIds` / `skippedDuplicateIds`.
- **Observabilidad:** `x-request-id` / `x-correlation-id` en errores (`requestId` en JSON).
- **Operación:** `GET /health`.
- **Ingesta:** `POST/GET /activities` con header **`x-api-key`**.

### Client

Ver **`client/README.md`**: `apiClient`, `DashboardContext`, componentes del dashboard.

## Más

- Llamadas HTTP de ejemplo: `api/activities.rest`.
