import { Module } from '@nestjs/common';
import { RecurrencesService } from './recurrences.service';
import { RecurrencesController } from './recurrences.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecurrencesService],
  controllers: [RecurrencesController],
})
export class RecurrencesModule {}
