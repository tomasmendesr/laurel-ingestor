# Laurel Ingestor

Monorepo con **API de ingesta** (`api/`) y **cliente web** (`client/`, próximo paso).

La API (NestJS + Fastify) recibe lotes de actividades con `activityId` (UUID) para idempotencia; valida, deduplica y persiste detrás de un repositorio abstracto (hoy en memoria).

## Estructura

| Carpeta   | Contenido |
|-----------|-----------|
| `api/`    | Backend NestJS: código, tests, `activities.rest`, `.env.example` |
| `client/` | Frontend (React / Vite pendiente de scaffold) |

## API: cómo levantar

Desde la raíz del repo podés usar los scripts de conveniencia, o entrar a `api/`:

```bash
cd api
npm install
cp .env.example .env   # opcional: ajustá PORT
npm run start:dev
```

Por defecto escucha en el puerto **3000** (o el definido en `PORT`). Podés probar con `api/activities.rest` o cualquier cliente HTTP.

## API: tests

```bash
cd api
npm run test          # unit (p. ej. ActivitiesService)
npm run test:e2e      # e2e: Fastify + /health + POST/GET /activities
npm run lint && npm run build
```

También: `npm run test:api` y `npm run test:e2e:api` desde la raíz si usás el `package.json` raíz.

## Arquitectura (API, resumen)

- **Presentation:** controllers HTTP (`api/src/activities/presentation`).
- **Application:** orquestación, DTOs, contrato `ActivitiesRepository` (`api/src/activities/application`).
- **Infrastructure:** implementación del repo (`api/src/activities/infrastructure`).
- **Batch:** consulta de existencia por lote + `createMany`; duplicados en la respuesta sin fallar el batch.
- **Observabilidad:** filtro global e interceptor de logging (`api/src/common`); **`x-request-id`** (o **`x-correlation-id`**) en respuesta y errores (`requestId`).
- **Operación:** `GET /health` con `status` y `timestamp`.
- **Ingesta:** `POST/GET /activities` requieren **`x-api-key`**. Con **`INGEST_API_KEY`** en el entorno el header debe coincidir; sin eso, basta un valor no vacío en dev.
