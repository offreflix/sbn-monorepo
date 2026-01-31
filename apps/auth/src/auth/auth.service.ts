import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/auth.dto';

export type UserWithoutPassword = Omit<User, 'password_hash'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserWithoutPassword) {
    const payload = { email: user.email, sub: user.id };
    const refreshToken = uuidv4();
    // Store refresh token with 7 days expiration
    await this.redis.set(
      `refreshToken:${refreshToken}`,
      user.id,
      'EX',
      60 * 60 * 24 * 7,
    );

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refreshToken, // Will be sent as cookie, but still returned for internal use
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refresh(refreshToken: string) {
    const userId = await this.redis.get(`refreshToken:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { email: user.email, sub: user.id };

    // Rotate refresh token
    const newRefreshToken = uuidv4();

    // Delete old token
    await this.redis.del(`refreshToken:${refreshToken}`);

    // Store new token
    await this.redis.set(
      `refreshToken:${newRefreshToken}`,
      user.id,
      'EX',
      60 * 60 * 24 * 7,
    );

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.redis.del(`refreshToken:${refreshToken}`);
    return { success: true };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      void e;
      throw new UnauthorizedException();
    }
  }

  async register(data: RegisterDto): Promise<UserWithoutPassword> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        name: data.name,
      },
    });
    const { password_hash, ...result } = user;
    return result;
  }

  async getCurrentUser(userId: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password_hash, ...result } = user;
    return result;
  }
}
