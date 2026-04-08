## Context

O SBN já possui dois microserviços de domínio (`auth`, `finance`) e um gateway (`orchestrator`). Todos seguem o mesmo padrão: NestJS 10, Prisma 5 com multi-schema PostgreSQL, autenticação delegada ao Orchestrator via header `x-user-id`, e módulos organizados em controller → service → repository.

O `finance` é a referência canônica de arquitetura. O `health` será estruturalmente idêntico ao `finance`, sem desvios de padrão.

## Goals / Non-Goals

**Goals:**
- Criar `apps/health` seguindo 100% o padrão do `finance` (sem inovações arquiteturais)
- Schema Prisma isolado no schema `health` do PostgreSQL existente
- 6 módulos de domínio: goals, foods, meal-logs, measurements, water-logs, summary
- Integração via Orchestrator com rota `/health/*`
- Sem frontend nesta fase

**Non-Goals:**
- Frontend / MFE
- Notificações ou jobs recorrentes (sem BullMQ)
- Integração com APIs externas de tabela nutricional (TACO, USDA)
- Autenticação própria (delegada ao Orchestrator)
- BMI calculado ou outros dados corporais além de peso

## Decisions

### 1. Reusar infra existente (PostgreSQL + Redis)
**Decisão**: O `health` usará o PostgreSQL existente com um novo schema `health`, sem banco separado.  
**Alternativa descartada**: Banco PostgreSQL dedicado — adiciona complexidade operacional sem benefício real neste estágio.  
**Rationale**: Todos os serviços já compartilham o mesmo banco com schemas isolados.

### 2. Sem BullMQ
**Decisão**: O `health` não usará filas Redis nesta versão.  
**Alternativa descartada**: Jobs para cálculo de médias diárias / notificações de metas.  
**Rationale**: Nenhum requisito de processamento assíncrono identificado no escopo atual.

### 3. Snapshot nutricional no meal-log
**Decisão**: Ao registrar uma refeição, calcular e persistir `calc_calories`, `calc_protein`, `calc_carbs`, `calc_fat` no próprio `MealLog`.  
**Fórmula**: `valor = (nutrientPerServing / servingSizeValue) * amountConsumed`  
**Alternativa descartada**: Calcular on-the-fly via JOIN com `Food` a cada consulta.  
**Rationale**: Se o alimento for editado ou deletado (ON DELETE SET NULL), o histórico permanece fiel.

### 4. Alimentos públicos vs. custom
**Decisão**: `Food.userId = NULL` indica alimento público (visível a todos). `Food.userId = <id>` indica alimento custom privado. Queries de listagem filtram `WHERE userId = ? OR userId IS NULL`.  
**Alternativa descartada**: Tabela separada `public_foods` / `custom_foods`.  
**Rationale**: Simples, sem duplicação de schema. O campo `isCustom` deixa a intenção explícita.

### 5. Goal ativo por data
**Decisão**: `Goal.activeFrom` com `@@unique([userId, activeFrom])`. Goal ativo = `findFirst WHERE userId AND activeFrom <= hoje ORDER BY activeFrom DESC`.  
**Alternativa descartada**: Uma única goal por usuário (unique em userId).  
**Rationale**: Permite histórico de metas, útil para análise retrospectiva.

### 6. Porta 56083
**Decisão**: Próxima porta disponível após `finance` (56082).  
Sem conflito com serviços existentes.

## Risks / Trade-offs

- **[Risco] Prisma multi-schema `@@unique` em Date** → O Prisma mapeia `DateTime @db.Date` corretamente para `DATE` no PostgreSQL, mas o `@@unique([userId, activeFrom])` pode ter comportamento inesperado com timezones. Mitigação: normalizar `activeFrom` para UTC no service antes de persistir.

- **[Risco] Foods públicos editáveis** → Admin pode precisar editar alimentos públicos. Atualmente o serviço não tem role de admin. Mitigação: foods públicos (`userId IS NULL`) são somente leitura — apenas os criados pelo usuário (`isCustom = true`) são editáveis. Alimentos públicos serão inseridos via migration/seed.

- **[Trade-off] Sem paginação nos meal-logs** → `GET /meal-logs?date=` retorna todos os registros do dia. Para um único dia, o volume é limitado (tipicamente < 20 registros), então paginação é desproporcional.

## Migration Plan

1. Adicionar `sbn-health` ao `docker-compose.yml`
2. Subir `sbn-health` em dev: `pnpm dev:backend`
3. Rodar `prisma migrate dev --name init` dentro de `apps/health` para criar o schema `health` no PostgreSQL
4. Deploy incremental: o Orchestrator só roteará `/health/*` após o PR ser merged

**Rollback**: Remover a rota do Orchestrator e pausar o serviço. O schema `health` pode ser dropado sem afetar `auth` ou `finance`.

## Open Questions

- Alimentos públicos serão populados via seed SQL ou via admin endpoint futuro? (Assumido: seed por enquanto)
- O Orchestrator valida o header `x-user-id` antes de proxear para `/health/*`? (Assumido: sim, mesmo comportamento de `/finance/*`)
