# Arquitetura do Davenport

O ecossistema Davenport é construído sobre o paradigma de **Microsserviços Federados**, utilizando **Go** para alta performance e **Apollo Federation** para disponibilizar uma API GraphQL unificada para os clientes.

## 🗺️ Mapa da Arquitetura

```text
[ Cliente (Frontend / API) ]
           │
           ▼ (GraphQL Query)
[ Apollo Router Gateway :8000 ]
           │
           ├──────────────► [ Orders Subgraph :8081 ] ──────► ( Orders Postgres DB :5433 )
           │
           ├──────────────► [ Inbound Subgraph :8082 ] ─────► ( Inbound Postgres DB :5434 )
           │
           └──────────────► [ Crossdock Subgraph :8083 ] ───► ( Crossdock Postgres DB :5435 )
```

## 🧱 Componentes Principais

### 1. Go Workspace (`go.work`)
Para evitar a necessidade de gerenciar múltiplos repositórios separados para cada microsserviço (ou lidar com hacks de `replace` no Go Modules), o projeto backend é estruturado como um **Go Workspace**.
Isso significa que as pastas `orders`, `inbound` e `crossdock` são módulos Go totalmente independentes, mas que podem ser compilados, analisados e refatorados simultaneamente na mesma janela do seu editor de código (como o VSCode).

### 2. Live Reload (Air)
O comando `make dev` executa a ferramenta [Air](https://github.com/air-verse/air) dentro de cada subgrafo paralelamente. Qualquer alteração em um arquivo `.go` irá recompilar automaticamente o binário isolado daquele serviço e reiniciá-lo em questão de milissegundos, sem precisar derrubar o ecossistema inteiro.

### 3. Clean Architecture
Cada subgrafo possui internamente a sua própria Clean Architecture:
- `cmd/server/`: Ponto de entrada e injeção de dependências.
- `internal/delivery/graphql/`: Camada de borda, mapeando resolvers para casos de uso.
- `internal/usecase/`: Lógica de negócio e orquestração.
- `internal/repository/`: Acesso a dados (Postgres) e integrações (HTTP Clients).

### 4. Isolamento de Bancos de Dados
Cada microsserviço tem o seu próprio banco de dados Postgres independente orquestrado no `docker-compose.yml`. Eles **não compartilham tabelas** e não se comunicam via banco. Toda a comunicação entre contextos acontece através de resolução de entidades no GraphQL (Federation) ou requisições HTTP internas.
