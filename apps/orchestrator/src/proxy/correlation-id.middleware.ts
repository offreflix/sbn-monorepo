import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that generates a correlation-id for each incoming request and
 * attaches it to the request headers so it is forwarded to downstream
 * services via the proxy controller.
 *
 * If the client already sent an x-correlation-id header, it is preserved.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId = req.headers['x-correlation-id'] ?? randomUUID();
    req.headers['x-correlation-id'] = correlationId as string;
    next();
  }
}
