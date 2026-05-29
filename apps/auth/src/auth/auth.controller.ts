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
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
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

const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';
const REFRESH_COOKIE_PATH = process.env.REFRESH_COOKIE_PATH ?? '/api/auth';
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 * 1000;

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
  });
}

function getRefreshToken(req: Request, body?: { refreshToken?: string }) {
  return req.cookies?.[REFRESH_COOKIE_NAME] ?? body?.refreshToken;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const result = await this.authService.login(user);
    setRefreshCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(
    @Req() req: Request,
    @Body() body: Partial<RefreshTokenDto> = {},
    @Res({ passthrough: true })
    res: Response,
  ) {
    const refreshToken = getRefreshToken(req, body);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refresh(refreshToken);
    setRefreshCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(
    @Req() req: Request,
    @Body() body: { refreshToken?: string } = {},
    @Res({ passthrough: true })
    res: Response,
  ) {
    const refreshToken = getRefreshToken(req, body);
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    clearRefreshCookie(res);

    return { success: true };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar token JWT (uso interno do orchestrator)' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async validate(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
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
