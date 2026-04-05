## ADDED Requirements

### Requirement: Modelo de entrada de preço

O sistema SHALL persistir entradas de histórico de preço para cada item da wishlist por meio do modelo `WishlistPriceEntry`, contendo: `cash_price` (preço à vista), moeda, nome da loja, URL da loja (opcional), data da observação, notas (opcional), `installment_count` (número de parcelas, opcional), `installment_value` (valor por parcela, opcional). O campo legado `price` é mantido por compatibilidade e SHALL ser populado com o valor de `cash_price` quando não fornecido explicitamente.

#### Scenario: Criação de entrada de preço

- **WHEN** uma requisição POST é enviada para `/wishlist/:id/prices` com `cash_price`, `store` e `date` válidos
- **THEN** o sistema persiste a entrada associada ao item e retorna o objeto criado com status 201

#### Scenario: Dados inválidos na criação

- **WHEN** uma requisição POST é enviada sem campo `cash_price` (ou `price`) ou sem campo `store`
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

A página de detalhe SHALL oferecer um formulário (modal ou inline) para registrar uma nova entrada de preço, com campos: preço à vista (MoneyInput), switch "Mesmo valor parcelado" (ativo por padrão), campos condicionais de parcelamento (nº parcelas + valor por parcela), loja (texto), URL da loja (opcional), data (padrão: hoje), notas (opcional).

#### Scenario: Adição de preço via UI sem parcelamento

- **WHEN** o usuário preenche preço à vista, loja e confirma com o switch "Mesmo valor parcelado" ativo
- **THEN** o sistema chama POST `/api/finance/wishlist/:id/prices` sem campos de parcelamento, fecha o formulário e atualiza tabela e gráfico sem reload

#### Scenario: Adição de preço via UI com parcelamento

- **WHEN** o usuário desativa o switch, preenche `installment_count` e `installment_value`, e confirma
- **THEN** o sistema chama POST com os campos de parcelamento, fecha o formulário e atualiza a UI

#### Scenario: Cancelamento do formulário

- **WHEN** o usuário abre o formulário e clica em "Cancelar"
- **THEN** o formulário fecha sem enviar dados

### Requirement: Tabela de registros de preço na página de detalhe

A página de detalhe SHALL exibir uma tabela com todas as entradas de preço, mostrando data, loja, preço e ações (remover).

#### Scenario: Remoção de registro via UI

- **WHEN** o usuário clica no botão de remoção de uma entrada na tabela
- **THEN** o sistema exibe confirmação, e após confirmação chama DELETE e remove a linha da tabela
