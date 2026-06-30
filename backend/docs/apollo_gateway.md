# 🌐 Apollo Gateway & GraphQL Federation

O coração comunicativo do sistema de docas é o **Apollo Router**. Ele atua como o regente de uma orquestra, garantindo que o Frontend (React) não precise saber da existência de 5 microsserviços separados.

## Como a Federação Funciona

1. **Os Subgrafos (Microsserviços)**
   Cada serviço em Go define apenas o "pedaço" de esquema GraphQL que lhe diz respeito. Por exemplo, o Inbound sabe sobre `InboundDock`, mas não sabe absolutamente nada sobre `Appointment`.
   Eles utilizam as diretivas do Apollo Federation (como `@key`, `@extends` e `@external`) para conectar entidades lógicas de bancos de dados diferentes.

2. **O Supergrafo (Supergraph)**
   É o mapa completo de todas as tipagens somadas de todos os microsserviços. 
   Quando você roda `make compose`, a ferramenta de CLI do Apollo (`Rover` ou script Bash `compose.sh`) lê todos os `schema.graphqls` locais e gera o grandioso `supergraph-schema.graphql`.

3. **O Roteador (Apollo Router)**
   O arquivo binário do Router sobe na porta `:8000`. Ele carrega o `supergraph-schema.graphql`.
   Quando o React pede a lista de tarefas da empilhadeira junto com os dados da Doca de Inbound, o Router percebe que precisa pedir as tarefas para a porta `:8083` (Crossdock), extrair o ID da doca, e paralelamente pedir as informações da doca para a porta `:8082` (Inbound). Ele funde os dois JSONs num só e envia de volta ao cliente.

## Scripts de Manutenção

- **Compor o Esquema:** `make compose` (Gera o supergrafo).
- **Rodar o Router:** `make router` (Roda o gateway isoladamente baseando-se no `router-config.yaml`).
- **Live-Reload de Tudo:** `make dev` (Dispara o Docker, compõe o supergrafo, sobe os 5 microsserviços no `Air` e o `Router` em paralelo).
