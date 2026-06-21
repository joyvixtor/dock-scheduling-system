# Subgrafo Inbound

O subgrafo `inbound` atua como o epicentro do ecossistema de recebimentos no centro logístico. 

## Responsabilidades
- **Davenport Inbound Docks**: Gerenciamento direto da disponibilidade física das docas de entrada (Inbound Docks) (status `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`), verificando também necessidades de refrigeração.
- **Dono de Entidades Fundamentais (Products)**: Este subgrafo é o dono primário (Origin) da entidade `Product`. É nele onde são validados e consultados os nomes, categorias e a taxonomia de cada `sku`.

## Papel na Federação (Federation)
Através do Schema, este subgrafo provê as query primárias de pesquisa global, como a query `productBySku(sku: ID!)`.
Quando o cliente chama essa query de busca do produto pedindo informações secundárias (como dados das transferências de crossdock daquele produto), o roteador aciona o `inbound` primariamente, extrai a casca base do Produto e, em seguida, dispara para o `crossdock` resolver o restante da árvore de dados utilizando a chave `@key(fields: "sku")`.
