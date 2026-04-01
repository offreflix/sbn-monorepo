## Why

A lista de desejos atual exibe descrições completas no card, tornando a UI verbosa, e não oferece rastreamento de histórico de preços nem uma página dedicada ao item — funcionalidades essenciais para tomar decisões de compra embasadas. Além disso, o input de valores monetários não segue o padrão brasileiro intuitivo (estilo Nubank), gerando fricção no cadastro.

## What Changes

- A descrição do item na lista é truncada em 100 caracteres com reticências
- Clicar em um card abre uma página dedicada ao item (`/wishlist/:id`)
- A página de detalhe exibe descrição completa, gráfico de histórico de preços, melhores lojas encontradas, e informações de compra (se adquirido)
- Nova funcionalidade de registro de preço: o usuário informa preço do dia, loja e data
- A prioridade do item pode ser atualizada diretamente da página de detalhe
- O input de valores monetários passa a usar máscara estilo Nubank (dígitos da direita para a esquerda)
- **BREAKING**: O modelo `WishlistItem` recebe uma relação com o novo modelo `WishlistPriceEntry`

## Capabilities

### New Capabilities
- `wishlist-item-detail-page`: Página dedicada `/wishlist/:id` com descrição completa, gráfico de evolução de preços, tabela de registros por loja, e seção de compra
- `wishlist-price-tracking`: Modelo `WishlistPriceEntry` (preço, loja, data), endpoints REST para criar/listar entradas, e UI de adição de preço na página de detalhe
- `money-input-component`: Componente React reutilizável com máscara monetária estilo Nubank (inserção da direita para a esquerda em centavos)

### Modified Capabilities
- `wishlist-list-view`: Truncar `description` em 100 chars no card; card passa a ser clicável (navega para detalhe em vez de expandir)

## Impact

- **Backend — Finance Service**: nova migration Prisma adicionando `WishlistPriceEntry`; novos endpoints em `wishlist.controller.ts` e `wishlist.service.ts`
- **Frontend — Host App**: nova rota `/wishlist/:id`, novo componente de página de detalhe, refactor do card da lista, novo componente `MoneyInput`
- **MCP Server**: adicionar ferramentas para criar/listar `WishlistPriceEntry`
- **Dependências**: biblioteca de gráficos (Recharts já presente no projeto ou similar)
