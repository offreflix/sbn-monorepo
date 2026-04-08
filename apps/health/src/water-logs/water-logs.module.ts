import { Module } from '@nestjs/common';
import { WaterLogsService } from './water-logs.service';
import { WaterLogsController } from './water-logs.controller';
import { WaterLogsRepository } from './water-logs.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaterLogsController],
  providers: [WaterLogsService, WaterLogsRepository],
  exports: [WaterLogsService],
})
export class WaterLogsModule {}
