## ADDED Requirements

### Requirement: Truncamento de descrição no card

O sistema SHALL exibir no card da lista apenas os primeiros 100 caracteres da descrição do item, seguidos de reticências ("…") quando a descrição exceder esse limite.

#### Scenario: Descrição curta

- **WHEN** o item possui descrição com 100 caracteres ou menos
- **THEN** a descrição é exibida integralmente no card, sem reticências

#### Scenario: Descrição longa

- **WHEN** o item possui descrição com mais de 100 caracteres
- **THEN** o card exibe apenas os primeiros 100 caracteres seguidos de "…"

### Requirement: Card clicável para navegação

O card de item da lista SHALL ser clicável em sua área principal e navegar para a página de detalhe `/wishlist/:id`.

#### Scenario: Clique no card

- **WHEN** o usuário clica na área principal do card (fora dos botões de ação)
- **THEN** o sistema navega para `/wishlist/:id`

#### Scenario: Botões de ação não propagam navegação

- **WHEN** o usuário clica no botão "Comprado" ou "Deletar" dentro do card
- **THEN** a ação correspondente é executada e a navegação para o detalhe NÃO ocorre
