import { AlertTriangle, X } from 'lucide-react'
import type { DashboardError } from '../context/DashboardContext'

type Props = {
  error: DashboardError | null
  onDismiss: () => void
}

export function ErrorBanner({ error, onDismiss }: Props) {
  if (!error) return null

  const isValidation =
    error.status === 400 || error.message.toLowerCase().includes('validation')

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-amber-100"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-amber-50">
          {error.status === 0
            ? 'Red / CORS / API caído'
            : isValidation
              ? 'Validación (400)'
              : `Error HTTP ${error.status}`}
        </p>
        <p className="mt-1 break-words text-amber-100/90">{error.message}</p>
        {error.requestId ? (
          <p className="mt-1 font-mono text-xs text-amber-200/70">
            requestId: {error.requestId}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-1 text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-50"
        aria-label="Cerrar"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
