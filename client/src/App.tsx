import { Activity } from 'lucide-react'
import { ActivityTable } from './components/ActivityTable'
import { ErrorBanner } from './components/ErrorBanner'
import { InjectorForm } from './components/InjectorForm'
import { MetricsGrid } from './components/MetricsGrid'
import { RequestLogList } from './components/RequestLogList'
import { DashboardProvider, useDashboard } from './context/DashboardContext'

function DashboardShell() {
  const {
    activities,
    sessionPersistedCount,
    sessionSkippedCount,
    lastLatencyMs,
    globalError,
    clearError,
    isLoading,
    refreshActivities,
  } = useDashboard()

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="size-9 text-sky-400" aria-hidden />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                Laurel Ingestor
              </h1>
              <p className="text-xs text-zinc-500">
                Dashboard local — validación E2E de idempotencia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refreshActivities()}
            disabled={isLoading}
            className="rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
          >
            Refrescar lista
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <ErrorBanner error={globalError} onDismiss={clearError} />

        {isLoading ? (
          <p className="text-sm text-zinc-500">Cargando actividades del servidor…</p>
        ) : null}

        <MetricsGrid
          sessionPersistedCount={sessionPersistedCount}
          sessionSkippedCount={sessionSkippedCount}
          lastLatencyMs={lastLatencyMs}
          serverRowCount={activities.length}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <InjectorForm />
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/40 p-5">
            <h2 className="text-sm font-semibold text-zinc-200">Log de red (sesión)</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Últimas peticiones con latencia; útil para correlacionar con el API.
            </p>
            <div className="mt-4">
              <RequestLogList />
            </div>
          </div>
        </div>

        <ActivityTable rows={activities} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  )
}
