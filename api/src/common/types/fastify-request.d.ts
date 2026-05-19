import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    /** Asignado por RequestIdMiddleware (cliente o UUID). */
    requestId?: string;
  }
}
