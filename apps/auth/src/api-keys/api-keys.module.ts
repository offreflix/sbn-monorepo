import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import {
  ApiKeysController,
  ValidateApiKeyController,
} from './api-keys.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeysController, ValidateApiKeyController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
