## Why

O rastreamento de preço atual registra apenas um valor único por entrada, mas produtos frequentemente têm preço à vista e condições de parcelamento distintas. Sem essa distinção, o usuário não consegue avaliar o custo real do parcelamento (juros embutidos ou diferença de desconto) ao comparar opções de compra.

## What Changes

- O modelo `WishlistPriceEntry` ganha três novos campos: `cash_price` (preço à vista), `installment_count` (número de parcelas) e `installment_value` (valor por parcela)
- O campo `price` existente é mantido como total à vista para compatibilidade; `cash_price` passa a ser o campo canônico para preço à vista
- O formulário de adição de entrada de preço ganha um switch **"Mesmo valor parcelado"** (ativo por padrão): quando ativo, assume que o total parcelado = preço à vista; quando desativado, exibe campos para `installment_count` × `installment_value`
- A UI calcula e exibe em tempo real o total parcelado e a diferença em relação ao preço à vista
- A tabela de entradas de preço exibe a condição de parcelamento quando presente

## Capabilities

### New Capabilities
- `wishlist-installment-price`: Suporte a preço à vista e parcelado na entrada de preço da wishlist, com comparação de custo em tempo real na UI

### Modified Capabilities
- `wishlist-price-tracking`: Os requisitos de criação de entrada de preço mudam — o modelo agora aceita `cash_price`, `installment_count` e `installment_value`; o formulário da UI ganha o switch e os campos de parcelamento; a tabela de exibição inclui coluna de condição de parcelamento

## Impact

- **Backend (finance):** schema Prisma `WishlistPriceEntry` + nova migration + DTO `CreateWishlistPriceEntryDto` + `WishlistService` + `WishlistController`
- **Frontend (sbn-finance-mfe):** componente de formulário de entrada de preço + tabela de registros de preço
- **Testes:** specs do `WishlistService` e do controller precisam cobrir os novos campos
