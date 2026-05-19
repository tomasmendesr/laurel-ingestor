# Laurel Ingestor — Client

Dashboard en **React + TypeScript + Vite** con **Tailwind CSS** y **lucide-react**. Habla con la API Nest en `http://localhost:3000` (configurable).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

## Variables de entorno (opcional)

Copiá `.env.example` a `.env` en esta carpeta.

| Variable | Uso |
|----------|-----|
| `VITE_API_BASE_URL` | Base del API (default `http://localhost:3000`) |
| `VITE_INGEST_API_KEY` | Valor de `x-api-key`; debe coincidir con `INGEST_API_KEY` del `api/.env` si está definida |

## Estructura relevante

| Ruta | Rol |
|------|-----|
| `src/api/apiClient.ts` | `fetch` centralizado: `baseURL`, `x-api-key`, `x-request-id`, errores |
| `src/context/DashboardContext.tsx` | Estado global del dashboard, `getActivities` al montar, `ingestOne` |
| `src/components/` | UI: formulario de ingesta, métricas, tabla, banner de error, log de red |
| `src/App.tsx` | `DashboardProvider` + layout |

## Prerrequisito

El API debe estar corriendo (y con CORS para `http://localhost:5173`; ya configurado en `api/src/main.ts`). Ver README en la raíz del monorepo.

## Stack (plantilla base)

Proyecto generado con Vite (`react-ts`). Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`.
