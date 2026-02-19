import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException('API key not provided');
    }

    const authUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:56081',
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ valid: boolean; userId?: string }>(
          `${authUrl}/auth/validate-api-key`,
          { apiKey },
        ),
      );

      if (!response.data.valid || !response.data.userId) {
        throw new UnauthorizedException('Invalid API key');
      }

      (request as any).user = {
        userId: response.data.userId,
        email: '',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('API key validation failed');
    }
  }
}
