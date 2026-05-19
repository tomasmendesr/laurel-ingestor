/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ej: http://localhost:3000 — sin barra final */
  readonly VITE_API_BASE_URL?: string
  /** Debe coincidir con INGEST_API_KEY del backend si está definida */
  readonly VITE_INGEST_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
