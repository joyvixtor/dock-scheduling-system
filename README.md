# Davenport Dock Scheduling System

Sistema de logística avançado desenhado com microsserviços em **Go** e orquestrado por um **GraphQL Supergraph** (Apollo Federation).

Este repositório serve como a espinha dorsal de um centro de distribuição e logística, gerindo entradas (Inbound Docks), pedidos pendentes e em progresso (Orders), e as tarefas de cruzamento e transferência (Crossdocking) dentro do armazém.

## 🚀 Como Rodar o Projeto

Para subir toda a infraestrutura e os subgrafos (com live-reload nativo e roteamento automático pelo Gateway), utilizamos um Makefile unificado.

**Requisitos**:
- Docker & Docker Compose
- Go 1.25+
- Make

1. **Baixe as dependências e inicie o ambiente:**
   Entre na pasta `backend/` e rode:
   ```bash
   make dev
   ```

Este único comando irá:
1. Subir as três instâncias de banco de dados (Postgres) via Docker.
2. Compor o Supergrafo unificando todos os esquemas GraphQL espalhados pelas pastas dos subgrafos.
3. Iniciar os três serviços Go (`orders`, `inbound`, `crossdock`) com suporte a hot-reload via **Air**.
4. Fazer o download e rodar o **Apollo Router Gateway** na porta `8000`, pronto para receber consultas!

## 📚 Documentação

A documentação aprofundada da arquitetura pode ser encontrada dentro do diretório `backend/docs/`.
- [Arquitetura Geral](backend/docs/architecture.md)
- [Gateway e Supergrafo](backend/docs/supergraph.md)
- [Subgrafo Orders](backend/docs/subgraphs/orders.md)
- [Subgrafo Inbound](backend/docs/subgraphs/inbound.md)
- [Subgrafo Crossdock](backend/docs/subgraphs/crossdock.md)
