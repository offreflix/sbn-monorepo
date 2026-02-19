import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Hop-by-hop headers (RFC 2616 §13.5.1) and internal trust headers that must
 * never be forwarded from an untrusted client to internal services.
 */
const BLOCKED_CLIENT_HEADERS = new Set([
  'host',
  'content-length',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'x-user-id',
  'x-forwarded-for',
]);

/** Detects CR or LF characters used in CRLF/header-injection attacks. */
const CRLF_PATTERN = /[\r\n]/;

/**
 * Middleware that sanitizes incoming request headers before they reach any
 * proxy route handler. Removes hop-by-hop headers, internal trust headers,
 * and any header whose value contains CRLF sequences.
 *
 * This acts as a defence-in-depth layer: even if a route handler forgets to
 * call sanitizeClientHeaders, unsafe headers are already stripped here.
 */
@Injectable()
export class HeaderSanitizationMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    for (const key of Object.keys(req.headers)) {
      if (BLOCKED_CLIENT_HEADERS.has(key.toLowerCase())) {
        delete req.headers[key];
        continue;
      }

      const value = req.headers[key];

      if (typeof value === 'string' && CRLF_PATTERN.test(value)) {
        delete req.headers[key];
        continue;
      }

      if (Array.isArray(value) && value.some((v) => CRLF_PATTERN.test(v))) {
        delete req.headers[key];
      }
    }

    next();
  }
}
