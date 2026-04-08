## 1. Scaffold do microserviço

- [x] 1.1 Criar `apps/health/package.json` com name `@sbn/health`, porta 56083, scripts idênticos ao finance
- [x] 1.2 Criar `apps/health/tsconfig.json`, `tsconfig.build.json` e `nest-cli.json` (copiar do finance)
- [x] 1.3 Criar `apps/health/src/main.ts` (porta 56083, ValidationPipe global)
- [x] 1.4 Criar `apps/health/src/app.controller.ts` e `app.service.ts` (boilerplate padrão)
- [x] 1.5 Copiar `apps/finance/src/common/` para `apps/health/src/common/` (correlation-id middleware)
- [x] 1.6 Copiar `apps/finance/src/prisma/` para `apps/health/src/prisma/` e trocar import para `@prisma/client-health`

## 2. Prisma Schema

- [x] 2.1 Criar `apps/health/prisma/schema.prisma` com generator apontando para `@prisma/client-health`, schema `health`, e todos os modelos (Goal, Food, MealLog, UserMeasurement, WaterLog) com enum MealType
- [x] 2.2 Rodar `pnpm install` na raiz do monorepo para linkar `@sbn/health` como workspace package
- [x] 2.3 Rodar `pnpm prisma:generate` dentro de `apps/health` para gerar o Prisma client
- [x] 2.4 Criar migration inicial: `prisma migrate dev --name init` dentro de `apps/health`

## 3. Módulo Goals

- [x] 3.1 Criar `src/goals/dto/create-goal.dto.ts` (dailyCalorieGoal, proteinGoalG, carbsGoalG, fatGoalG, waterGoalMl, activeFrom com class-validator)
- [x] 3.2 Criar `src/goals/dto/update-goal.dto.ts` (PartialType de CreateGoalDto)
- [x] 3.3 Criar `src/goals/goals.repository.ts` (findById, findAllByUser, findCurrent)
- [x] 3.4 Criar `src/goals/goals.service.ts` (create, findAll, findCurrent, update, remove com ownership check)
- [x] 3.5 Criar `src/goals/goals.controller.ts` (POST /goals, GET /goals, GET /goals/current, PATCH /goals/:id, DELETE /goals/:id com x-user-id)
- [x] 3.6 Criar `src/goals/goals.module.ts`
- [x] 3.7 Escrever `goals.service.spec.ts` (mock PrismaService, testar create, findAll, findCurrent, update, remove)
- [x] 3.8 Escrever `goals.controller.spec.ts` (mock GoalsService, testar happy path + missing userId → 400)

## 4. Módulo Foods

- [x] 4.1 Criar `src/foods/dto/create-food.dto.ts` (name, brand?, servingSizeValue, servingSizeUnit, caloriesPerServing, macros opcionais)
- [x] 4.2 Criar `src/foods/dto/update-food.dto.ts` (PartialType)
- [x] 4.3 Criar `src/foods/foods.repository.ts` (findById, findAllVisible, findCustomByUser)
- [x] 4.4 Criar `src/foods/foods.service.ts` (create com isCustom=true, findAll com search e filtro público+custom, findOne, update só custom do próprio user, remove só custom do próprio user)
- [x] 4.5 Criar `src/foods/foods.controller.ts` (POST /foods, GET /foods?search=, GET /foods/:id, PATCH /foods/:id, DELETE /foods/:id)
- [x] 4.6 Criar `src/foods/foods.module.ts`
- [x] 4.7 Escrever `foods.service.spec.ts`
- [x] 4.8 Escrever `foods.controller.spec.ts`

## 5. Módulo Meal Logs

- [x] 5.1 Criar `src/meal-logs/dto/create-meal-log.dto.ts` (foodId, mealType enum, loggedAtDate, amountConsumed, unitConsumed)
- [x] 5.2 Criar `src/meal-logs/meal-logs.repository.ts` (create, findByDateAndUser, findById, remove)
- [x] 5.3 Criar `src/meal-logs/meal-logs.service.ts` (create com cálculo de snapshot, findByDate retornando agrupado por mealType, remove com ownership check)
- [x] 5.4 Criar `src/meal-logs/meal-logs.controller.ts` (POST /meal-logs, GET /meal-logs?date=, DELETE /meal-logs/:id)
- [x] 5.5 Criar `src/meal-logs/meal-logs.module.ts` (importar FoodsModule para acesso ao FoodsService)
- [x] 5.6 Escrever `meal-logs.service.spec.ts` (testar cálculo de snapshot, agrupamento por mealType)
- [x] 5.7 Escrever `meal-logs.controller.spec.ts`

## 6. Módulo Measurements

- [x] 6.1 Criar `src/measurements/dto/create-measurement.dto.ts` (weightKg, measuredAt)
- [x] 6.2 Criar `src/measurements/measurements.repository.ts`
- [x] 6.3 Criar `src/measurements/measurements.service.ts` (create, findByDateRange, remove com ownership check)
- [x] 6.4 Criar `src/measurements/measurements.controller.ts` (POST /measurements, GET /measurements?startDate=&endDate=, DELETE /measurements/:id)
- [x] 6.5 Criar `src/measurements/measurements.module.ts`
- [x] 6.6 Escrever `measurements.service.spec.ts`
- [x] 6.7 Escrever `measurements.controller.spec.ts`

## 7. Módulo Water Logs

- [x] 7.1 Criar `src/water-logs/dto/create-water-log.dto.ts` (volumeMl com @Min(1), loggedDate)
- [x] 7.2 Criar `src/water-logs/water-logs.repository.ts`
- [x] 7.3 Criar `src/water-logs/water-logs.service.ts` (create, findByDate retornando {entries, totalMl}, remove com ownership check)
- [x] 7.4 Criar `src/water-logs/water-logs.controller.ts` (POST /water-logs, GET /water-logs?date=, DELETE /water-logs/:id)
- [x] 7.5 Criar `src/water-logs/water-logs.module.ts`
- [x] 7.6 Escrever `water-logs.service.spec.ts`
- [x] 7.7 Escrever `water-logs.controller.spec.ts`

## 8. Módulo Summary

- [x] 8.1 Criar `src/summary/summary.service.ts` (injetar GoalsService, MealLogsService, WaterLogsService; agregar em único objeto por data)
- [x] 8.2 Criar `src/summary/summary.controller.ts` (GET /summary?date=)
- [x] 8.3 Criar `src/summary/summary.module.ts` (importar GoalsModule, MealLogsModule, WaterLogsModule)
- [x] 8.4 Escrever `summary.service.spec.ts` (mock dos 3 serviços, testar sem goal, com goal, sem dados)
- [x] 8.5 Escrever `summary.controller.spec.ts`

## 9. App Module e finalização do serviço

- [x] 9.1 Criar `apps/health/src/app.module.ts` importando todos os módulos de domínio (CommonModule, PrismaModule, GoalsModule, FoodsModule, MealLogsModule, MeasurementsModule, WaterLogsModule, SummaryModule)
- [x] 9.2 Criar `apps/health/Dockerfile` (copiar do finance, substituir porta e package name)
- [x] 9.3 Rodar `pnpm test` dentro de `apps/health` e corrigir eventuais erros

## 10. Integração no monorepo

- [x] 10.1 Adicionar serviço `sbn-health` ao `docker-compose.yml` (porta 56083, DATABASE_URL, perfis backend/all)
- [x] 10.2 Adicionar `HEALTH_SERVICE_URL` ao array `globalEnv` do `turbo.json`
- [x] 10.3 Adicionar `HEALTH_SERVICE_URL=http://localhost:56083` ao `.env.example`
- [x] 10.4 Adicionar `--filter=@sbn/health` ao script `dev:backend` no `package.json` raiz
- [x] 10.5 Adicionar handler `@All('health/*')` em `apps/orchestrator/src/proxy/proxy.controller.ts` para proxear para HEALTH_SERVICE_URL
