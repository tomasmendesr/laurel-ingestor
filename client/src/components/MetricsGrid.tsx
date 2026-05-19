import { Clock, Copy, Database } from 'lucide-react'

type Props = {
  sessionPersistedCount: number
  sessionSkippedCount: number
  lastLatencyMs: number | null
  serverRowCount: number
}

export function MetricsGrid({
  sessionPersistedCount,
  sessionSkippedCount,
  lastLatencyMs,
  serverRowCount,
}: Props) {
  const cards = [
    {
      label: 'Éxitos (sesión)',
      sub: 'Suma de IDs persistidos por POST',
      value: String(sessionPersistedCount),
      icon: Database,
      accent: 'text-emerald-400',
    },
    {
      label: 'Duplicados omitidos (sesión)',
      sub: 'Suma de skippedDuplicateIds por POST',
      value: String(sessionSkippedCount),
      icon: Copy,
      accent: 'text-violet-400',
    },
    {
      label: 'Última latencia',
      sub: 'Último GET o POST',
      value: lastLatencyMs === null ? '—' : `${lastLatencyMs} ms`,
      icon: Clock,
      accent: 'text-sky-400',
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map(({ label, sub, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-700/80 bg-zinc-900/40 p-4 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">
                {value}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{sub}</p>
            </div>
            <Icon className={`size-8 shrink-0 opacity-90 ${accent}`} aria-hidden />
          </div>
        </div>
      ))}
      <p className="sm:col-span-3 text-center text-xs text-zinc-500">
        Actividades en servidor (GET):{' '}
        <span className="font-mono text-zinc-300">{serverRowCount}</span>
      </p>
    </div>
  )
}
