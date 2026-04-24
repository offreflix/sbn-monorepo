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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from './dto/api-key-response.dto';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('auth/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar nova API key' })
  @ApiResponse({
    status: 201,
    description: 'API key criada com sucesso',
    type: CreateApiKeyResponseDto,
  })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar API keys do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de API keys',
    type: [ApiKeyResponseDto],
  })
  async list(@Req() req: AuthenticatedRequest) {
    return this.apiKeysService.listKeys(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revogar API key' })
  @ApiParam({ name: 'id', description: 'ID da API key' })
  @ApiResponse({ status: 200, description: 'API key revogada' })
  @ApiResponse({ status: 404, description: 'API key não encontrada' })
  async revoke(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.apiKeysService.revokeKey(id, req.user.userId);
  }
}

@ApiTags('Auth')
@Controller('auth')
export class ValidateApiKeyController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('validate-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar API key (uso interno do orchestrator)' })
  @ApiResponse({
    status: 200,
    description: 'API key válida',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'API key inválida ou expirada' })
  async validate(@Body() body: { apiKey: string }) {
    return this.apiKeysService.validateKey(body.apiKey);
  }
}
