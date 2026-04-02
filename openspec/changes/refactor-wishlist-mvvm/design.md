## Context

O `apps/host` possui duas rotas principais relacionadas à Wishlist:

- Lista: `apps/host/src/pages/Wishlist.tsx`
- Detalhe: `apps/host/src/pages/WishlistDetail.tsx` (lazy no `App.tsx`)

Hoje, ambas concentram (no mesmo arquivo) estado local, efeitos (`useEffect` + chamadas ao `wishlistApi`), regras de filtragem, transformação de dados (ex.: dados/config do gráfico) e renderização de UI. Em contrapartida, no `apps/sbn-finance-mfe` as páginas já seguem um padrão MVVM consistente (ex.: `pages/dashboard/*`), com:

- `*.model.ts`: hook com estado, efeitos e regras
- `*.view.tsx`: componente puramente apresentacional
- `*.type.ts`: contratos tipados da fronteira Model ↔ View (e schemas quando aplicável)
- `page.tsx`: conector entre model e view

Este change define como aplicar o mesmo padrão à Wishlist do `apps/host`, preservando comportamento e UI.

## Goals / Non-Goals

**Goals:**

- Separar responsabilidades: View sem lógica de negócio e sem efeitos; ViewModel encapsulando estado, efeitos e ações.
- Adotar estrutura e naming alinhados ao padrão MVVM já existente no projeto.
- Manter o comportamento da Wishlist equivalente (mesmos fluxos e integrações), realizando apenas refactor estrutural.
- Reduzir acoplamento entre UI e regras (ex.: filtros, montagem de séries do gráfico, handlers de CRUD).

**Non-Goals:**

- Alterar endpoints, contratos ou comportamentos do `wishlistApi`.
- Reprojetar UI/UX, mudar layout, copy ou componentes visuais.
- Reescrever componentes compartilhados (ex.: `Header`, `MoneyInput`, `PurchaseTransactionModal`).

## Decisions

**1) MVVM via hooks (mesmo padrão do Dashboard)**

- A ViewModel será um hook (`useWishlistModel`, `useWishlistDetailModel`) responsável por:
  - Carregar dados (fetch) e coordenar chamadas ao `wishlistApi`
  - Gerenciar estado de UI (dialogs/modais), forms e flags de loading/saving
  - Implementar handlers (create/edit/delete/purchase/add price/add priority)
  - Expor à View apenas o necessário
- A View (`WishlistView`, `WishlistDetailView`) será um componente stateless que:
  - Renderiza UI e dispara callbacks recebidos via props
  - Não chama `wishlistApi` diretamente e não contém regras complexas de transformação

**2) Retorno do Model organizado em grupos**

Para manter legibilidade e escalar a assinatura de props, o retorno do Model seguirá o padrão já usado em `transactions.model.ts`:

- `data`: dados para renderização (itens, item, entries, chart data, etc.)
- `state`: flags e estados de UI (loading, dialogOpen, forms, filtros)
- `setters`: setters necessários para campos controlados e toggles
- `actions`: handlers que encapsulam lógica (load, submit, delete, etc.)

**3) Transformações “pesadas” saem da View**

- Construção de datasets/config de gráficos (ex.: séries por loja), labels e cores derivadas serão produzidas no Model (ou helpers internos do Model) e entregues à View em formato pronto para renderização.
- A View pode manter apenas helpers triviais e puramente apresentacionais (ex.: pequenos subcomponentes), desde que não introduzam regras de negócio ou efeitos.

**4) Estrutura de arquivos proposta para o Host**

Criar pastas por rota, aproximando do padrão do `sbn-finance-mfe`:

- `apps/host/src/pages/wishlist/`
  - `wishlist.model.ts`
  - `wishlist.type.ts`
  - `wishlist.view.tsx`
  - `page.tsx` (exporta `WishlistPage`)
- `apps/host/src/pages/wishlist-detail/`
  - `wishlist-detail.model.ts`
  - `wishlist-detail.type.ts`
  - `wishlist-detail.view.tsx`
  - `page.tsx` (exporta `WishlistDetailPage`)

O roteamento será ajustado para importar os conectores (`page.tsx`) e manter as mesmas rotas (`/wishlist` e `/wishlist/:id`).

## Risks / Trade-offs

- **Risco: regressão por refactor estrutural** → Mitigar preservando props/fluxos, mantendo a lógica existente e validando manualmente os principais cenários (listar/criar/editar/excluir/compra/histórico de preço/prioridade).
- **Trade-off: mais arquivos/boilerplate** → Aceito para padronização com o restante do projeto e ganho em separação de responsabilidades.
- **Risco: “prop drilling” na View** → Mitigar agrupando em `data/state/setters/actions` e mantendo tipos explícitos em `*.type.ts`.
