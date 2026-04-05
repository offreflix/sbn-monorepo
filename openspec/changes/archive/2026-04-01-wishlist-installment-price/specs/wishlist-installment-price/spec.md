## ADDED Requirements

### Requirement: Campos de parcelamento na entrada de preço

O sistema SHALL persistir condições de parcelamento em `WishlistPriceEntry` por meio dos campos opcionais `cash_price` (preço à vista), `installment_count` (número de parcelas) e `installment_value` (valor por parcela). Quando `installment_count` e `installment_value` estão presentes, o total parcelado é `installment_count × installment_value`.

#### Scenario: Criação com preço à vista e parcelamento

- **WHEN** uma requisição POST é enviada para `/wishlist/:id/prices` com `cash_price`, `installment_count` e `installment_value` válidos
- **THEN** o sistema persiste os três campos e retorna o objeto criado com status 201

#### Scenario: Criação sem parcelamento (mesmo valor)

- **WHEN** uma requisição POST é enviada sem `installment_count` e `installment_value`
- **THEN** o sistema persiste a entrada com esses campos como null e retorna status 201

#### Scenario: Parcelamento parcial (apenas um dos campos)

- **WHEN** uma requisição POST é enviada com `installment_count` mas sem `installment_value`, ou vice-versa
- **THEN** o sistema retorna status 400 com mensagem indicando que ambos os campos são obrigatórios em conjunto

#### Scenario: Valores de parcelamento inválidos

- **WHEN** uma requisição POST é enviada com `installment_count` menor que 2 ou `installment_value` menor ou igual a zero
- **THEN** o sistema retorna status 400

### Requirement: Switch "Mesmo valor parcelado" no formulário

A UI SHALL exibir um switch com label **"Mesmo valor parcelado"** no formulário de adição de entrada de preço. O switch SHALL iniciar no estado ativo (ligado).

#### Scenario: Switch ativo — campos de parcelamento ocultos

- **WHEN** o switch "Mesmo valor parcelado" está ativo
- **THEN** os campos `installment_count` e `installment_value` não são exibidos e não são enviados na requisição

#### Scenario: Switch inativo — campos de parcelamento visíveis

- **WHEN** o usuário desativa o switch "Mesmo valor parcelado"
- **THEN** os campos "Nº de parcelas" e "Valor da parcela" são exibidos e tornam-se obrigatórios para submissão

#### Scenario: Cálculo em tempo real do total parcelado

- **WHEN** o switch está inativo e o usuário preenche `installment_count` e `installment_value`
- **THEN** a UI exibe o total parcelado (`installment_count × installment_value`) e a diferença em relação ao preço à vista em tempo real, antes da submissão

#### Scenario: Diferença positiva (parcelado mais caro)

- **WHEN** o total parcelado é maior que o preço à vista
- **THEN** a UI exibe a diferença formatada como "+ R$ X,XX mais caro parcelando"

#### Scenario: Diferença negativa ou zero

- **WHEN** o total parcelado é menor ou igual ao preço à vista
- **THEN** a UI exibe a diferença como "Sem acréscimo" ou o valor de desconto

### Requirement: Exibição de condição de parcelamento na tabela

A tabela de entradas de preço SHALL exibir a condição de parcelamento quando presente.

#### Scenario: Entrada com parcelamento

- **WHEN** uma entrada de preço possui `installment_count` e `installment_value` preenchidos
- **THEN** a tabela exibe a condição no formato "Nx de R$ Y" e o total parcelado calculado

#### Scenario: Entrada sem parcelamento

- **WHEN** uma entrada de preço não possui campos de parcelamento
- **THEN** a coluna de parcelamento exibe "—" ou fica vazia
