/**
 * Capa de red única: evita repetir base URL y headers en cada componente.
 * Si mañana cambia el contrato (auth, tracing), tocás acá una vez.
 */

/** Igual que `CreateActivityDto` en Nest (ingesta / listado). */
export interface Activity {
  readonly activityId: string
  readonly userId: string
  readonly task: string
  readonly duration: number
  readonly startTime: string
}

/** Respuesta del POST /activities (idempotencia como éxito parcial). */
export interface IngestBatchResult {
  readonly totalReceived: number
  readonly persistedIds: string[]
  readonly skippedDuplicateIds: string[]
}

/** Cuerpo JSON de errores del `AllExceptionsFilter` del API. */
export interface ApiErrorBody {
  readonly statusCode: number
  readonly timestamp?: string
  readonly path?: string
  readonly requestId?: string
  readonly error?: string
  readonly message: string | string[]
}

export class ApiClientError extends Error {
  readonly status: number
  readonly body?: ApiErrorBody

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

/** Base del API: en prod suele venir de Vite (`import.meta.env.VITE_*`). */
const baseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

/**
 * Debe coincidir con `INGEST_API_KEY` en el `.env` del API si está definida.
 * Si el backend no define esa variable, cualquier valor no vacío alcanza (modo dev).
 */
const apiKey = import.meta.env.VITE_INGEST_API_KEY ?? 'dev-local-key'

function requestId(): string {
  return crypto.randomUUID()
}

function joinPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

export function formatApiMessage(
  body: ApiErrorBody | undefined,
  fallback: string,
): string {
  if (body?.message === undefined) return fallback
  return Array.isArray(body.message)
    ? body.message.join('; ')
    : body.message
}

/**
 * fetch centralizado: inyecta siempre `x-api-key` y `x-request-id`
 * (el backend usa el request id en logs y en respuestas de error).
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { requestId?: string } = {},
): Promise<T> {
  const url = `${baseUrl}${joinPath(path)}`
  const { requestId: ridOpt, headers: initHeaders, ...rest } = init
  const headers = new Headers(initHeaders)

  headers.set('x-api-key', apiKey)
  const fromHeader = headers.get('x-request-id')?.trim()
  headers.set('x-request-id', ridOpt ?? fromHeader ?? requestId())

  if (
    rest.body !== undefined &&
    !headers.has('Content-Type') &&
    !(rest.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, { ...rest, headers })
  } catch {
    // fetch rejected = red, CORS, DNS, etc. (no siempre hay `response`).
    throw new ApiClientError(
      'No se pudo contactar al API (¿CORS, red o URL?).',
      0,
    )
  }

  const text = await response.text()
  const parseJson = (): unknown => {
    if (!text) return null
    return JSON.parse(text) as unknown
  }

  if (!response.ok) {
    let errBody: ApiErrorBody | undefined
    try {
      const raw = parseJson()
      if (raw && typeof raw === 'object' && 'statusCode' in raw) {
        errBody = raw as ApiErrorBody
      }
    } catch {
      errBody = undefined
    }
    const msg = formatApiMessage(
      errBody,
      response.statusText || `HTTP ${response.status}`,
    )
    throw new ApiClientError(msg, response.status, errBody)
  }

  if (!text) return undefined as T
  return parseJson() as T
}

/** Lista actividades persistidas (fuente de verdad del servidor). */
export async function getActivities(): Promise<Activity[]> {
  const data = await apiFetch<unknown>('/activities')
  return Array.isArray(data) ? (data as Activity[]) : []
}

/** Envía un lote; revisá `skippedDuplicateIds` para idempotencia. */
export async function postIngestBatch(body: {
  activities: readonly Activity[]
}): Promise<IngestBatchResult> {
  return apiFetch<IngestBatchResult>('/activities', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
