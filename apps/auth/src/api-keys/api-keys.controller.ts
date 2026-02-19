import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('auth/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: AuthenticatedRequest) {
    return this.apiKeysService.listKeys(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revoke(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.apiKeysService.revokeKey(id, req.user.userId);
  }
}

@Controller('auth')
export class ValidateApiKeyController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('validate-api-key')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() body: { apiKey: string }) {
    return this.apiKeysService.validateKey(body.apiKey);
  }
}
