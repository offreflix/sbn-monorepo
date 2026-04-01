## 1. Schema & Migration

- [x] 1.1 Adicionar campos `cash_price`, `installment_count` e `installment_value` ao modelo `WishlistPriceEntry` em `apps/finance/prisma/schema.prisma`
- [x] 1.2 Criar migration `add_installment_fields_to_price_entries` com `ALTER TABLE "finance"."wishlist_price_entries" ADD COLUMN` para os três campos (nullable)
- [x] 1.3 Rodar `pnpm prisma:migrate` e `pnpm prisma:generate` para aplicar e regenerar o client

## 2. Backend — DTO e Validação

- [x] 2.1 Atualizar `CreateWishlistPriceEntryDto` em `apps/finance/src/wishlist/dto/` para incluir `cashPrice`, `installmentCount` e `installmentValue` com validações: `@IsOptional`, `@IsPositive`, `@Min(2)` para `installmentCount`, `@ValidateIf` garantindo que ambos sejam fornecidos juntos
- [x] 2.2 Atualizar o tipo de resposta / response DTO para expor os novos campos

## 3. Backend — Service

- [x] 3.1 Atualizar `WishlistService.addPriceEntry` para persistir `cashPrice`, `installmentCount`, `installmentValue` e popular `price` com o valor de `cashPrice` para retrocompatibilidade

## 4. Testes Backend

- [x] 4.1 Adicionar cenários no spec do `WishlistService` para criação com parcelamento completo
- [x] 4.2 Adicionar cenário para criação sem parcelamento (campos null)
- [x] 4.3 Adicionar cenário de validação: apenas um dos campos de parcelamento fornecido → deve lançar erro
- [x] 4.4 Adicionar cenários no spec do `WishlistController` cobrindo os novos campos

## 5. Frontend — Formulário de Entrada de Preço

- [x] 5.1 Adicionar switch "Mesmo valor parcelado" ao formulário de adição de preço em `sbn-finance-mfe`, iniciando no estado ativo
- [x] 5.2 Implementar lógica condicional: quando switch inativo, exibir campos "Nº de parcelas" e "Valor da parcela"
- [x] 5.3 Implementar cálculo em tempo real do total parcelado (`installment_count × installment_value`) e exibição da diferença em relação ao preço à vista
- [x] 5.4 Formatar e exibir a diferença: "+ R$ X,XX mais caro parcelando" quando total parcelado > à vista, "Sem acréscimo" quando ≤
- [x] 5.5 Atualizar o payload do POST para incluir `installmentCount` e `installmentValue` quando switch estiver inativo

## 6. Frontend — Tabela de Entradas de Preço

- [x] 6.1 Adicionar coluna de parcelamento na tabela de entradas de preço exibindo "Nx de R$ Y" quando campos presentes
- [x] 6.2 Exibir "—" na coluna quando entrada não possui parcelamento
