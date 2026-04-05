## ADDED Requirements

### Requirement: Estrutura MVVM para Wishlist (Host)

A Wishlist no `apps/host` SHALL seguir um padrão MVVM consistente, com separação explícita entre View, ViewModel, types (e schemas quando aplicável), cobrindo as páginas de lista e de detalhe.

#### Scenario: Organização de arquivos por rota

- **WHEN** um desenvolvedor navega pelo código da Wishlist no `apps/host`
- **THEN** ele encontra arquivos separados para ViewModel (`*.model.ts`), View (`*.view.tsx`), tipos (`*.type.ts`) e um entrypoint conector (`page.tsx`) para cada rota (lista e detalhe), sem lógica de negócio dentro da View

### Requirement: View sem efeitos e sem regras de negócio

As Views da Wishlist (`*.view.tsx`) SHALL ser componentes apresentacionais, sem chamadas diretas ao `wishlistApi`, sem `useEffect` para carregamento de dados e sem regras de negócio (ex.: filtros, coordenação de handlers, transformações de dados complexas).

#### Scenario: Renderização com props e callbacks

- **WHEN** a View da Wishlist é renderizada via JSX
- **THEN** ela utiliza exclusivamente props tipadas para dados/estado e callbacks para ações, delegando qualquer mutação/efeito ao ViewModel

### Requirement: ViewModel concentra estado, efeitos e handlers

Os ViewModels da Wishlist (`*.model.ts`) SHALL encapsular estado local de UI, efeitos (carregamento e sincronização) e handlers que orquestram chamadas ao `wishlistApi`, expondo para a View apenas dados derivados e ações necessárias.

#### Scenario: Operações de CRUD e sincronização

- **WHEN** o usuário cria/edita/remove um item, registra um preço ou altera prioridade
- **THEN** a operação é executada por um handler do ViewModel e o estado/dados exibidos na View refletem a atualização após a conclusão (incluindo estados de loading/saving quando aplicável)

### Requirement: Contratos tipados na fronteira Model ↔ View

Os módulos de Wishlist SHALL definir explicitamente tipos para props da View e para o output do Model em arquivos `*.type.ts`, garantindo que a fronteira entre camadas permaneça estável e rastreável.

#### Scenario: Tipagem do retorno do Model

- **WHEN** a ViewModel retorna dados/estado/ações para a View
- **THEN** o formato retornado é descrito por um tipo exportado em `*.type.ts` e consumido diretamente pela View como contrato de props

### Requirement: Formato de saída agrupado do ViewModel

O retorno do ViewModel SHALL agrupar informações relacionadas em objetos (por exemplo `data`, `state`, `setters`, `actions`) para reduzir acoplamento e manter a assinatura da View legível.

#### Scenario: Escalabilidade da assinatura da View

- **WHEN** novas flags/handlers forem necessários na Wishlist
- **THEN** a adição ocorre dentro dos grupos expostos pelo ViewModel sem exigir reestruturação ampla da interface entre View e Model

### Requirement: Rotas e exports permanecem equivalentes

Após a refatoração MVVM, as rotas públicas da Wishlist SHALL permanecer funcionalmente equivalentes às atuais (`/wishlist` e `/wishlist/:id`), mantendo os mesmos fluxos e integrações do usuário.

#### Scenario: Navegação entre lista e detalhe

- **WHEN** um usuário navega da lista para o detalhe de um item e retorna
- **THEN** a navegação funciona com os mesmos paths e a página renderiza os dados esperados, sem mudanças de comportamento visível decorrentes apenas do refactor estrutural
