import { All, Body, Controller, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { Request } from 'express';
import { CompositeAuthGuard } from '../auth/composite-auth.guard';
import { JsonValue } from '../common/types';
import type { AuthenticatedUser } from '../auth/auth.types';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('api')
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('auth/*')
  async handleAuthRequest(
    @Req() req: Request,
    @Body() body: JsonValue | undefined,
  ) {
    const authUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:56081',
    );
    const url = `${authUrl}${req.originalUrl.replace('/api', '')}`;
    console.log(`[Proxy] Forwarding auth request to: ${url}`);

    // Remove host and content-length headers to avoid conflicts
    const { host, 'content-length': contentLength, ...headers } = req.headers;
    void host;
    void contentLength;

    return this.proxyService.forwardRequest(url, req.method, body, headers);
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
    // Inject User ID into headers
    const { user } = req;
    const { host, 'content-length': contentLength, ...headers } = req.headers;
    void host;
    void contentLength;

    const finalHeaders = {
      ...headers,
      'x-user-id': user.userId,
    };

    return this.proxyService.forwardRequest(
      url,
      req.method,
      body,
      finalHeaders,
    );
  }
}
