## ADDED Requirements

### Requirement: Modelo de entrada de preço

O sistema SHALL persistir entradas de histórico de preço para cada item da wishlist por meio do modelo `WishlistPriceEntry`, contendo: preço, moeda, nome da loja, URL da loja (opcional), data da observação e notas (opcional).

#### Scenario: Criação de entrada de preço

- **WHEN** uma requisição POST é enviada para `/wishlist/:id/prices` com preço, loja e data válidos
- **THEN** o sistema persiste a entrada associada ao item e retorna o objeto criado com status 201

#### Scenario: Dados inválidos na criação

- **WHEN** uma requisição POST é enviada sem campo `price` ou sem campo `store`
- **THEN** o sistema retorna status 400 com mensagem de erro descritiva

### Requirement: Listagem de entradas de preço

O sistema SHALL retornar todas as entradas de preço de um item ordenadas por data crescente.

#### Scenario: Listagem com registros

- **WHEN** uma requisição GET é enviada para `/wishlist/:id/prices`
- **THEN** o sistema retorna array de entradas ordenado por `date` ASC

#### Scenario: Listagem sem registros

- **WHEN** uma requisição GET é enviada para `/wishlist/:id/prices` de um item sem entradas
- **THEN** o sistema retorna array vazio com status 200

### Requirement: Remoção de entrada de preço

O sistema SHALL permitir remover uma entrada de preço específica.

#### Scenario: Remoção bem-sucedida

- **WHEN** uma requisição DELETE é enviada para `/wishlist/:id/prices/:entryId`
- **THEN** o sistema remove a entrada e retorna status 204

#### Scenario: Remoção de entrada de outro usuário

- **WHEN** uma requisição DELETE é enviada para uma entrada cujo `wishlistItem.userId` difere do usuário autenticado
- **THEN** o sistema retorna status 403

### Requirement: Interface de adição de preço

A página de detalhe SHALL oferecer um formulário (modal ou inline) para registrar uma nova entrada de preço, com campos: preço (MoneyInput), loja (texto), URL da loja (opcional), data (padrão: hoje), notas (opcional).

#### Scenario: Adição de preço via UI

- **WHEN** o usuário clica em "Adicionar preço", preenche os campos obrigatórios e confirma
- **THEN** o sistema chama POST `/api/finance/wishlist/:id/prices`, fecha o formulário e atualiza o gráfico e a tabela sem reload de página

#### Scenario: Cancelamento do formulário

- **WHEN** o usuário abre o formulário e clica em "Cancelar"
- **THEN** o formulário fecha sem enviar dados

### Requirement: Tabela de registros de preço na página de detalhe

A página de detalhe SHALL exibir uma tabela com todas as entradas de preço, mostrando data, loja, preço e ações (remover).

#### Scenario: Remoção de registro via UI

- **WHEN** o usuário clica no botão de remoção de uma entrada na tabela
- **THEN** o sistema exibe confirmação, e após confirmação chama DELETE e remove a linha da tabela
