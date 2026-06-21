# Subgrafo Orders

O subgrafo `orders` é responsável por representar e gerenciar as entidades de Pedido (Orders) dentro da arquitetura logística.

## Responsabilidades
- **Tabela Orders**: Armazena registros primários no banco de dados com UUIDs, quantidade requisitada, status (como `PENDING_BACKORDER`, `ALLOCATED`) e o principal elo de comunicação com o restante da logística: a propriedade `sku`.

## Papel na Federação (Federation)
O subgrafo Orders estende a entidade externa `Product` (cujo dono primário é o subgrafo `inbound`).
Através da anotação de Federation `extend type Product @key(fields: "sku")`, o Orders se responsabiliza de fornecer os campos referentes a encomendas de um Produto sem ser dono da tabela de produtos.

Caso outro subgrafo requisitar a propriedade de um produto e esse produto possuir histórico de "pedidos", o roteador delega para o Orders buscar essas informações de forma cruzada.
