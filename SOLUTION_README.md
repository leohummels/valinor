# Kanban Board — Full-Stack Application

Aplicação Kanban completa com **Angular 17**, **NestJS 10**, **GraphQL**, **WebSockets** e **PostgreSQL**, estruturada como monorepo com pnpm workspaces.

> **Live Demo**: Frontend em [Netlify](https://netlify.com) | Backend em [Render](https://render.com)

---

## Sumário

- [Como Executar](#como-executar)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Framework, Linguagem e Ferramentas](#framework-linguagem-e-ferramentas)
- [Tecnologias X e Y — Justificativas](#tecnologias-x-e-y--justificativas)
- [Princípios de Software](#princípios-de-software)
- [Testes de Software](#testes-de-software)
- [Desafios e Problemas](#desafios-e-problemas)
- [Melhorias e Próximas Implementações](#melhorias-e-próximas-implementações)

---

## Como Executar

### Pré-requisitos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** (local ou remoto)

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd valinor

# Instale as dependências
pnpm install
```

### Desenvolvimento

```bash
# Iniciar frontend (Angular) + backend (NestJS) simultaneamente
pnpm dev

# Ou separadamente:
pnpm --filter frontend dev   # http://localhost:4200
pnpm --filter backend dev    # http://localhost:3000
```

### Build de Produção

```bash
pnpm build
```

### Executar Testes

```bash
# Testes unitários (todos os packages)
pnpm test

# Testes E2E (Cypress)
pnpm e2e

# Lint em todo o monorepo
pnpm lint
```

---

## Arquitetura do Projeto

### Visão Geral — Monorepo

O projeto utiliza uma arquitetura **monorepo** gerenciada por **pnpm workspaces**, permitindo compartilhamento de tipos e configurações entre frontend e backend.

```
valinor/
├── apps/
│   ├── backend/          # API NestJS + GraphQL + WebSockets
│   └── frontend/         # SPA Angular 17 + Material + Apollo
├── packages/
│   └── shared-types/     # Interfaces, DTOs e enums compartilhados
├── package.json          # Scripts do workspace raiz
├── pnpm-workspace.yaml   # Configuração do monorepo
├── commitlint.config.js  # Conventional Commits
├── lint-staged.config.js # Pre-commit hooks (Prettier + ESLint)
└── netlify.toml          # Deploy do frontend
```

### Backend — NestJS

A API segue a arquitetura modular do NestJS, com separação clara de responsabilidades:

```
apps/backend/src/
├── main.ts                 # Bootstrap com ValidationPipe global e CORS
├── app.module.ts           # Módulo raiz (GraphQL, TypeORM, WebSocket)
├── schema.gql              # Schema GraphQL auto-gerado
├── config/
│   ├── typeorm.config.ts   # Configuração do PostgreSQL
│   └── seed.service.ts     # Seed de dados iniciais
├── gateways/
│   └── kanban.gateway.ts   # WebSocket Gateway (Socket.io)
└── modules/
    ├── boards/             # CRUD de Boards
    │   ├── boards.module.ts
    │   ├── boards.resolver.ts
    │   ├── boards.service.ts
    │   ├── entities/board.entity.ts
    │   └── dto/
    ├── columns/            # CRUD de Columns + ordenação
    │   ├── columns.module.ts
    │   ├── columns.resolver.ts
    │   ├── columns.service.ts
    │   ├── entities/column.entity.ts
    │   └── dto/
    └── cards/              # CRUD de Cards + movimentação
        ├── cards.module.ts
        ├── cards.resolver.ts
        ├── cards.service.ts
        ├── entities/card.entity.ts
        └── dto/
```

**Padrões adotados:**

- **Module Pattern**: Cada domínio (boards, columns, cards) é um módulo NestJS independente com seu resolver, service e entity.
- **Soft Delete**: Todas as entidades utilizam `DeleteDateColumn` do TypeORM, permitindo recuperação de dados excluídos.
- **UUID como Primary Key**: IDs gerados automaticamente via `uuid`, evitando colisões e previsibilidade.
- **GraphQL Code-First**: Schema gerado automaticamente a partir dos decorators TypeScript, garantindo type-safety entre schema e código.
- **WebSocket Broadcasting**: Operações de escrita (create, update, delete, move) emitem eventos via Socket.io para sincronização real-time entre clientes.

**API GraphQL — Operações disponíveis:**

| Tipo     | Operação       | Descrição                                |
| -------- | -------------- | ---------------------------------------- |
| Query    | `boards`       | Lista todos os boards                    |
| Query    | `board(id)`    | Detalha board com colunas e cards        |
| Query    | `columns`      | Lista colunas (filtro por boardId)       |
| Query    | `cards`        | Lista cards (filtro por columnId)        |
| Mutation | `createBoard`  | Cria novo board                          |
| Mutation | `updateBoard`  | Atualiza título do board                 |
| Mutation | `deleteBoard`  | Remove board (soft delete)               |
| Mutation | `createColumn` | Cria coluna com auto-incremento de ordem |
| Mutation | `updateColumn` | Atualiza coluna                          |
| Mutation | `deleteColumn` | Remove coluna (soft delete)              |
| Mutation | `createCard`   | Cria card com metadados                  |
| Mutation | `updateCard`   | Atualiza card                            |
| Mutation | `deleteCard`   | Remove card (soft delete)                |
| Mutation | `moveCard`     | Move card entre colunas com reordenação  |

### Frontend — Angular 17

O frontend utiliza **standalone components** (sem NgModules) e lazy loading:

```
apps/frontend/src/
├── main.ts
├── styles.scss              # Reset global + scrollbar customizado
├── app/
│   ├── app.component.ts     # Shell (toolbar + router-outlet)
│   ├── app.config.ts        # Providers (Apollo, Router, Material)
│   ├── app.routes.ts        # Lazy loading do KanbanComponent
│   ├── core/
│   │   ├── graphql/
│   │   │   └── operations.ts  # Queries e Mutations Apollo
│   │   └── socket/
│   │       └── socket.service.ts  # Wrapper Socket.io como Observable
│   ├── features/
│   │   └── kanban/
│   │       ├── kanban.component.ts/html/scss
│   │       └── components/
│   │           ├── kanban-column/    # Coluna com drag/drop de cards
│   │           ├── kanban-card/      # Card com metadados e menu
│   │           ├── add-card-dialog/  # Formulário de criação
│   │           ├── card-detail-dialog/ # Edição de card
│   │           └── add-column-dialog/  # Criação de coluna
│   └── styles/
│       ├── _variables.scss   # Design tokens
│       └── _mixins.scss      # Responsive + layout helpers
└── environments/
    ├── environment.ts        # Dev (localhost:3000)
    └── environment.prod.ts   # Prod (Render)
```

**Padrões adotados:**

- **Standalone Components**: Sem NgModules — cada componente declara suas próprias dependências, simplificando o tree-shaking e a manutenção.
- **Smart/Dumb Components**: `KanbanComponent` (smart) gerencia estado e comunicação; `KanbanColumnComponent` e `KanbanCardComponent` (dumb) recebem dados via `@Input` e emitem eventos via `@Output`.
- **Lazy Loading**: O módulo Kanban é carregado sob demanda pela rota default.
- **Reactive Forms**: Formulários de criação/edição utilizam `FormGroup` com validação nativa do Angular.
- **Socket como Observable**: O `SocketService` encapsula Socket.io expondo eventos como `Observable<T>`, integrando-se naturalmente ao ecossistema RxJS do Angular.
- **Design Token System**: Variáveis SCSS centralizadas para cores, espaçamento e breakpoints, garantindo consistência visual.

### Shared Types

O pacote `shared-types` centraliza interfaces, DTOs e enums usados por ambos frontend e backend:

- **Interfaces**: `IBoard`, `IColumn`, `ICard` — contratos de dados compartilhados.
- **DTOs**: `CreateBoardDto`, `UpdateCardDto`, `MoveCardDto`, etc. — validação consistente.
- **Socket Events Enum**: `BOARD_CREATED`, `CARD_MOVED`, `COLUMN_DELETED`, etc. — nomes de eventos tipados para WebSocket.

### Comunicação Real-Time

```
┌──────────┐  GraphQL (HTTP)   ┌───────────┐  TypeORM   ┌────────────┐
│  Angular  │ ───────────────→ │  NestJS   │ ─────────→ │ PostgreSQL │
│  Apollo   │ ←─────────────── │  Resolvers│ ←───────── │            │
└──────────┘                   └───────────┘            └────────────┘
      ↕ Socket.io (WS)             ↕
┌──────────┐                   ┌───────────┐
│  Socket  │ ←────────────────→│  Gateway  │
│  Service │  card:moved       │  Kanban   │
└──────────┘  column:created   └───────────┘
              board:updated
```

O fluxo de dados combina:

1. **GraphQL** para operações CRUD (queries e mutations via Apollo Client).
2. **Socket.io** para broadcasting em tempo real — quando um usuário cria, edita ou move um card, todos os clientes conectados ao mesmo board recebem a atualização instantaneamente.

---

## Framework, Linguagem e Ferramentas

### Linguagens

| Linguagem      | Uso                                      |
| -------------- | ---------------------------------------- |
| **TypeScript** | Linguagem principal (frontend + backend) |
| **SCSS**       | Estilos com variáveis e mixins           |
| **GraphQL**    | Schema da API                            |

### Frameworks e Bibliotecas Core

| Ferramenta           | Versão | Propósito                                            |
| -------------------- | ------ | ---------------------------------------------------- |
| **Angular**          | 17.3   | Framework frontend (standalone components)           |
| **NestJS**           | 10.3   | Framework backend (modular, DI, decorators)          |
| **Angular Material** | 17.3   | Componentes UI (cards, dialogs, toolbar, drag/drop)  |
| **Angular CDK**      | 17.3   | Drag & Drop nativo para reordenação de cards/colunas |
| **Apollo Client**    | 3.9    | Cliente GraphQL com cache e observables              |
| **Apollo Server**    | 4.10   | Servidor GraphQL integrado ao NestJS                 |
| **TypeORM**          | 0.3    | ORM com entities decoradas e migrations              |
| **Socket.io**        | 4.7    | WebSocket para comunicação real-time                 |
| **PostgreSQL**       | —      | Banco de dados relacional                            |
| **RxJS**             | 7.8    | Programação reativa (observables, operators)         |

### Ferramentas de Qualidade

| Ferramenta                  | Propósito                             |
| --------------------------- | ------------------------------------- |
| **Cypress** 13.6            | Testes E2E integrados                 |
| **Jest** 29.7               | Testes unitários backend              |
| **Karma + Jasmine**         | Testes unitários frontend             |
| **ESLint** + Angular ESLint | Linting de código TypeScript          |
| **Prettier**                | Formatação de código automática       |
| **Commitlint**              | Conventional Commits enforcement      |
| **Husky + lint-staged**     | Git hooks (lint/format no pre-commit) |

### DevOps e Infraestrutura

| Ferramenta          | Propósito                             |
| ------------------- | ------------------------------------- |
| **pnpm workspaces** | Gerenciamento de monorepo             |
| **Netlify**         | Deploy automático do frontend (SPA)   |
| **Render**          | Hosting do backend + PostgreSQL       |
| **Concurrently**    | Execução paralela de processos de dev |

---

## Tecnologias X e Y — Justificativas

### GraphQL ao invés de REST

**Escolha**: GraphQL com Apollo  
**Por que não REST?**

- O Kanban possui relações profundas (Board → Columns → Cards). Com GraphQL, o frontend solicita exatamente os dados que precisa em uma única query, evitando over-fetching e múltiplas requests.
- A query `board(id)` retorna boards com colunas e cards aninhados — em REST, isso exigiria 3 endpoints ou um endpoint com includes complexos.
- Mutations tipadas garantem validação forte entre client e server.
- O schema auto-gerado serve como documentação viva da API.

### Socket.io ao invés de polling ou SSE

**Escolha**: Socket.io via `@nestjs/websockets`  
**Por que não polling?**

- Polling criaria carga desnecessária no servidor e latência perceptível na UI.
- Socket.io oferece comunicação bidirecional real-time com reconexão automática.
- O sistema de rooms permite broadcast seletivo por board, otimizando tráfego.

### Angular Material ao invés de componentes customizados

**Escolha**: Angular Material + CDK  
**Por que não componentes do zero?**

- O CDK DragDrop resolve o drag & drop de cards entre colunas com acessibilidade embutida e animações.
- Material fornece dialogs, forms, toolbar e menus consistentes e acessíveis (WCAG).
- Permite foco no valor de negócio em vez de reinventar componentes de UI.

### TypeORM ao invés de Prisma

**Escolha**: TypeORM  
**Por que não Prisma?**

- TypeORM integra-se nativamente com NestJS via `@nestjs/typeorm` e usa decorators, mantendo consistência com o estilo do framework.
- Suporte nativo a soft deletes (`DeleteDateColumn`).
- Entities são as mesmas classes usadas como ObjectType do GraphQL, reduzindo duplicação.

### pnpm ao invés de npm/yarn

**Escolha**: pnpm workspaces  
**Por que não npm/yarn?**

- pnpm é significativamente mais rápido e eficiente com espaço em disco (content-addressable storage).
- Workspaces nativos com filtros (`--filter`) simplificam a execução de comandos por package.
- Strict mode previne phantom dependencies.

### Standalone Components ao invés de NgModules

**Escolha**: Standalone Components (Angular 17)  
**Por que não NgModules?**

- Desde Angular 14+, standalone é o padrão recomendado.
- Elimina boilerplate de módulos, cada componente declara suas dependências diretamente.
- Melhora tree-shaking e lazy loading.

---

## Princípios de Software

### SOLID

- **Single Responsibility (SRP)**: Cada service é responsável por um único domínio (BoardsService, CardsService, ColumnsService). O KanbanGateway cuida exclusivamente de WebSocket broadcasting.
- **Open/Closed (OCP)**: Novos módulos (ex: labels, users) podem ser adicionados sem modificar os existentes — basta registrar no `AppModule`.
- **Dependency Inversion (DIP)**: Services são injetados via DI do NestJS/Angular, permitindo substituição e testabilidade (mocks nos testes unitários).

### Separation of Concerns

- **Frontend**: Smart components (KanbanComponent) separam lógica de estado dos dumb components (KanbanCard, KanbanColumn) que apenas renderizam e emitem.
- **Backend**: Resolvers delegam lógica para Services; Services são os únicos que acessam o Repository.
- **Shared Types**: Contratos compartilhados evitam drift entre frontend e backend.

### DRY (Don't Repeat Yourself)

- SCSS variables e mixins centralizados evitam duplicação de estilos.
- Shared-types package elimina redefinição de interfaces e DTOs.
- Custom Cypress commands (`addCard`, `addColumn`, `deleteCard`) reutilizam lógica entre suítes de teste.

### Convention over Configuration

- Conventional Commits enforçados via Commitlint (`feat:`, `fix:`, `docs:`, etc.).
- lint-staged executa Prettier + ESLint automaticamente no pre-commit via Husky.
- NestJS CLI schematics padronizam a geração de modules, services e resolvers.

### Defensive Programming

- `ValidationPipe` global com `whitelist: true` no backend rejeita propriedades não declaradas nos DTOs.
- `class-validator` com decorators (`@IsNotEmpty`, `@IsUUID`, `@Min`) valida inputs na borda da API.
- `transform: true` e `implicitConversion: true` garantem tipos corretos nas mutations.

---

## Testes de Software

### Testes Unitários — Backend (Jest)

O backend utiliza **Jest** com repositórios mockados para isolar a lógica dos services:

```typescript
// Exemplo: boards.service.spec.ts
describe('BoardsService', () => {
  it('should be defined', ...);
  it('should return all boards', ...);
  it('should create a board', ...);
});
```

- **Mock Pattern**: Repositórios TypeORM são injetados como mocks, permitindo testar a lógica de negócio sem banco de dados.
- **Execução**: `pnpm --filter backend test`

### Testes E2E — Frontend (Cypress)

O projeto implementa uma suíte completa de **testes end-to-end com Cypress**, cobrindo todos os fluxos críticos do Kanban:

#### Configuração

- **Base URL**: `http://localhost:4200`
- **Viewport**: 1280×720 (desktop)
- **Timeout**: 8s por comando
- **Reset automático**: Antes de cada teste, o estado do board é resetado via GraphQL direto na API, garantindo isolamento total entre cenários.

#### Custom Commands

O projeto define **Cypress Custom Commands** reutilizáveis para operações comuns:

| Comando                 | Descrição                                     |
| ----------------------- | --------------------------------------------- |
| `resetBoardState()`     | Limpa todos os boards e recria fixture padrão |
| `addColumn(title)`      | Abre dialog e cria coluna                     |
| `addCard(column, data)` | Abre dialog e cria card com metadados         |
| `openCardDetail(title)` | Clica no card para abrir detalhes             |
| `deleteCard(title)`     | Remove card via menu de contexto              |
| `deleteColumn(title)`   | Remove coluna via menu de contexto            |
| `getColumnByTitle()`    | Seleciona coluna por título                   |

#### Suítes de Teste

**1. Kanban Board — Estado Inicial** (`kanban-board.cy.ts`)

- ✅ Verifica existência de 3 colunas default (To Do, In Progress, Done)
- ✅ Valida cards nos locais corretos
- ✅ Verifica mensagem "No cards" em colunas vazias
- ✅ Confirma botões "Add Column" e "Add Card" visíveis

**2. Criação de Cards** (`card-creation.cy.ts`)

- ✅ Cria card com apenas título
- ✅ Cria card com todos os campos (descrição, owner, attribution, tester, effort)
- ✅ Valida exibição de chips de metadados
- ✅ Valida que título vazio desabilita submit
- ✅ Testa cancelamento sem salvar
- ✅ Cria múltiplos cards sequencialmente na mesma coluna

**3. Atualização de Cards** (`card-update.cy.ts`)

- ✅ Abre detalhes com dados pré-preenchidos
- ✅ Atualiza título, descrição e metadados
- ✅ Cancela edição sem persistir alterações
- ✅ Valida constraint de título obrigatório
- ✅ Confirma persistência após reabrir card

**4. Exclusão de Cards** (`card-deletion.cy.ts`)

- ✅ Exclui card via menu de contexto
- ✅ Mantém demais cards intactos
- ✅ Exclui último card da coluna (exibe empty state)
- ✅ Exclui todos os cards de uma coluna
- ✅ Exclui card recém-criado

**5. Gerenciamento de Colunas** (`column-management.cy.ts`)

- ✅ Cria nova coluna
- ✅ Valida coluna criada com estado vazio
- ✅ Valida título vazio
- ✅ Cancela criação de coluna
- ✅ Exclui coluna vazia
- ✅ Exclui coluna com cards
- ✅ Exibe snackbar de notificação após operações

#### Execução dos Testes E2E

```bash
# Abre o Cypress interativo (requer frontend rodando)
pnpm --filter frontend cy:open

# Executa todos os testes E2E headless
pnpm --filter frontend cy:run

# Executa E2E com auto-start do servidor
pnpm e2e
```

### Estratégia de Isolamento

Cada teste E2E inicia com um estado limpo:

1. **`beforeEach`** chama `cy.resetBoardState()`
2. Que via GraphQL:
   - Busca todos os boards existentes
   - Deleta cada um via mutation `deleteBoard`
   - Cria um novo board fixture com 3 colunas e 3 cards de exemplo
3. Visita a URL raiz e aguarda o board renderizar

Isso garante **100% de isolamento entre testes**, eliminando falhas por estado residual.

---

## Desafios e Problemas

### Drag & Drop entre Colunas

Implementar o drag & drop de cards entre colunas exigiu o uso do **CDK DragDrop** com `connectedDropLists` dinâmicos. O desafio foi garantir que a lista de IDs conectáveis se atualizasse corretamente quando colunas eram adicionadas ou removidas, e que a reordenação persistisse via mutation `moveCard` com shift de orders.

### Sincronização Real-Time

Combinar GraphQL (request/response) com Socket.io (push) em um mesmo fluxo exigiu cuidado para evitar atualizações duplicadas. A solução foi: após cada mutation, o backend emite o evento via gateway, e o frontend recarrega o board state via query (network-only fetch policy), garantindo consistência.

### Isolamento de Testes E2E

Testes Cypress que dependem de estado compartilhado são frágeis. A solução foi criar custom commands que resetam o estado via chamadas GraphQL diretas à API, sem depender da UI para setup.

### Seed de Dados

O `SeedService` verifica se dados já existem antes de popular, evitando duplicação em restarts do servidor. Isso foi essencial para o ambiente de desenvolvimento e para o deploy em Render.

---

## Melhorias e Próximas Implementações

### Curto Prazo

- **Autenticação e Autorização**: Implementar JWT com guards do NestJS para proteger mutations e associar boards a usuários.
- **Testes unitários do frontend**: Expandir cobertura com Jasmine/Karma para services e components.
- **GraphQL Subscriptions**: Substituir o padrão Socket.io + refetch por subscriptions nativas do GraphQL (graphql-ws) para um modelo de real-time mais integrado.

### Médio Prazo

- **Otimistic UI**: Aplicar atualizações otimistas no Apollo Cache para movimentação de cards, melhorando a percepção de velocidade.
- **Filtros e Busca**: Implementar filtro de cards por owner, tester ou deadline.
- **Labels/Tags**: Adicionar sistema de labels coloridos para categorização de cards.
- **Histórico de Atividades**: Log de ações (audit trail) por card.

### Longo Prazo

- **Multi-board**: Suportar múltiplos boards com navegação.
- **Swimlanes**: Agrupar cards por critérios (owner, prioridade).
- **CI/CD Pipeline**: GitHub Actions com lint, test, build e deploy automáticos.
- **Migrations TypeORM**: Substituir `synchronize: true` por migrations versionadas para segurança em produção.
- **Rate Limiting e Throttling**: Proteger a API contra abuso.

---

## Scripts Disponíveis

| Script       | Comando                         | Descrição             |
| ------------ | ------------------------------- | --------------------- |
| `pnpm dev`   | Concurrently frontend + backend | Desenvolvimento local |
| `pnpm build` | Build de todos os packages      | Build de produção     |
| `pnpm test`  | Jest + Karma                    | Testes unitários      |
| `pnpm lint`  | ESLint em todos os packages     | Linting               |
| `pnpm e2e`   | Cypress + auto-start server     | Testes end-to-end     |

---

_Desenvolvido como solução para o desafio técnico da Field Control._
