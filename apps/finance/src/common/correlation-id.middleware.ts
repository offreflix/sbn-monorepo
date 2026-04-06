import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that ensures every request has a correlation-id.
 * Generates one if not provided by the orchestrator (for direct calls during dev/testing).
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (!req.headers['x-correlation-id']) {
      req.headers['x-correlation-id'] = randomUUID();
    }
    next();
  }
}
