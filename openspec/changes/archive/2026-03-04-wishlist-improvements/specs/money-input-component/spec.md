## ADDED Requirements

### Requirement: Máscara monetária estilo Nubank

O componente `MoneyInput` SHALL aceitar entrada de dígitos numéricos e compor o valor em reais de forma que cada dígito digitado seja inserido na casa dos centavos (da direita para a esquerda), exibindo sempre duas casas decimais separadas por vírgula.

#### Scenario: Digitação progressiva de valor

- **WHEN** o usuário digita a sequência "5", "0", "0"
- **THEN** o campo exibe, respectivamente, "0,05" → "0,50" → "5,00"

#### Scenario: Valor grande

- **WHEN** o usuário digita "1", "5", "0", "0", "0", "0"
- **THEN** o campo exibe "1.500,00"

#### Scenario: Backspace remove último dígito

- **WHEN** o campo exibe "5,00" e o usuário pressiona Backspace
- **THEN** o campo passa a exibir "0,50"

#### Scenario: Estado inicial vazio

- **WHEN** o componente é renderizado sem valor inicial
- **THEN** o campo exibe "0,00" ou placeholder vazio (conforme prop `placeholder`)

### Requirement: Emissão de valor numérico para formulário

O componente SHALL emitir o valor em número de ponto flutuante (ex: `5.00`) via callback `onChange(value: number)`, compatível com o restante do formulário.

#### Scenario: Callback com valor correto

- **WHEN** o campo exibe "150,00"
- **THEN** o `onChange` é chamado com o argumento `150`

### Requirement: Suporte a valor inicial via prop

O componente SHALL aceitar um valor inicial numérico via prop `defaultValue` e exibi-lo formatado na montagem.

#### Scenario: Prop defaultValue preenchida

- **WHEN** o componente é montado com `defaultValue={199.9}`
- **THEN** o campo exibe "199,90" imediatamente

### Requirement: Acessibilidade e label

O componente SHALL aceitar as props padrão de input HTML (`id`, `name`, `disabled`, `aria-label`) e ser compatível com o sistema de labels do `@repo/ui`.

#### Scenario: Campo desabilitado

- **WHEN** a prop `disabled` é passada como `true`
- **THEN** o campo não responde a eventos de teclado e possui estilo visual de desabilitado
