import {
  All,
  Controller,
  Req,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  private readonly SERVICES = {
    auth: 'http://localhost:3001',
    finance: 'http://localhost:3002',
  };

  @All('auth/*')
  async handleAuthRequest(@Req() req: Request, @Body() body: any) {
    const url = `http://localhost:3001${req.originalUrl.replace('/api', '')}`;
    console.log(`[Proxy] Forwarding auth request to: ${url}`);

    // Remove host and content-length headers to avoid conflicts
    const { host, 'content-length': contentLength, ...headers } = req.headers;

    return this.proxyService.forwardRequest(url, req.method, body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @All('finance/*')
  async handleFinanceRequest(@Req() req: Request, @Body() body: any) {
    const url = `http://localhost:3002${req.originalUrl.replace('/api', '')}`;
    // Inject User ID into headers
    const user = (req as any).user;
    const { host, 'content-length': contentLength, ...headers } = req.headers;

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
