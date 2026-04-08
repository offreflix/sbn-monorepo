## Why

O SBN não possui um mecanismo de controle de saúde e nutrição. Usuários precisam de um serviço dedicado para registrar refeições, monitorar ingestão de calorias e macronutrientes, acompanhar hidratação e peso corporal, e comparar esses dados com metas diárias configuráveis.

## What Changes

- Novo microserviço NestJS `@sbn/health` na porta 56083, seguindo a mesma arquitetura do `@sbn/finance`
- Novo schema Prisma `health` no PostgreSQL existente, com client `@prisma/client-health`
- 5 módulos de domínio: `goals`, `foods`, `meal-logs`, `measurements`, `water-logs`
- 1 módulo de agregação: `summary` (dashboard diário)
- Rota `/health/*` adicionada ao Orchestrator para proxy autenticado
- Serviço adicionado ao `docker-compose.yml` com porta 56083
- Variável `HEALTH_SERVICE_URL` adicionada ao `turbo.json` e `.env.example`

## Capabilities

### New Capabilities

- `health-goals`: CRUD de metas diárias de calorias, macros e água. Suporta histórico por data (`active_from`), com lógica de goal ativo = mais recente com `active_from <= hoje`.
- `health-foods`: Biblioteca de alimentos com suporte a alimentos públicos (user_id = NULL) e custom por usuário. Busca por nome. Apenas o criador pode editar/deletar alimentos custom.
- `health-meal-logs`: Registro de refeições com cálculo de snapshot nutricional no momento do log (`calc_calories = caloriesPerServing * amountConsumed / servingSizeValue`). Agrupamento por tipo de refeição (breakfast, lunch, dinner, snack).
- `health-measurements`: Registro de peso corporal por data para acompanhamento de progresso e geração de gráficos.
- `health-water-logs`: Registro de consumo de água por data com total diário.
- `health-summary`: Endpoint de agregação diária que consolida goal ativo, totais consumidos de calorias/macros, progresso de água e refeições agrupadas.

### Modified Capabilities

- `orchestrator-proxy`: Adicionar rota `/health/*` ao proxy existente do Orchestrator.

## Impact

- **Novo serviço**: `apps/health/` — NestJS completo com Prisma, sem BullMQ
- **Banco de dados**: Novo schema `health` no PostgreSQL existente (sem novo banco)
- **Orchestrator**: `apps/orchestrator/src/proxy/proxy.controller.ts` recebe nova rota
- **Infra**: `docker-compose.yml`, `turbo.json`, `.env.example`, `package.json` (root) atualizados
- **Sem breaking changes** nos serviços existentes
