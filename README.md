# 🚚 Davenport Dock Scheduling & Crossdocking System

Bem-vindo ao **Davenport Dock Scheduling**, um sistema avançado de gestão logística e orquestração de pátios (Yard Management). Este projeto modela o fluxo de ponta a ponta de um centro de distribuição logístico altamente movimentado.

## 🌟 Arquitetura

O sistema é dividido em duas grandes partes:

1. **Backend (Supergraph GraphQL Federation):**
   Composto por **5 microsserviços em Go (Golang)** totalmente independentes. Cada um possui seu próprio banco de dados PostgreSQL.
   Eles são unidos por um **Gateway Apollo Router (Rust)** que expõe uma única API GraphQL unificada na porta `:8000`.
   - `Appointments`: Gerencia agendamentos de caminhões (Check-in/Checkout).
   - `Inbound`: Gerencia as 31 docas de entrada físicas.
   - `Outbound`: Gerencia as 31 docas de saída físicas.
   - `Crossdock`: O cérebro orquestrador. Roteia paletes do Inbound para o Outbound dinamicamente.
   - `Orders`: (Opcional) Gerencia pedidos corporativos e SKUs.

2. **Frontend (Portal React):**
   Um aplicativo de interface gráfica rico desenvolvido com **React, Vite e TailwindCSS**. Ele oferece visões de comando exclusivas para Gerentes de Pátio e Operadores de Empilhadeira, consumindo dados do Gateway GraphQL.

## 🚀 Como Rodar o Projeto

Para subir toda a infraestrutura localmente com suporte a *live-reload* nos microsserviços:

### 1. Iniciar o Backend
Abra uma janela do terminal e execute:
```bash
cd backend
make dev
```
> O comando mágico `make dev` sobe todos os contêineres do PostgreSQL no Docker, compila o Supergrafo do GraphQL, levanta o Apollo Router na porta `:8000` e dispara todos os 5 microsserviços Go utilizando o **Air** para hot-reload.

### 2. Iniciar o Frontend
Em outra janela do terminal, execute:
```bash
cd frontend
npm install
npm run dev
```
> O painel administrativo estará disponível em `http://localhost:5173`.

## 📚 Documentação Adicional

Documentações profundas da arquitetura, subgrafos e decisões técnicas podem ser encontradas nas pastas de `docs` de cada pacote:

- **[Documentação do Backend (GraphQL & Arquitetura)](backend/docs/architecture_overview.md)**
- **[Documentação do Frontend (React & UX)](frontend/docs/frontend_overview.md)**
