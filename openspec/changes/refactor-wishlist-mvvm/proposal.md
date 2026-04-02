## Why

A Wishlist no `apps/host` ainda concentra estado, regras de negócio, efeitos (API), helpers e JSX nos mesmos arquivos, o que torna manutenção e evolução difíceis. O projeto já adotou um padrão MVVM (via hooks) em módulos como Dashboard, e precisamos aplicar o mesmo padrão na Wishlist para padronizar responsabilidades, reduzir acoplamento e facilitar testes/refactors futuros.

## What Changes

- Refatorar as rotas de Wishlist (lista e detalhe) para seguir o padrão MVVM já usado no projeto (ex.: Dashboard no `sbn-finance-mfe`).
- Extrair toda lógica de estado, efeitos, regras de filtro e orquestração de API para hooks ViewModel (`*.model.ts`).
- Converter os componentes de UI para Views “dumb” (`*.view.tsx`), consumindo somente props tipadas, sem chamadas diretas de API e sem mutações complexas.
- Centralizar tipos/contratos de props e retornos do Model em `*.type.ts` (e schemas quando aplicável).
- Ajustar apenas wiring/imports/rotas conforme necessário; o comportamento funcional e a UI devem permanecer equivalentes.

## Capabilities

### New Capabilities
- `wishlist-mvvm`: Separação clara de View / ViewModel / types (e schemas quando aplicável) para as páginas de lista e detalhe da Wishlist no `apps/host`, alinhado ao padrão MVVM do projeto.

### Modified Capabilities
- (nenhuma)

## Impact

- **Código afetado**: `apps/host/src/pages/Wishlist.tsx`, `apps/host/src/pages/WishlistDetail.tsx` e arquivos auxiliares/rotas que importam/exportam esses componentes.
- **Sistemas**: sem mudanças de backend; contratos de API permanecem os mesmos.
- **Risco principal**: regressão comportamental por refactor estrutural; mitigação via tasks de verificação (fluxos de listar/criar/editar/excluir/registrar preço/prioridade).
