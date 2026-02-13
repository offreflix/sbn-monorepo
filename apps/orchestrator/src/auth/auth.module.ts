import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { CompositeAuthGuard } from './composite-auth.guard';

@Module({
  imports: [PassportModule, HttpModule],
  providers: [JwtStrategy, JwtAuthGuard, ApiKeyGuard, CompositeAuthGuard],
  exports: [PassportModule, JwtAuthGuard, ApiKeyGuard, CompositeAuthGuard],
})
export class AuthModule {}
