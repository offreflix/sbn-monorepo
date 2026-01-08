# SBN Micro Frontend Repository

Monorepo gerenciado pelo Turborepo contendo aplicações frontend baseadas em arquitetura de Micro Frontends usando Module Federation.

## 📋 Visão Geral

Este repositório implementa uma arquitetura de **Micro Frontends** utilizando **Module Federation** para permitir o desenvolvimento e deploy independente de diferentes partes da aplicação. O projeto é construído com **React**, **TypeScript**, **Rsbuild** e **Turborepo** para gerenciamento do monorepo.

### Arquitetura

- **Host App (`host`)**: Aplicação principal que atua como container e orquestra os micro frontends remotos
- **Remote Apps**: Micro frontends independentes que são carregados dinamicamente pelo host
  - `sbn-finance-mfe`: Módulo de gestão financeira

## 🛠️ Stack Tecnológico

### Core
- **React 19.2.3**: Biblioteca UI
- **TypeScript 5.9.3**: Tipagem estática
- **Turborepo 2.6.3**: Gerenciamento de monorepo e cache de builds
- **pnpm 9.0.0**: Gerenciador de pacotes

### Build & Bundling
- **Rsbuild 1.6.14**: Build tool baseado em Rspack
- **Module Federation Enhanced 0.21.6**: Implementação de Module Federation

### UI & Estilização
- **Tailwind CSS 4.0.0**: Framework CSS utility-first
- **Radix UI**: Componentes acessíveis e não estilizados
- **Shadcn UI** (via `@repo/ui`): Biblioteca de componentes
- **Lucide React**: Ícones
- **Sonner**: Notificações toast

### Formulários & Validação
- **React Hook Form 7.53.2**: Gerenciamento de formulários
- **Zod 3.23.8**: Validação de schemas
- **@hookform/resolvers**: Integração React Hook Form + Zod

### Roteamento & Estado
- **React Router DOM 7.1.2**: Roteamento client-side

### Gráficos
- **Recharts 3.6.0**: Biblioteca de gráficos (usado em `sbn-finance-mfe`)
- **date-fns 4.1.0**: Manipulação de datas

### Testes
- **Vitest 2.1.4**: Framework de testes
- **Testing Library**: Utilitários para testes de componentes React

## 📁 Estrutura do Projeto

```
sbn-mfe-repo/
├── apps/
│   ├── host/                    # Aplicação host (container principal)
│   │   ├── src/
│   │   │   ├── api/            # API client de autenticação
│   │   │   ├── auth/           # Provider de autenticação
│   │   │   ├── components/     # Componentes compartilhados do host
│   │   │   ├── pages/         # Páginas da aplicação
│   │   │   ├── theme/         # Provider de tema
│   │   │   └── types/         # Tipos TypeScript
│   │   ├── rsbuild.config.ts  # Configuração do Rsbuild + Module Federation
│   │   └── package.json
│   │
│   └── sbn-finance-mfe/        # Micro frontend de finanças
│       ├── src/
│       │   ├── api/           # API client de finanças
│       │   ├── components/    # Componentes do módulo financeiro
│       │   ├── types/         # Tipos TypeScript
│       │   └── App.tsx        # Componente principal exposto via Module Federation
│       ├── rsbuild.config.ts  # Configuração do Rsbuild + Module Federation
│       └── package.json
│
└── packages/
    ├── ui/                     # Biblioteca de componentes UI compartilhados
    │   ├── src/
    │   │   ├── lib/           # Utilitários (utils, cn)
    │   │   └── *.tsx          # Componentes (button, card, dialog, etc.)
    │   └── package.json
    │
    ├── eslint-config/          # Configurações compartilhadas do ESLint
    │   ├── base.js
    │   ├── next.js
    │   └── react-internal.js
    │
    └── typescript-config/      # Configurações compartilhadas do TypeScript
        ├── base.json
        ├── nextjs.json
        └── react-library.json
```

## 🚀 Pré-requisitos

- **Node.js**: >= 18
- **pnpm**: 9.0.0 (gerenciado via `packageManager` no `package.json`)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd sbn-mfe-repo
```

2. Instale as dependências:
```bash
pnpm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração da API base. Crie arquivos `.env` nos diretórios dos apps conforme necessário:

**apps/host/.env** e **apps/sbn-finance-mfe/.env**:
```env
VITE_API_BASE=http://localhost:3000
```

> **Nota**: A variável `VITE_API_BASE` é compartilhada globalmente via `turbo.json` e deve ser configurada para apontar para o backend da aplicação.

## 🎯 Scripts Disponíveis

### Scripts da Raiz

Execute na raiz do monorepo:

```bash
# Desenvolvimento (inicia todos os apps em modo dev)
pnpm dev

# Build de todos os apps e packages
pnpm build

# Lint em todos os projetos
pnpm lint

# Verificação de tipos TypeScript
pnpm check-types

# Formatação de código (Prettier)
pnpm format
```

### Scripts por App/Package

Execute em um app ou package específico:

```bash
# Desenvolvimento de um app específico
cd apps/host
pnpm dev

# Build de um app específico
pnpm build

# Preview do build de produção
pnpm preview

# Testes (quando disponível)
pnpm test
```

### Filtros do Turborepo

Você também pode usar filtros para executar comandos em apps específicos:

```bash
# Desenvolvimento apenas do host
pnpm dev --filter=host

# Build apenas do sbn-finance-mfe
pnpm build --filter=sbn-finance-mfe

# Lint apenas do package ui
pnpm lint --filter=@repo/ui
```

## 💻 Desenvolvimento

### Iniciando o Ambiente de Desenvolvimento

1. **Inicie todos os apps simultaneamente** (recomendado):
```bash
pnpm dev
```

Isso iniciará:
- `host` em `http://localhost:9000`
- `sbn-finance-mfe` em `http://localhost:9001`

2. **Ou inicie apps individualmente**:

Terminal 1 (Host):
```bash
cd apps/host
pnpm dev
```

Terminal 2 (Finance MFE):
```bash
cd apps/sbn-finance-mfe
pnpm dev
```

### Como Funciona o Module Federation

1. **Host App** (`apps/host`):
   - Roda na porta `9000`
   - Configurado como **host** no Module Federation
   - Carrega o remote `sbn_finance_mfe` de `http://localhost:9001`
   - Gerencia autenticação e roteamento principal

2. **Finance MFE** (`apps/sbn-finance-mfe`):
   - Roda na porta `9001`
   - Configurado como **remote** no Module Federation
   - Expõe o componente `./App` para ser consumido pelo host
   - Implementa toda a lógica de gestão financeira

### Estrutura de Autenticação

O **host** gerencia a autenticação e armazena os tokens no `localStorage` sob a chave `sbn-auth-session`. O **sbn-finance-mfe** lê esses tokens para fazer requisições autenticadas à API.

## 🏗️ Build

### Build de Produção

```bash
# Build de todos os apps e packages
pnpm build
```

Os builds serão gerados em:
- `apps/host/dist/`
- `apps/sbn-finance-mfe/dist/`

### Preview Local do Build

```bash
# No diretório do app
cd apps/host
pnpm preview
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes de um app específico
cd apps/host
pnpm test
```

O projeto utiliza **Vitest** como framework de testes e **Testing Library** para testes de componentes React.

## 📦 Apps e Packages

### Apps

#### `host`
Aplicação principal que atua como container dos micro frontends.

**Funcionalidades:**
- Autenticação (Login/Registro)
- Gerenciamento de sessão e tokens
- Roteamento principal
- Carregamento dinâmico de micro frontends remotos
- Dashboard principal
- Integração com módulo financeiro

**Porta**: `9000`

#### `sbn-finance-mfe`
Micro frontend de gestão financeira.

**Funcionalidades:**
- Gestão de carteiras (wallets)
- Gestão de transações (receitas e despesas)
- Gestão de categorias
- Visualização de gráficos (receitas vs despesas)
- Filtros por mês/ano
- Resumo financeiro (saldo total, receitas, despesas)

**Porta**: `9001`

**Componentes principais:**
- `BalanceOverview`: Visão geral do saldo
- `WalletCards`: Cards de carteiras
- `TransactionList`: Lista de transações
- `CategoryGrid`: Grid de categorias
- `IncomeExpenseChart`: Gráfico de receitas vs despesas

### Packages

#### `@repo/ui`
Biblioteca de componentes UI compartilhados baseada em Radix UI e Shadcn UI.

**Componentes disponíveis:**
- `Button`, `Card`, `Dialog`, `AlertDialog`
- `Input`, `Textarea`, `Label`, `Select`
- `Tabs`, `Switch`, `Badge`, `Code`, `Form`

#### `@repo/eslint-config`
Configurações compartilhadas do ESLint.

**Configurações:**
- `base`: Configuração base
- `next-js`: Para projetos Next.js
- `react-internal`: Para projetos React internos

#### `@repo/typescript-config`
Configurações compartilhadas do TypeScript.

**Configurações:**
- `base.json`: Configuração base
- `nextjs.json`: Para projetos Next.js
- `react-library.json`: Para bibliotecas React

## 🔧 Configuração do Module Federation

### Host Configuration (`apps/host/rsbuild.config.ts`)

```typescript
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    sbn_finance_mfe: 'sbn_finance_mfe@http://localhost:9001/mf-manifest.json',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-router-dom': { singleton: true, eager: true },
  },
})
```

### Remote Configuration (`apps/sbn-finance-mfe/rsbuild.config.ts`)

```typescript
new ModuleFederationPlugin({
  name: 'sbn_finance_mfe',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-router-dom': { singleton: true },
  },
})
```

## 🐳 Docker

Cada app possui um `Dockerfile` para containerização:

```bash
# Build da imagem
docker build -t sbn-host ./apps/host
docker build -t sbn-finance-mfe ./apps/sbn-finance-mfe

# Executar container
docker run -p 9000:9000 sbn-host
docker run -p 9001:9001 sbn-finance-mfe
```

## 📝 Convenções de Código

- **TypeScript**: Todo o código é tipado
- **ESLint**: Linting configurado em todos os projetos
- **Prettier**: Formatação automática de código
- **Conventional Commits**: Padrão de commits recomendado

## 🔗 Links Úteis

### Documentação
- [Turborepo](https://turborepo.com/docs)
- [Rsbuild](https://rsbuild.rs)
- [Module Federation](https://module-federation.io)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)

### Ferramentas
- [Turborepo Remote Cache](https://turborepo.com/docs/core-concepts/remote-caching)
- [Vercel Remote Cache](https://vercel.com/docs/monorepos/remote-caching)

## 🤝 Contribuindo

1. Crie uma branch a partir de `main`
2. Faça suas alterações
3. Execute os testes e lint: `pnpm test && pnpm lint`
4. Faça commit seguindo o padrão Conventional Commits
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado.

---

**Desenvolvido com ❤️ usando Turborepo, React e Module Federation**
