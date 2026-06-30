# 🎨 Frontend Overview (Portal Logístico)

O Frontend do **Davenport Dock Scheduling** foi desenvolvido para ser o cérebro operacional visível para todos os funcionários do galpão, desde os que operam nos tablets das empilhadeiras até o gerente sentado na Torre de Controle.

## 🛠️ Tecnologias Utilizadas

- **Framework:** React + Vite (Rápido, leve e moderno).
- **Linguagem:** TypeScript (Segurança de tipos nos componentes).
- **Estilização:** TailwindCSS (Para criação de UI premium e designs dinâmicos).
- **Comunicação de Dados:** Apollo Client (`@apollo/client`), configurado para bater unicamente na porta `:8000` do Apollo Router Gateway.
- **Ícones & UI:** Lucide React (Ícones SVG) e shadcn/ui (Componentes estruturais).

## 📱 Atores e Fluxo de Telas

O sistema foi arquitetado em 4 telas principais. Nenhuma tela opera em silo; todas reagem a uma fonte de verdade (o Apollo Cache ou subgrafos GraphQL) que as conecta perfeitamente.

### 1. 🛃 Terminal de Entrada (`/gate`)
* `GateCheckIn.tsx`
* **Usuário:** Motorista da Transportadora ou Porteiro.
* **Função:** Criar o bloco de agendamento (Appointment) selecionando a doca e os detalhes de carga.

### 2. 📅 Agenda de Docas (`/schedule`)
* `DockSchedule.tsx`
* **Usuário:** Gerente do Pátio (Yard Manager).
* **Função:** Gerenciamento reativo. O Gerente aperta "Confirmar Chegada". A interface dispara mutations para o microsserviço de *Appointments* e *Inbound/Outbound*, convertendo o bloco de Agenda em operações reais.

### 3. 🗺️ Visão Geral (Dashboard) (`/`)
* `WarehouseDashboard.tsx`
* **Usuário:** Galpão (TV de monitoramento).
* **Função:** Usa as coordenadas físicas das docas para montar um mapa topográfico com CSS Grid. Usa um polling simples (GraphQL Query) a cada 3 segundos para piscar quais portas acabaram de ser ocupadas ou entraram em manutenção preventiva.

### 4. 🚜 Fila do Operador (`/queue`)
* `OperatorQueue.tsx`
* **Usuário:** Operador de Empilhadeira.
* **Função:** Recebe as ordens de movimentação (*TransferTasks*) criadas automaticamente quando o Gerente aperta "Chegada". É um checklist de trabalho com botões simples: "Aceitar" e "Confirmar Entrega".

## 🚀 Estrutura de Pastas

- `/src/pages`: As telas completas do sistema (cada uma mapeada numa rota).
- `/src/components`: Componentes reutilizáveis de UI (Badges, Buttons, Alerts).
- `/src/lib`: Configuração do Apollo Client e utilitários de CSS (`cn`).
- `/src/graphql`: Tipagens geradas (caso você utilize `graphql-codegen` no futuro para extrair tipos estritos do supergrafo).
