# Subgrafo Crossdock

O subgrafo `crossdock` é o serviço responsável pelas operações intra-armazém. Ele cuida especificamente da transição física dos itens que chegaram (Inbound) para a área de expedição (Outbound).

## Responsabilidades
- **Transfer Tasks**: Gerencia as tarefas de transferência. Cada tarefa registra qual produto (`sku`), a quantidade a ser movimentada, doca de entrada e doca de saída, além do operador encarregado. Status incluem `CREATED`, `TRANSIT`, e `COMPLETED`.
- **Comunicação Direta**: Apesar do ecossistema usar federação GraphQL prioritariamente, este microsserviço também consome o serviço do `orders` em cenários pontuais via chamada HTTP direta (utilizando clientes REST/GraphQL internos configurados com a variável de ambiente `ORDERS_GRAPHQL_URL`), representando uma solução robusta híbrida para necessidades de sincronismo entre serviços internos.

## Papel na Federação (Federation)
Assim como o `orders`, o subgrafo de `crossdock` estende o tipo principal `Product`. Ele é responsável por popular a lista dinâmica de `activeTransferTasks` quando alguém tenta renderizar um produto inteiro através do Supergrafo.
Ele resolve essas entidades recebendo um Representation (via o gerador interno `FindProductBySku`), filtrando as tarefas de transferência pendentes daquele determinado SKU.
