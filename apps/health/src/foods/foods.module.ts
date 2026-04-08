import { Module } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { FoodsRepository } from './foods.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FoodsController],
  providers: [FoodsService, FoodsRepository],
  exports: [FoodsService],
})
export class FoodsModule {}
