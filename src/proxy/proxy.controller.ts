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
    return this.proxyService.forwardRequest(url, req.method, body, req.headers);
  }

  @UseGuards(JwtAuthGuard)
  @All('finance/*')
  async handleFinanceRequest(@Req() req: Request, @Body() body: any) {
    const url = `http://localhost:3002${req.originalUrl.replace('/api', '')}`;
    // Inject User ID into headers
    const user = (req as any).user;
    const headers = {
      ...req.headers,
      'x-user-id': user.userId,
    };

    return this.proxyService.forwardRequest(url, req.method, body, headers);
  }
}
