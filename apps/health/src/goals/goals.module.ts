import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { GoalsRepository } from './goals.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [GoalsService, GoalsRepository],
  exports: [GoalsService],
})
export class GoalsModule {}
