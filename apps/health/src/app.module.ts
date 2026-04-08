import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { GoalsModule } from './goals/goals.module';
import { FoodsModule } from './foods/foods.module';
import { MealLogsModule } from './meal-logs/meal-logs.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { WaterLogsModule } from './water-logs/water-logs.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    GoalsModule,
    FoodsModule,
    MealLogsModule,
    MeasurementsModule,
    WaterLogsModule,
    SummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
