import { Loader2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDashboard } from '../context/DashboardContext'

/**
 * Estado local del formulario (userId, switch, loading): evita re-renderizar
 * métricas/tabla en cada tecla; solo este subtree se actualiza al escribir.
 */
export function InjectorForm() {
  const { ingestOne } = useDashboard()
  const [userId, setUserId] = useState('')
  const [forceDuplicate, setForceDuplicate] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await ingestOne({ userId, forceDuplicate })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-700/80 bg-zinc-900/40 p-5"
    >
      <h2 className="text-sm font-semibold text-zinc-200">Simulador de ingesta</h2>
      <p className="mt-1 text-xs text-zinc-500">
        POST /activities con un ítem. &quot;Forzar duplicados&quot; reutiliza un{' '}
        <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-zinc-300">
          activityId
        </code>{' '}
        fijo para exercitar idempotencia.
      </p>

      <label className="mt-4 block text-xs font-medium text-zinc-400">
        userId
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ej. user-123"
          className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </label>

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={forceDuplicate}
          onChange={(e) => setForceDuplicate(e.target.checked)}
          className="size-4 rounded border-zinc-500 bg-zinc-950 text-sky-500 focus:ring-sky-500"
        />
        Forzar duplicados (mismo activityId demo)
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {loading ? 'Enviando…' : 'Enviar batch'}
      </button>
    </form>
  )
}
