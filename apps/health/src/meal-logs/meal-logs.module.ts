import { Module } from "@nestjs/common";
import { MealLogsService } from "./meal-logs.service";
import { MealLogsController } from "./meal-logs.controller";
import { MealLogsRepository } from "./meal-logs.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { FoodsModule } from "../foods/foods.module";

@Module({
  imports: [PrismaModule, FoodsModule],
  controllers: [MealLogsController],
  providers: [MealLogsService, MealLogsRepository],
  exports: [MealLogsService],
})
export class MealLogsModule {}
