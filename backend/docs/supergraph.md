# Gateway e Supergrafo

O **Supergrafo** é o cérebro da arquitetura de federação. Ele funciona aglutinando diferentes sub-esquemas (Orders, Inbound, Crossdock) em um único grande esquema (Supergrafo), mascarando a divisão interna e entregando uma única API GraphQL pública.

Toda a infraestrutura relacionada ao supergrafo está isolada na pasta `gateway/`.

## 🔄 Fluxo de Composição

Antes de o roteador subir, o esquema unificado precisa ser validado e fundido. Isso é feito automaticamente pelo comando `make compose` através do script `gateway/compose.sh`.

1. O script instala a CLI do **Rover** (da Apollo) se ela não estiver presente.
2. Ele gera um arquivo temporário `.supergraph-config.yaml` que indica ao Rover onde estão as rotas e os arquivos `.graphqls` de cada subgrafo.
3. O Rover analisa os esquemas isolados em busca de conflitos ou erros de anotações (como as diretivas `@key`, `@external` ou `@requires`).
4. Um único grande arquivo compilado é cuspido em `gateway/supergraph-schema.graphql`.

## 🚦 Apollo Router

O **Apollo Router** é um binário escrito em Rust extremamente otimizado (muito mais rápido que o antigo Apollo Gateway baseado em Node.js).
Ele é inicializado consumindo o arquivo compilado `supergraph-schema.graphql` e obedece as configurações de rede globais definidas em `gateway/router-config.yaml` (como regras de CORS, propagação de erros, limites de complexidade, etc).

Quando uma requisição chega no Router (ex: `http://localhost:8000/graphql`), ele elabora um **Plano de Execução (Query Plan)** e dispara as chamadas paralelas em subgrafos necessários (portas 8081, 8082, 8083), aglutina a resposta e a devolve em formato JSON limpo.
