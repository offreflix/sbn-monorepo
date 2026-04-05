## Context

O modelo `WishlistPriceEntry` existe desde a implementação de `wishlist-price-tracking`. Atualmente possui apenas um campo `price` para valor total. Produtos de varejo brasileiro frequentemente expõem dois preços distintos: à vista (com desconto) e parcelado (N×parcela, podendo haver juros embutidos). A ausência dessa distinção impede o usuário de calcular o custo real do parcelamento.

A migration `20260303000000_add_wishlist_price_entries` já existe no banco. Esta mudança requer uma nova migration additive — sem quebra de schema existente.

## Goals / Non-Goals

**Goals:**

- Adicionar `cash_price`, `installment_count` e `installment_value` ao modelo `WishlistPriceEntry`
- Manter retrocompatibilidade: entradas antigas (sem parcelamento) continuam válidas
- UI exibe diferença de custo em tempo real ao preencher dados de parcelamento
- Cobertura de testes no backend (service + controller)

**Non-Goals:**

- Cálculo de juros compostos (apenas diferença simples total parcelado − à vista)
- Suporte a múltiplas moedas no mesmo parcelamento
- Histórico de alteração de condições de parcelamento
- Migração de dados existentes (campos novos são opcionais)

## Decisions

**1. Campos adicionais vs. substituição de `price`**
Optamos por manter `price` e adicionar `cash_price`, `installment_count`, `installment_value` como campos opcionais/nullable. Alternativa seria renomear `price` → `cash_price` (BREAKING). Mantendo `price` e tornando `cash_price` o campo canônico via service layer, evitamos quebrar clientes existentes e a migration é puramente additive.

**2. Switch "Mesmo valor parcelado" ativo por padrão**
Quando ativo, `installment_count` e `installment_value` não são enviados (null no banco). O service interpreta `null` como "sem condição de parcelamento distinta". Quando desativado, ambos os campos são obrigatórios no DTO. Validação via `@ValidateIf` do `class-validator`.

**3. Cálculo de total parcelado no frontend**
O total parcelado (`installment_count × installment_value`) é calculado no cliente em tempo real, sem round-trip ao backend. O backend apenas persiste os valores brutos e não recalcula o total — responsabilidade de apresentação fica na UI.

**4. Migration additive**
Nova migration `add_installment_fields_to_price_entries` adiciona três colunas nullable à tabela `finance.wishlist_price_entries`. Sem `DEFAULT` forçado, sem migração de dados.

## Risks / Trade-offs

- **[Risk] `price` e `cash_price` podem divergir** se um cliente antigo enviar apenas `price` → Mitigation: o service popula `cash_price = price` quando `cash_price` não é fornecido, mantendo consistência
- **[Risk] `installment_count` sem `installment_value` ou vice-versa** → Mitigation: validação `@ValidateIf` garante que ambos sejam enviados juntos ou nenhum
- **[Trade-off] Dois campos redundantes (`price` e `cash_price`)** aumentam complexidade do modelo → aceito para evitar breaking change; pode ser limpo em versão futura

## Migration Plan

1. Criar migration `add_installment_fields_to_price_entries` com `ALTER TABLE "finance"."wishlist_price_entries" ADD COLUMN ...`
2. Rodar `pnpm prisma:migrate` (zero downtime — colunas nullable)
3. Rodar `pnpm prisma:generate`
4. Deploy backend e frontend simultaneamente (sem dependência de ordem)

**Rollback:** `ALTER TABLE "finance"."wishlist_price_entries" DROP COLUMN cash_price, DROP COLUMN installment_count, DROP COLUMN installment_value` — sem perda de dados existentes.
