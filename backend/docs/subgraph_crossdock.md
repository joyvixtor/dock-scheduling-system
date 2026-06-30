# 🔄 Subgrafo: Crossdock

O serviço de Crossdock é o cérebro da orquestração de cargas. Ele não possui armazéns ou paletes próprios estáticos; seu foco é o movimento de mercadorias.

## Responsabilidades
- **TransferTasks (Tarefas de Empilhadeira):** Controla as missões que aparecem na tela "Fila do Operador".
- **Inteligência de Roteamento:** É capaz de encontrar a doca de saída (Outbound) ideal e fisicamente mais próxima da doca de entrada (Inbound) para reduzir a distância percorrida pelas empilhadeiras.

## Comunicação Inter-Serviços
Diferente da maioria dos subgrafos que apenas respondem a dados passivos, o Crossdock age como um **cliente ativo**.
- Ao receber a chamada de `scanInboundPallet`, o código em Go abre chamadas HTTP para o microsserviço de **Outbound** (`ClosestEmptyOutboundDock`) para descobrir qual a doca disponível mais perto das coordenadas $(X, Y)$ da doca de Inbound atual.

## Status das Tarefas
- `CREATED`: Gerada no sistema pelo "Confirmar Chegada" do Gerente, mas nenhum operador aceitou.
- `TRANSIT`: O Operador de Empilhadeira clicou em "Aceitar" no seu tablet (ele passa a ser o dono, `operatorId`).
- `COMPLETED`: O Operador confirmou que inseriu a mercadoria na doca de saída.
