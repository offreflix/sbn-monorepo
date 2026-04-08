-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "health";

-- CreateEnum
CREATE TYPE "health"."MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateTable
CREATE TABLE "health"."goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "daily_calorie_goal" INTEGER NOT NULL DEFAULT 2000,
    "protein_goal_g" INTEGER NOT NULL,
    "carbs_goal_g" INTEGER NOT NULL,
    "fat_goal_g" INTEGER NOT NULL,
    "water_goal_ml" INTEGER NOT NULL DEFAULT 2000,
    "active_from" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health"."foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "serving_size_value" DECIMAL(8,2) NOT NULL,
    "serving_size_unit" TEXT NOT NULL,
    "calories_per_serving" INTEGER NOT NULL,
    "protein_per_serving" DECIMAL(6,2),
    "carbs_per_serving" DECIMAL(6,2),
    "fat_per_serving" DECIMAL(6,2),
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health"."meal_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "food_id" TEXT,
    "meal_type" "health"."MealType" NOT NULL,
    "logged_at_date" DATE NOT NULL,
    "amount_consumed" DECIMAL(8,2) NOT NULL,
    "unit_consumed" TEXT NOT NULL,
    "calc_calories" INTEGER NOT NULL,
    "calc_protein" DECIMAL(6,2),
    "calc_carbs" DECIMAL(6,2),
    "calc_fat" DECIMAL(6,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health"."user_measurements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "measured_at" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health"."water_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "volume_ml" INTEGER NOT NULL,
    "logged_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "goals_user_id_active_from_key" ON "health"."goals"("user_id", "active_from");

-- CreateIndex
CREATE INDEX "meal_logs_user_id_logged_at_date_idx" ON "health"."meal_logs"("user_id", "logged_at_date");

-- CreateIndex
CREATE INDEX "user_measurements_user_id_measured_at_idx" ON "health"."user_measurements"("user_id", "measured_at");

-- CreateIndex
CREATE INDEX "water_logs_user_id_logged_date_idx" ON "health"."water_logs"("user_id", "logged_date");

-- AddForeignKey
ALTER TABLE "health"."meal_logs" ADD CONSTRAINT "meal_logs_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "health"."foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
