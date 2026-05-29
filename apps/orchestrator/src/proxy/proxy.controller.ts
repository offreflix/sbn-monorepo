import { All, Body, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';
import { CompositeAuthGuard } from '../auth/composite-auth.guard';
import { JsonValue, HeadersDictionary } from '../common/types';
import type { AuthenticatedUser } from '../auth/auth.types';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Hop-by-hop headers (RFC 2616 §13.5.1) and internal trust headers that must
 * never be forwarded from an untrusted client to internal services.
 *
 * Hop-by-hop headers are meaningful only for a single transport link and must
 * not be re-transmitted by proxies.
 *
 * Internal trust headers (x-user-id, etc.) are set exclusively by the
 * orchestrator after validating the JWT; allowing clients to inject them
 * would enable identity spoofing.
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

@Controller('api')
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns a copy of the incoming headers with all unsafe entries removed:
   *  - hop-by-hop and internal trust headers (allowlist-based block)
   *  - any header whose value contains CR or LF (CRLF injection guard)
   */
  sanitizeClientHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): HeadersDictionary {
    const sanitized: HeadersDictionary = {};

    for (const [key, value] of Object.entries(headers)) {
      if (BLOCKED_CLIENT_HEADERS.has(key.toLowerCase())) {
        continue;
      }

      if (typeof value === 'string' && CRLF_PATTERN.test(value)) {
        continue;
      }

      if (Array.isArray(value) && value.some((v) => CRLF_PATTERN.test(v))) {
        continue;
      }

      sanitized[key] = value;
    }

    return sanitized;
  }

  @All('auth/*')
  async handleAuthRequest(
    @Req() req: Request,
    @Body() body: JsonValue | undefined,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const authUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:56081',
    );
    const url = `${authUrl}${req.originalUrl.replace('/api', '')}`;
    const headers = this.sanitizeClientHeaders(req.headers);
    return this.proxyService.forwardRequest(
      url,
      req.method,
      body,
      headers,
      (responseHeaders) => {
        const setCookie = responseHeaders['set-cookie'];
        if (setCookie && res) {
          res.setHeader('Set-Cookie', setCookie);
        }
      },
    );
  }

  @UseGuards(CompositeAuthGuard)
  @All('health/*')
  async handleHealthRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: JsonValue | undefined,
  ) {
    const healthUrl = this.configService.get<string>(
      'HEALTH_SERVICE_URL',
      'http://localhost:56083',
    );
    const url = `${healthUrl}${req.originalUrl.replace('/api/health', '')}`;
    const { user } = req;

    const { authorization: _auth, ...sanitized } = this.sanitizeClientHeaders(
      req.headers,
    );
    void _auth;

    const finalHeaders: HeadersDictionary = {
      ...sanitized,
      'x-user-id': user.userId,
    };

    return this.proxyService.forwardRequest(
      url,
      req.method,
      body,
      finalHeaders,
    );
  }

  @UseGuards(CompositeAuthGuard)
  @All('finance/*')
  async handleFinanceRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: JsonValue | undefined,
  ) {
    const financeUrl = this.configService.get<string>(
      'FINANCE_SERVICE_URL',
      'http://localhost:56082',
    );
    const url = `${financeUrl}${req.originalUrl.replace('/api/finance', '')}`;
    const { user } = req;

    // Sanitize client headers, then strip the raw JWT — the finance service
    // must rely solely on the x-user-id set by the orchestrator below.
    const { authorization: _auth, ...sanitized } = this.sanitizeClientHeaders(
      req.headers,
    );
    void _auth;

    const finalHeaders: HeadersDictionary = {
      ...sanitized,
      'x-user-id': user.userId,
    };

    const rawContentType = req.headers['content-type'];
    const contentType =
      typeof rawContentType === 'string'
        ? rawContentType.toLowerCase()
        : Array.isArray(rawContentType)
          ? String(rawContentType[0]).toLowerCase()
          : '';
    const isMultipart = contentType.startsWith('multipart/form-data');

    const data: AuthenticatedRequest | JsonValue | undefined = isMultipart
      ? req
      : body;

    return this.proxyService.forwardRequest(
      url,
      req.method,
      data,
      finalHeaders,
    );
  }
}
