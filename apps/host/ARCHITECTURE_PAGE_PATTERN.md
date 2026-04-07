# Padrão de Arquitetura de Páginas (baseado no `sbn-finance-mfe`)

## Objetivo

Documentar o padrão usado no `apps/sbn-finance-mfe` para páginas de feature (especialmente `dashboard`) e servir como guia para aplicar a mesma organização no `apps/host`.

## Visão geral da arquitetura no `sbn-finance-mfe`

O projeto segue uma separação clara de responsabilidades:

- **App Shell**: `app.tsx` / `app.model.ts` / `app.view.tsx`
  - `app.model.ts`: estado global da aplicação, carregamento base e ações de navegação.
  - `app.view.tsx`: layout principal, header, tabs e rotas.
  - `app.tsx`: composição final (`model -> view`).
- **Pages por feature** dentro de `src/pages/<feature>/`
  - Cada feature usa arquivos com papéis bem definidos:
    - `page.tsx`
    - `<feature>.model.ts`
    - `<feature>.view.tsx`
    - `<feature>.type.ts`
    - `<feature>.schema.ts` (quando há validação/formulário)

## Padrão observado em `src/pages/dashboard`

### Estrutura de arquivos

```text
dashboard/
  page.tsx
  dashboard.model.ts
  dashboard.view.tsx
  dashboard.type.ts
  dashboard.schema.ts
```

### Responsabilidade de cada arquivo

- `page.tsx`
  - É a porta de entrada da feature.
  - Recebe `props`, chama `useDashboardModel(props)` e renderiza `DashboardView`.
  - Não contém regra de negócio relevante.

- `dashboard.model.ts`
  - Centraliza estado, efeitos, chamadas de API e ações da feature.
  - Faz `fetchDashboardData`, combina múltiplas fontes, trata loading e erro.
  - Expõe um contrato estável para a view:
    - `data`
    - `state`
    - `actions`

- `dashboard.view.tsx`
  - Foca em composição de UI.
  - Consome somente o objeto vindo do model (`DashboardModelOutput`).
  - Não conhece detalhes de API.

- `dashboard.type.ts`
  - Define tipos de domínio da feature (`DashboardSummary`, `DashboardCategories`, `DashboardProps` etc.).
  - Reduz acoplamento entre página, componentes e API.

- `dashboard.schema.ts`
  - Concentra validações (`zod`) e tipos derivados (`z.infer`).
  - Permite reaproveitar o schema em forms da própria feature.

## Fluxo de dados (Dashboard)

1. `app.view.tsx` injeta dados/handlers na rota de dashboard.
2. `page.tsx` cria o model.
3. `dashboard.model.ts`:
   - usa props de contexto;
   - busca dados complementares da dashboard;
   - mantém estado local;
   - retorna `data/state/actions`.
4. `dashboard.view.tsx` renderiza com base nesse contrato.

## Convenções identificadas no projeto

- Nomeação consistente:
  - Hook de model: `use<Feature>Model`.
  - Tipo de saída: `<Feature>ModelOutput`.
  - Entrada da página: `page.tsx`.
- Retorno do model padronizado em blocos (`data`, `state`, `setters`, `actions`).
- `page.tsx` fino, `view` declarativa, `model` orientado a comportamento.
- Tipos e schema vivem junto da feature.

## Diferença atual no `host`

Hoje, no `apps/host/src/pages`, as páginas estão majoritariamente em arquivo único (`Dashboard.tsx`, `Register.tsx`, `Login.tsx` etc.), misturando:

- estado local;
- validação/form;
- regras de negócio;
- renderização.

## Como aplicar o mesmo pattern no `host`

Para cada página/feature do host, migrar para pasta dedicada:

```text
src/pages/<feature>/
  page.tsx
  <feature>.model.ts
  <feature>.view.tsx
  <feature>.type.ts
  <feature>.schema.ts      # quando necessário
```

### Regra prática de separação

- **Model**: hooks, efeitos, integração API, regras e handlers.
- **View**: JSX, composição visual, bindings de evento.
- **Type**: contratos da feature (props, DTOs de tela, estado derivado).
- **Schema**: validação de formulário e tipagem inferida.
- **Page**: somente orquestração `model -> view`.

## Exemplo de migração (Register)

Estrutura sugerida:

```text
src/pages/register/
  page.tsx
  register.model.ts
  register.view.tsx
  register.type.ts
  register.schema.ts
```

Divisão:

- `register.schema.ts`: schema zod + `FormValues`.
- `register.model.ts`: `useForm`, `useAuth`, `navigate`, submit e loading.
- `register.view.tsx`: card e formulário, recebendo dados/ações do model.
- `page.tsx`: cria model e renderiza view.

## Benefícios esperados no host

- Melhor legibilidade e manutenção.
- Menor acoplamento entre UI e regra de negócio.
- Reuso de tipagem e validação por feature.
- Testes mais simples (model testável sem render completo).
- Padronização entre apps do monorepo.

## Checklist de adoção no host

1. Criar pasta por feature em `src/pages`.
2. Extrair schema/tipos do arquivo único.
3. Mover lógica de estado e efeitos para `<feature>.model.ts`.
4. Manter `<feature>.view.tsx` focado em renderização.
5. Deixar `page.tsx` mínimo.
6. Atualizar imports das rotas em `App.tsx` para os novos `page.tsx`.
7. Repetir para as páginas restantes.
