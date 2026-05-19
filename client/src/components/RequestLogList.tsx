import { useDashboard } from '../context/DashboardContext'

export function RequestLogList() {
  const { requestLogs } = useDashboard()
  if (requestLogs.length === 0) {
    return (
      <p className="text-xs text-zinc-500">Aún no hay peticiones registradas en esta sesión.</p>
    )
  }
  return (
    <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
      {requestLogs.map((log) => (
        <li
          key={log.id}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded border border-zinc-800/80 bg-zinc-950/60 px-2 py-1.5 font-mono text-zinc-400"
        >
          <span className={log.ok ? 'text-emerald-400' : 'text-red-400'}>
            {log.ok ? 'OK' : 'ERR'}
          </span>
          <span className="text-zinc-500">{log.method}</span>
          <span>{log.path}</span>
          <span className="text-zinc-500">{log.latencyMs}ms</span>
          <span className="min-w-0 flex-1 truncate text-zinc-500" title={log.summary}>
            {log.summary}
          </span>
        </li>
      ))}
    </ul>
  )
}
