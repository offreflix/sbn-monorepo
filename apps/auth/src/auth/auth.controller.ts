import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ValidateTokenDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedUser } from './auth.types';
import {
  LoginResponseDto,
  TokenResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const result = await this.authService.login(user);

    // Return all tokens in body (needed for cross-origin with proxy)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados com sucesso', type: TokenResponseDto })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Body() body: RefreshTokenDto) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refresh(body.refreshToken);

    // Return all tokens in body (needed for cross-origin with proxy)
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(@Body() body: { refreshToken?: string }) {
    if (body.refreshToken) {
      await this.authService.logout(body.refreshToken);
    }

    return { success: true };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token JWT (uso interno do orchestrator)' })
  @ApiResponse({ status: 200, description: 'Token válido', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async validate(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
