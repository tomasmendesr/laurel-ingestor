/**
 * Resultado explícito de ingesta por lotes: idempotencia como éxito parcial,
 * no como error global (patrón habitual en APIs de telemetría / billing).
 */
export interface IngestBatchResult {
  readonly totalReceived: number;
  /** IDs persistidos en este request (orden no garantizado). */
  readonly persistedIds: string[];
  /** Duplicados: ya en almacén o repetidos dentro del mismo batch. */
  readonly skippedDuplicateIds: string[];
}
