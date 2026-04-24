import { Module } from "@nestjs/common";
import { SummaryService } from "./summary.service";
import { SummaryController } from "./summary.controller";
import { GoalsModule } from "../goals/goals.module";
import { MealLogsModule } from "../meal-logs/meal-logs.module";
import { WaterLogsModule } from "../water-logs/water-logs.module";

@Module({
  imports: [GoalsModule, MealLogsModule, WaterLogsModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
