import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

export const REQUEST_ID_HEADER = 'x-request-id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

type HeaderWritableResponse = {
  setHeader?: (name: string, value: string) => void;
  header?: (name: string, value: string) => unknown;
};

function firstHeaderValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim();
  }
  return undefined;
}

/** Respuesta en middleware Nest+Fastify (middie): suele ser Node ServerResponse, no FastifyReply. */
function setRequestIdHeader(res: HeaderWritableResponse, requestId: string): void {
  if (typeof res.setHeader === 'function') {
    res.setHeader(REQUEST_ID_HEADER, requestId);
  } else if (typeof res.header === 'function') {
    res.header(REQUEST_ID_HEADER, requestId);
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: unknown, next: () => void) {
    const fromClient =
      firstHeaderValue(req.headers[REQUEST_ID_HEADER]) ??
      firstHeaderValue(req.headers[CORRELATION_ID_HEADER]);
    const requestId = fromClient ?? randomUUID();
    req.requestId = requestId;
    setRequestIdHeader(res as HeaderWritableResponse, requestId);
    next();
  }
}
