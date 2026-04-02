## 1. Estrutura MVVM (Host)

- [x] 1.1 Criar a estrutura de diretórios/arquivos MVVM para a rota de lista da Wishlist (model/type/view/page)
- [x] 1.2 Criar a estrutura de diretórios/arquivos MVVM para a rota de detalhe da Wishlist (model/type/view/page)

## 2. Wishlist (Lista) em MVVM

- [x] 2.1 Extrair do `Wishlist.tsx` o carregamento de itens, filtros (status/prioridade) e estado de dialogs/forms para `wishlist.model.ts`
- [x] 2.2 Definir contratos em `wishlist.type.ts` (output do Model e props da View), seguindo o agrupamento `data/state/setters/actions`
- [x] 2.3 Migrar o JSX de lista para `wishlist.view.tsx` garantindo que não existam chamadas diretas ao `wishlistApi` nem efeitos dentro da View
- [x] 2.4 Implementar `pages/wishlist/page.tsx` como conector (invoca `useWishlistModel` e renderiza `WishlistView`)

## 3. Wishlist (Detalhe) em MVVM

- [x] 3.1 Extrair do `WishlistDetail.tsx` o carregamento (item/prices/priorities) e estados de dialogs/forms para `wishlist-detail.model.ts`
- [x] 3.2 Mover para o Model as transformações de dados do gráfico (datasets/config) e regras derivadas (labels/cores/status), entregando à View dados prontos para renderização
- [x] 3.3 Definir contratos em `wishlist-detail.type.ts` (output do Model e props da View), seguindo o agrupamento `data/state/setters/actions`
- [x] 3.4 Migrar o JSX para `wishlist-detail.view.tsx` garantindo que a View seja puramente apresentacional
- [x] 3.5 Implementar `pages/wishlist-detail/page.tsx` como conector (invoca `useWishlistDetailModel` e renderiza `WishlistDetailView`)

## 4. Integração e Compatibilidade

- [x] 4.1 Atualizar `apps/host/src/App.tsx` para importar os novos conectores e manter as rotas `/wishlist` e `/wishlist/:id` (incluindo lazy/suspense quando aplicável)
- [x] 4.2 Garantir que os exports usados pelo roteamento (componentes de página) permaneçam compatíveis com os imports atuais
- [x] 4.3 Remover/ajustar os arquivos antigos de página (`Wishlist.tsx`, `WishlistDetail.tsx`) ou mantê-los como thin wrappers sem lógica (conforme preferido pelo padrão do projeto)

## 5. Verificação

- [ ] 5.1 Validar manualmente os fluxos principais: listar, filtrar, criar item, deletar item, navegar para detalhe e voltar
- [ ] 5.2 Validar no detalhe: editar item, registrar preço, registrar prioridade, abrir compra (PurchaseTransactionModal) e estados de loading/saving
- [ ] 5.3 Rodar lint e typecheck do workspace/projeto e corrigir eventuais erros introduzidos pelo refactor
