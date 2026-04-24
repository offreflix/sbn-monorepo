import { Module } from "@nestjs/common";
import { MeasurementsService } from "./measurements.service";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsRepository } from "./measurements.repository";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementsRepository],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
