## Context

A wishlist atual vive inteiramente no `apps/host` (React, porta 9000). O card de item exibe a descrição completa e não tem navegação para uma página de detalhe. Não existe modelo de histórico de preços — o `WishlistItem` armazena apenas o preço atual. O input de valores monetários é um `<input type="number">` sem máscara. Recharts já é dependência do `apps/sbn-finance-mfe`, mas não do `apps/host`.

Restrições:

- A wishlist permanece no `apps/host` (sem migrar para o finance MFE) para evitar mudanças de roteamento e breaking changes no shell
- O Finance Service (porta 56082) é o único responsável por persistência de dados de wishlist
- Prisma multi-schema: mudanças no schema de `finance` requerem migration própria

## Goals / Non-Goals

**Goals:**

- Truncar descrição no card da lista (100 chars)
- Nova rota `/wishlist/:id` com página de detalhe completa
- Gráfico de evolução de preços (linha do tempo por loja) na página de detalhe
- CRUD de entradas de preço (`WishlistPriceEntry`) via API e UI
- Atualização de prioridade a partir da página de detalhe
- Componente `MoneyInput` com máscara estilo Nubank (centavos, da direita para esquerda)
- Adicionar Recharts ao `apps/host`

**Non-Goals:**

- Scraping automático de preços de lojas externas
- Histórico de prioridade (somente o valor atual, atualizado manualmente)
- Notificações de queda de preço
- Migrar wishlist para o finance MFE

## Decisions

### 1. Novo modelo `WishlistPriceEntry` no Prisma (Finance schema)

**Decisão**: Criar tabela `wishlist_price_entries` com campos `wishlistItemId`, `price`, `currency`, `store` (nome livre), `storeUrl` (opcional), `date`, `notes`.

**Alternativas consideradas**:

- Armazenar histórico como JSON no próprio `WishlistItem` — rejeitado: sem indexação, dificulta queries de agregação e gráficos.
- Usar o campo `price` existente com um array de snapshots — rejeitado: schema pouco expressivo.

**Rationale**: Tabela separada permite queries de ORDER BY date, GROUP BY store e fácil extensão futura.

---

### 2. Recharts no `apps/host` (não no finance MFE)

**Decisão**: Adicionar `recharts` como dependência do `apps/host`.

**Alternativas consideradas**:

- Reutilizar o Recharts do finance MFE via Module Federation — rejeitado: o MFE não expõe Recharts como shared lib de forma explícita; acoplamento frágil.
- Usar Chart.js — rejeitado: Recharts já é usado no projeto, manter consistência.

**Rationale**: Adição simples, bundle do host é pequeno hoje. Custo aceitável (~40 KB gzip).

---

### 3. `MoneyInput` como componente local no `apps/host`

**Decisão**: Criar `src/components/MoneyInput.tsx` no host.

**Alternativas consideradas**:

- Adicionar ao `@repo/ui` — válido para reuso futuro, porém aumenta escopo desta mudança.

**Rationale**: Por ora, somente o host usa inputs monetários de forma intensiva. Pode ser promovido ao `@repo/ui` em mudança futura.

**Lógica da máscara**:

- Estado interno armazena valor em centavos (inteiro)
- A cada tecla numérica: `centavos = centavos * 10 + dígito`
- Backspace: `centavos = Math.floor(centavos / 10)`
- Exibição: `(centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })`
- Valor emitido para o formulário: `centavos / 100` (float)

---

### 4. Endpoints REST para `WishlistPriceEntry`

**Decisão**: Adicionar rotas aninhadas sob `/wishlist/:id/prices`:

- `POST /wishlist/:id/prices` — cria entrada
- `GET /wishlist/:id/prices` — lista entradas (ordenadas por `date` ASC)
- `DELETE /wishlist/:id/prices/:entryId` — remove entrada

**Rationale**: Mantém o padrão RESTful aninhado já usado no projeto. O Orchestrator proxy roteará `/api/finance/wishlist/:id/prices` para o Finance Service.

---

### 5. Página de detalhe — layout

**Decisão**: Rota `/wishlist/:id` renderizada no host, carrega dados via `wishlistApi.get(id)` + `wishlistApi.getPrices(id)`. Seções:

1. Header: nome, prioridade (com botão de edição inline), status, URL do produto
2. Descrição completa
3. Imagem (se houver)
4. Gráfico de linha: eixo X = data, eixo Y = preço, uma série por loja
5. Tabela de registros de preço (data, loja, preço, notas) + botão "Adicionar preço"
6. Seção "Melhor preço encontrado": menor preço registrado com a loja correspondente
7. Seção de compra (se status = PURCHASED): data de compra, preço de compra

## Risks / Trade-offs

- **Recharts no host aumenta bundle** → Mitigação: lazy load da página de detalhe via `React.lazy` / `Suspense`
- **Migration Prisma** → Rollback: DROP TABLE `wishlist_price_entries` (sem dados críticos no início)
- **Duplicidade de `MoneyInput`** → Mitigação: documentar que o componente é candidato a `@repo/ui` na próxima oportunidade
- **Gráfico com poucos dados** → Mitigação: exibir mensagem amigável "Nenhum preço registrado ainda" quando `priceEntries` estiver vazia
