## 1. Backend — Migration e Modelo WishlistPriceEntry

- [x] 1.1 Adicionar modelo `WishlistPriceEntry` ao `apps/finance/prisma/schema.prisma` com campos: `id`, `wishlistItemId`, `price`, `currency`, `store`, `storeUrl?`, `date`, `notes?`, `createdAt`
- [x] 1.2 Adicionar relação `priceEntries WishlistPriceEntry[]` ao modelo `WishlistItem`
- [x] 1.3 Criar migration Prisma: `cd apps/finance && npx prisma migrate dev --name add-wishlist-price-entries`
- [x] 1.4 Executar `pnpm prisma:generate` para atualizar o cliente Prisma

## 2. Backend — DTOs e Service para WishlistPriceEntry

- [x] 2.1 Criar `apps/finance/src/wishlist/dto/create-price-entry.dto.ts` com validações (price: number, store: string, storeUrl?: string, date: string, notes?: string, currency?: string)
- [x] 2.2 Adicionar método `createPriceEntry(userId, itemId, dto)` ao `WishlistService` — verifica propriedade do item antes de criar
- [x] 2.3 Adicionar método `findPriceEntries(userId, itemId)` ao `WishlistService` — retorna entradas ordenadas por `date ASC`
- [x] 2.4 Adicionar método `removePriceEntry(userId, itemId, entryId)` ao `WishlistService` — verifica propriedade do item antes de remover

## 3. Backend — Controller e Rotas de Preços

- [x] 3.1 Adicionar endpoint `POST /wishlist/:id/prices` ao `WishlistController`
- [x] 3.2 Adicionar endpoint `GET /wishlist/:id/prices` ao `WishlistController`
- [x] 3.3 Adicionar endpoint `DELETE /wishlist/:id/prices/:entryId` ao `WishlistController`

## 4. Frontend — API Client e Tipos

- [x] 4.1 Adicionar interface `WishlistPriceEntry` ao `apps/host/src/api/wishlist.ts` (id, wishlistItemId, price, currency, store, storeUrl, date, notes, createdAt)
- [x] 4.2 Adicionar métodos ao `wishlistApi`: `getPrices(id)`, `addPrice(id, payload)`, `removePrice(id, entryId)`

## 5. Frontend — Componente MoneyInput

- [x] 5.1 Criar `apps/host/src/components/MoneyInput.tsx` com lógica de máscara em centavos (estado interno inteiro, formatação via `toLocaleString('pt-BR')`)
- [x] 5.2 Implementar handler de keydown para dígitos (multiplica por 10, adiciona dígito) e Backspace (divide por 10, trunca)
- [x] 5.3 Implementar prop `defaultValue?: number` e emissão via `onChange(value: number)`
- [x] 5.4 Suportar props padrão de input: `id`, `name`, `disabled`, `aria-label`, `placeholder`
- [x] 5.5 Adicionar Recharts como dependência: `pnpm --filter @sbn/host add recharts`

## 6. Frontend — Atualização da Lista de Wishlist

- [x] 6.1 Truncar `description` em 100 caracteres com "…" no card em `apps/host/src/pages/Wishlist.tsx`
- [x] 6.2 Tornar a área principal do card clicável com `useNavigate` navegando para `/wishlist/:id`
- [x] 6.3 Garantir que os botões de ação ("Comprado", "Deletar") chamem `e.stopPropagation()` para não disparar a navegação

## 7. Frontend — Rota da Página de Detalhe

- [x] 7.1 Adicionar rota `/wishlist/:id` em `apps/host/src/App.tsx` apontando para o novo componente `WishlistDetailPage` (via `React.lazy` para lazy load)

## 8. Frontend — Página de Detalhe (WishlistDetailPage)

- [x] 8.1 Criar `apps/host/src/pages/WishlistDetail.tsx` com fetch de `wishlistApi.get(id)` e `wishlistApi.getPrices(id)` em paralelo
- [x] 8.2 Implementar header com nome, badge de prioridade, badge de status e link externo (URL do produto)
- [x] 8.3 Implementar seletor inline de prioridade (Select do Radix UI) que dispara PATCH ao mudar
- [x] 8.4 Exibir descrição completa do item
- [x] 8.5 Exibir imagem do produto (se `imageUrl` presente)
- [x] 8.6 Implementar gráfico de linha com Recharts: eixo X = data, eixo Y = preço, série por loja — exibir mensagem quando sem dados
- [x] 8.7 Implementar destaque "Melhor preço" (menor preço da lista + loja correspondente)
- [x] 8.8 Implementar tabela de registros de preço com colunas: data, loja, preço, notas, ação (remover)
- [x] 8.9 Implementar modal/dialog "Adicionar preço" com campos: preço (MoneyInput), loja (Input), URL da loja (Input opcional), data (Input date, padrão hoje), notas (Textarea opcional)
- [x] 8.10 Implementar seção de compra condicional: se PURCHASED → exibir data e preço de compra; se WISHED → exibir botão "Marcar como comprado"
- [x] 8.11 Implementar botão/breadcrumb "← Wishlist" que navega de volta para `/wishlist`

## 9. Frontend — MoneyInput nos Formulários Existentes

- [x] 9.1 Substituir o input de preço no formulário de criação de item da wishlist (`Wishlist.tsx`) pelo componente `MoneyInput`
- [x] 9.2 Substituir o input de preço no formulário de edição/atualização de item pelo componente `MoneyInput` (se existir)

## 10. MCP Server — Ferramentas de Preço

- [x] 10.1 Adicionar tool `add_price_entry(wishlist_item_id, price, store, date, store_url?, notes?, currency?)` em `apps/sbn-mcp/src/sbn_mcp/tools/wishlist.py`
- [x] 10.2 Adicionar tool `list_price_entries(wishlist_item_id)` em `apps/sbn-mcp/src/sbn_mcp/tools/wishlist.py`
- [x] 10.3 Adicionar tool `remove_price_entry(wishlist_item_id, entry_id)` em `apps/sbn-mcp/src/sbn_mcp/tools/wishlist.py`

## 11. Validação

- [x] 11.1 Testar fluxo completo: criar item → adicionar preços → verificar gráfico na página de detalhe
- [x] 11.2 Testar truncamento de descrição longa na lista
- [x] 11.3 Testar MoneyInput: digitação progressiva, backspace, defaultValue, disabled
- [x] 11.4 Testar remoção de entrada de preço via UI
- [x] 11.5 Testar atualização de prioridade inline na página de detalhe
