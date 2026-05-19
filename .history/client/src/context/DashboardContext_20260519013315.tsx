import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiClientError,
  getActivities,
  postIngestBatch,
  type Activity,
  type IngestBatchResult,
} from '../api/apiClient'

/** Id fijo para demos de idempotencia: 1er POST persiste, siguientes → skippedDuplicateIds. */
export const DEMO_REPEAT_ACTIVITY_ID = '00000000-0000-4000-8000-000000000001'

export type RequestLogEntry = {
  readonly id: string
  readonly at: string
  readonly method: 'GET' | 'POST'
  readonly path: string
  readonly latencyMs: number
  readonly ok: boolean
  readonly summary: string
}

export type DashboardError = {
  readonly message: string
  readonly status: number
  readonly requestId?: string
}

type DashboardContextValue = {
  /** Filas actuales del servidor (GET /activities). */
  activities: Activity[]
  /** Suma de `persistedIds.length` en cada POST exitoso de esta sesión. */
  sessionPersistedCount: number
  /** Suma de `skippedDuplicateIds.length` en cada POST exitoso de esta sesión. */
  sessionSkippedCount: number
  /** Latencia del último GET o POST completado (éxito o error HTTP con respuesta). */
  lastLatencyMs: number | null
  readonly requestLogs: RequestLogEntry[]
  readonly globalError: DashboardError | null
  readonly isLoading: boolean
  clearError: () => void
  refreshActivities: () => Promise<void>
  /** Envía un batch de una actividad; refresca lista en éxito. */
  ingestOne: (input: {
    userId: string
    forceDuplicate: boolean
  }) => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

function logId(): string {
  return crypto.randomUUID()
}

function formatLogSummary(result: IngestBatchResult): string {
  const p = result.persistedIds.length
  const s = result.skippedDuplicateIds.length
  return `persisted=${p}, skipped=${s}`
}

/**
 * Estado global de UI de sesión: métricas agregadas, historial de red y lista del servidor.
 *
 * Por qué Context (y no solo useState en App):
 * - Varios componentes (tabla, métricas, banner) necesitan la misma verdad sin “prop drilling”.
 * - Es un dashboard acotado; el árbol bajo este provider es el alcance claro del estado.
 *
 * En una app real con más pantallas y cacheo, conviene separar “server state” (p. ej. TanStack Query:
 * revalidación, staleTime, invalidación tras mutación) del estado puramente de UI (panel abierto,
 * input del formulario). Los inputs del formulario siguen en estado local del formulario para no
 * re-renderizar todo el árbol en cada tecla.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [sessionPersistedCount, setSessionPersistedCount] = useState(0)
  const [sessionSkippedCount, setSessionSkippedCount] = useState(0)
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null)
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([])
  const [globalError, setGlobalError] = useState<DashboardError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bootstrapDone, setBootstrapDone] = useState(false)

  const appendLog = useCallback((entry: RequestLogEntry) => {
    setRequestLogs((prev) => [entry, ...prev].slice(0, 50))
  }, [])

  const refreshActivities = useCallback(async () => {
    setGlobalError(null)
    const t0 = performance.now()
    try {
      const rows = await getActivities()
      const latencyMs = Math.round(performance.now() - t0)
      setLastLatencyMs(latencyMs)
      setActivities(rows)
      appendLog({
        id: logId(),
        at: new Date().toISOString(),
        method: 'GET',
        path: '/activities',
        latencyMs,
        ok: true,
        summary: `${rows.length} row(s)`,
      })
    } catch (e) {
      const latencyMs = Math.round(performance.now() - t0)
      setLastLatencyMs(latencyMs)
      if (e instanceof ApiClientError) {
        appendLog({
          id: logId(),
          at: new Date().toISOString(),
          method: 'GET',
          path: '/activities',
          latencyMs,
          ok: false,
          summary: e.message,
        })
        setGlobalError({
          message: e.message,
          status: e.status,
          requestId: e.body?.requestId,
        })
        return
      }
      const message = e instanceof Error ? e.message : 'Error desconocido'
      appendLog({
        id: logId(),
        at: new Date().toISOString(),
        method: 'GET',
        path: '/activities',
        latencyMs,
        ok: false,
        summary: message,
      })
      setGlobalError({ message, status: 0 })
    }
  }, [appendLog])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
      setIsLoading(true)
      await refreshActivities()
      if (!cancelled) {
        setIsLoading(false)
        setBootstrapDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshActivities])

  const clearError = useCallback(() => setGlobalError(null), [])

  const ingestOne = useCallback(
    async (input: { userId: string; forceDuplicate: boolean }) => {
      setGlobalError(null)
      const activityId = input.forceDuplicate
        ? DEMO_REPEAT_ACTIVITY_ID
        : crypto.randomUUID()

      const body: Activity = {
        activityId,
        userId: input.userId.trim() || 'anonymous',
        task: 'dashboard-ingest',
        duration: 60,
        startTime: new Date().toISOString(),
      }

      const t0 = performance.now()
      try {
        const result = await postIngestBatch({ activities: [body] })
        const latencyMs = Math.round(performance.now() - t0)
        setLastLatencyMs(latencyMs)
        setSessionPersistedCount((c) => c + result.persistedIds.length)
        setSessionSkippedCount((c) => c + result.skippedDuplicateIds.length)
        appendLog({
          id: logId(),
          at: new Date().toISOString(),
          method: 'POST',
          path: '/activities',
          latencyMs,
          ok: true,
          summary: formatLogSummary(result),
        })
        await refreshActivities()
      } catch (e) {
        const latencyMs = Math.round(performance.now() - t0)
        setLastLatencyMs(latencyMs)
        if (e instanceof ApiClientError) {
          appendLog({
            id: logId(),
            at: new Date().toISOString(),
            method: 'POST',
            path: '/activities',
            latencyMs,
            ok: false,
            summary: e.message,
          })
          setGlobalError({
            message: e.message,
            status: e.status,
            requestId: e.body?.requestId,
          })
          return
        }
        const message = e instanceof Error ? e.message : 'Error desconocido'
        appendLog({
          id: logId(),
          at: new Date().toISOString(),
          method: 'POST',
          path: '/activities',
          latencyMs,
          ok: false,
          summary: message,
        })
        setGlobalError({ message, status: 0 })
      }
    },
    [appendLog, refreshActivities],
  )

  const value = useMemo<DashboardContextValue>(
    () => ({
      activities,
      sessionPersistedCount,
      sessionSkippedCount,
      lastLatencyMs,
      requestLogs,
      globalError,
      isLoading: isLoading || !bootstrapDone,
      clearError,
      refreshActivities,
      ingestOne,
    }),
    [
      activities,
      sessionPersistedCount,
      sessionSkippedCount,
      lastLatencyMs,
      requestLogs,
      globalError,
      isLoading,
      bootstrapDone,
      clearError,
      refreshActivities,
      ingestOne,
    ],
  )

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return ctx
}
