# 🏗️ Arquitetura Geral do Sistema (Davenport Dock Scheduling)

Este documento descreve a arquitetura de alto nível do sistema de agendamento de docas e crossdocking.

## 1. Visão Geral
O sistema adota uma arquitetura baseada em **Microsserviços** utilizando **GraphQL Federation**. Ao invés de um monólito, as responsabilidades do domínio logístico foram separadas em serviços independentes que se comunicam de forma transparente.

## 2. Componentes Principais

### Frontend (Portal React)
- **Tecnologia:** React + Vite, TailwindCSS, Apollo Client.
- **Responsabilidade:** Interface do usuário para Gerentes de Pátio (Agenda, Dashboard Topográfico) e Operadores de Empilhadeira (Fila de Tarefas).
- **Comunicação:** Faz requisições HTTP apenas para o **Gateway (Apollo Router)**.

### API Gateway (Apollo Router)
- **Porta:** `:8000`
- **Tecnologia:** Apollo Router (Rust).
- **Responsabilidade:** Ponto único de entrada para o Frontend. Ele recebe a "Super" Query do React, quebra em sub-consultas, dispara para os microsserviços corretos, compila as respostas e devolve ao frontend num único JSON.

### Microsserviços (Subgrafos)
Todos os microsserviços são escritos em **Go (Golang)**, seguindo a arquitetura limpa (Clean Architecture), e utilizam a biblioteca `gqlgen` para expor APIs GraphQL.

1. **Appointments (Agendamentos)** - Porta `:8081`
2. **Inbound (Recebimento)** - Porta `:8082`
3. **Crossdock (Orquestração de Transferência)** - Porta `:8083`
4. **Outbound (Expedição)** - Porta `:8084`
5. **Orders (Pedidos/Vendas)** - Porta `:8085`

## 3. Bancos de Dados
- **Tecnologia:** PostgreSQL via Docker.
- **Padrão:** Cada microsserviço possui o **seu próprio banco de dados isolado** (ex: `davenport_inbound`, `davenport_crossdock`). Não há junções (JOINs) diretas de SQL entre domínios. Se o Crossdock precisar de informações de Inbound, ele fará uma requisição HTTP via GraphQL.

## 4. O Fluxo de Dados (Crossdocking Life Cycle)
1. **Pedidos de Clientes (Demand-Driven):** O fluxo inicia no subgrafo **Orders**, onde pedidos ficam pendentes aguardando estoque.
2. **Terminal de Entrada (Check-in):** Um motorista só pode reservar uma doca no **Appointments** se a sua carga estiver atrelada a um *Pedido de Cliente Pendente* (associando o `orderId`).
3. **Chegada:** O Frontend dispara mutation `updateAppointmentStatus(ARRIVED)`. O **Appointments** atualiza o banco local.
4. **Alocação Física:** O Frontend dispara `updateInboundDockStatus(OCCUPIED)` para travar a doca física no **Inbound**.
5. **Crossdocking:** O Frontend dispara `scanInboundPallet(...)`. O **Crossdock** recebe a carga, consulta o **Outbound** via HTTP para achar a doca de saída mais próxima, e cria a tarefa da empilhadeira (TransferTask).
6. **Movimentação:** A **Fila do Operador** no Frontend faz polling no Crossdock para ver a tarefa, aceita e finaliza a transferência.
7. **Saída e Conclusão:** O Frontend avisa a todos os serviços que o caminhão partiu (`COMPLETED`). Silenciosamente, dispara `completeOrder(id)` para alterar o status do Pedido para `SHIPPED`, fechando o ciclo logístico e deletando (soft-delete) o pedido da fila!
