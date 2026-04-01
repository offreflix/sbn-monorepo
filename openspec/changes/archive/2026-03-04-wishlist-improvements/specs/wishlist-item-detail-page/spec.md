## ADDED Requirements

### Requirement: Página de detalhe do item da wishlist
O sistema SHALL disponibilizar uma rota `/wishlist/:id` que exibe todas as informações de um item da wishlist, incluindo descrição completa, histórico de preços e dados de compra.

#### Scenario: Usuário acessa página de detalhe
- **WHEN** o usuário clica em um card de item na lista da wishlist
- **THEN** o sistema navega para `/wishlist/:id` e exibe as informações completas do item

#### Scenario: Item não encontrado
- **WHEN** o usuário acessa `/wishlist/:id` com um ID inexistente ou de outro usuário
- **THEN** o sistema exibe mensagem de erro e botão para voltar à lista

### Requirement: Exibição de descrição completa
A página de detalhe SHALL exibir a descrição completa do item sem truncamento.

#### Scenario: Item com descrição longa
- **WHEN** a página de detalhe carrega um item com descrição maior que 100 caracteres
- **THEN** a descrição completa é exibida sem cortes ou reticências

### Requirement: Gráfico de evolução de preços
A página de detalhe SHALL exibir um gráfico de linha com a evolução de preços ao longo do tempo, com uma série por loja registrada.

#### Scenario: Item com histórico de preços
- **WHEN** o item possui pelo menos uma entrada de preço
- **THEN** o gráfico exibe os pontos no eixo X (data) e eixo Y (preço em BRL), com cada loja representada por uma cor distinta

#### Scenario: Item sem histórico de preços
- **WHEN** o item não possui nenhuma entrada de preço
- **THEN** o sistema exibe a mensagem "Nenhum preço registrado ainda" no lugar do gráfico

### Requirement: Destaque do melhor preço
A página de detalhe SHALL exibir o menor preço já registrado e a loja onde foi encontrado.

#### Scenario: Múltiplos registros de preço
- **WHEN** o item possui dois ou mais registros de preço em lojas distintas
- **THEN** o sistema exibe o menor valor e o nome da loja correspondente em destaque

### Requirement: Seção de compra
Quando o status do item for PURCHASED, a página SHALL exibir a data de compra e o preço do momento da compra.

#### Scenario: Item comprado
- **WHEN** o item possui status PURCHASED
- **THEN** a página exibe a seção "Comprado" com data formatada (DD/MM/YYYY) e o preço registrado no campo `price` do item

#### Scenario: Item não comprado
- **WHEN** o item possui status WISHED
- **THEN** a seção de compra não é exibida; em seu lugar aparece o botão "Marcar como comprado"

### Requirement: Edição de prioridade inline
A página de detalhe SHALL permitir alterar a prioridade do item diretamente, sem abrir um modal separado.

#### Scenario: Alteração de prioridade
- **WHEN** o usuário seleciona uma prioridade diferente no seletor da página de detalhe
- **THEN** o sistema envia PATCH para `/api/finance/wishlist/:id` com o novo valor de `priority` e exibe a atualização imediatamente

### Requirement: Navegação de volta para a lista
A página de detalhe SHALL oferecer botão/link para retornar à lista da wishlist.

#### Scenario: Usuário volta para a lista
- **WHEN** o usuário clica em "Voltar" ou no breadcrumb da wishlist
- **THEN** o sistema navega para `/wishlist` preservando os filtros anteriores (via query string ou estado de navegação)
