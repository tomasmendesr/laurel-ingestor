import type { Activity } from '../api/apiClient'

type Props = {
  rows: readonly Activity[]
}

export function ActivityTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-10 text-center text-sm text-zinc-500">
        No hay actividades en el servidor. Enviá un batch desde el simulador.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900/40">
      <div className="border-b border-zinc-700/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Historial (GET /activities)</h2>
        <p className="text-xs text-zinc-500">{rows.length} fila(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left boarder-collapse"> {/* min-w-[640px] text-sm text-zinc-200">*/}
          <thead>
            <tr className="border-b border-zinc-700/60 bg-zinc-950/50 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-2 font-medium">activityId</th>
              <th className="px-4 py-2 font-medium">userId</th>
              <th className="px-4 py-2 font-medium">task</th>
              <th className="px-4 py-2 font-medium tabular-nums">duration</th>
              <th className="px-4 py-2 font-medium">startTime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.activityId} className="hover:bg-zinc-800/50">
                <td className="max-w-[180px] truncate px-4 py-2 font-mono text-xs text-zinc-300">
                  {row.activityId}
                </td>
                <td className="px-4 py-2 text-zinc-200">{row.userId}</td>
                <td className="px-4 py-2 text-zinc-400">{row.task}</td>
                <td className="px-4 py-2 tabular-nums text-zinc-400">{row.duration}</td>
                <td className="px-4 py-2 font-mono text-xs text-zinc-500">
                  {row.startTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
