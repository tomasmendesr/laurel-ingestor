# Laurel Ingestor

API de ingesta de actividades (NestJS + Fastify): el cliente envía lotes con `activityId` (UUID) para idempotencia; la app valida, deduplica y persiste detrás de un repositorio abstracto (hoy en memoria, mañana Mongo / worker).

## Cómo levantar

```bash
npm install
cp .env.example .env   # opcional: ajustá PORT
npm run start:dev
```

Por defecto escucha en el puerto `3000` (o el que definas en `PORT`). Podés probar los endpoints con el archivo `activities.rest` o cualquier cliente HTTP.

## Tests

```bash
npm run test          # unit (p. ej. ActivitiesService)
npm run test:e2e      # e2e: Fastify + /health + POST/GET /activities
npm run lint && npm run build
```

## Arquitectura (resumen)

- **Presentation:** controllers HTTP (`src/activities/presentation`).
- **Application:** orquestación, DTOs de comando/resultado, contrato `ActivitiesRepository` (`src/activities/application`).
- **Infrastructure:** implementación concreta del repo (`src/activities/infrastructure`).
- **Ingesta batch:** una consulta de existencia por lote + un `createMany`; duplicados se reportan en la respuesta sin fallar todo el batch.
- **Observabilidad:** filtro global de excepciones e interceptor de logging (`src/common`); cada request tiene **`x-request-id`** (o se acepta `x-correlation-id`), se devuelve en la respuesta y en errores (`requestId` en JSON) para correlacionar logs.
- **Operación:** `GET /health` devuelve `status` y `timestamp` para probes (Kubernetes, load balancer, etc.).
- **Ingesta:** `POST/GET /activities` exigen el header **`x-api-key`**. Si definís **`INGEST_API_KEY`** en el entorno, el header debe coincidir; si no, basta con un valor no vacío (útil en dev).
