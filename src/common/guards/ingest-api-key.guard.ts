import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

/** Header que debe enviar el cliente de ingesta (desktop / worker). */
export const INGEST_API_KEY_HEADER = 'x-api-key';

function headerValue(req: FastifyRequest, name: string): string | undefined {
  const raw = req.headers[name];
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) {
    return raw[0].trim();
  }
  return undefined;
}

/**
 * Exige el header `x-api-key`.
 * Si existe `INGEST_API_KEY` en el entorno, el valor del header debe coincidir (modo “no mockeado”).
 * Si no hay variable de entorno, basta con que el header sea no vacío (útil en dev / tests).
 */
@Injectable()
export class IngestApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const provided = headerValue(req, INGEST_API_KEY_HEADER);

    if (!provided) {
      throw new UnauthorizedException(
        `Missing required header: ${INGEST_API_KEY_HEADER}`,
      );
    }

    const expected = process.env['INGEST_API_KEY'];
    if (expected && provided !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
