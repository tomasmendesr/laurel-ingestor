import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Catch() // Atrapa todos los errores
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { error, clientMessage } = this.normalizeExceptionPayload(exception);
    const requestId = request.requestId ?? 'unknown';

    this.logger.error(
      `[${requestId}] Status: ${status} Error: ${JSON.stringify(clientMessage)} Path: ${request.url}`,
    );

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      error,
      message: clientMessage,
    });
  }

  private normalizeExceptionPayload(exception: unknown): {
    error: string;
    clientMessage: string | string[];
  } {
    if (!(exception instanceof HttpException)) {
      return { error: 'Error', clientMessage: 'Internal server error' };
    }

    const body = exception.getResponse();
    if (typeof body === 'string') {
      return { error: 'Error', clientMessage: body };
    }

    const record = body as Record<string, unknown>;
    const error = typeof record['error'] === 'string' ? record['error'] : 'Error';
    const msg = record['message'];
    const clientMessage =
      typeof msg === 'string' || Array.isArray(msg) ? msg : JSON.stringify(body);

    return { error, clientMessage };
  }
}
