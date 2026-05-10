import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { INGEST_API_KEY_HEADER, IngestApiKeyGuard } from './ingest-api-key.guard';

function createExecutionContext(
  headers: FastifyRequest['headers'],
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: (): FastifyRequest => ({ headers }) as FastifyRequest,
    }),
  } as ExecutionContext;
}

describe('IngestApiKeyGuard', () => {
  let guard: IngestApiKeyGuard;

  beforeEach(() => {
    guard = new IngestApiKeyGuard();
    delete process.env['INGEST_API_KEY'];
  });

  afterEach(() => {
    delete process.env['INGEST_API_KEY'];
  });

  it('lanza UnauthorizedException si falta x-api-key', () => {
    const ctx = createExecutionContext({});

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(ctx)).toThrow(
      `Missing required header: ${INGEST_API_KEY_HEADER}`,
    );
  });

  it('permite el request si x-api-key está presente y no hay INGEST_API_KEY en env', () => {
    const ctx = createExecutionContext({
      [INGEST_API_KEY_HEADER]: 'clave-de-prueba',
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
