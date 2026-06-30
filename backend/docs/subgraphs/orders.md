# Subgrafo Orders

O subgrafo `orders` é responsável por representar e gerenciar as entidades de Pedido (Orders) dentro da arquitetura logística.

## Responsabilidades
- **Tabela Orders**: Armazena registros primários no banco de dados com UUIDs, quantidade requisitada, status (como `PENDING_BACKORDER`, `ALLOCATED`) e o principal elo de comunicação com o restante da logística: a propriedade `sku`.

## Papel na Federação (Federation)
O subgrafo Orders estende a entidade externa `Product` (cujo dono primário é o subgrafo `inbound`).
Através da anotação de Federation `extend type Product @key(fields: "sku")`, o Orders se responsabiliza de fornecer os campos referentes a encomendas de um Produto sem ser dono da tabela de produtos.

Caso outro subgrafo requisitar a propriedade de um produto e esse produto possuir histórico de "pedidos", o roteador delega para o Orders buscar essas informações de forma cruzada.

## O Ciclo Completo do Pedido
No nosso modelo guiado pela demanda (*Demand-driven*):
1. Um pedido é criado via a mutation `createOrder(sku, quantity)` e ganha o status **PENDING**.
2. O subgrafo `appointments` agora armazena uma coluna `orderId`, associando um caminhão agendado diretamente ao pedido pendente.
3. Quando o caminhão descarrega o produto e sai do pátio, a interface dispara a mutation `completeOrder(id)`.
4. O status do Pedido muda para **SHIPPED**, o que efetua um *soft-delete* desse pedido das visões pendentes e completa o fluxo logístico de ponta a ponta.
