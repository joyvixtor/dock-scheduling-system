# 📅 Subgrafo: Appointments (Agendamentos)

O serviço de Agendamentos (Appointments) é a porta de entrada para motoristas de caminhão. Ele é responsável pelo planejamento logístico.

## Responsabilidades
- Gerir a tabela horária. Um caminhão só pode estar no galpão se tiver um horário reservado.
- Controlar dados das empresas transportadoras (`carrier`).
- Agrupar mercadorias que estão chegando num bloco lógico (uma transportadora está trazendo X caixas do SKU tal).

## Máquina de Estados
Os agendamentos sofrem transição de status em resposta a ações da portaria e do Gerente de Pátio.

- **SCHEDULED**: Quando um caminhão agenda espaço futuro.
- **ARRIVED**: Quando o caminhão encosta fisicamente de ré na doca.
- **COMPLETED**: Quando o descarregamento é finalizado e o caminhão se retira pelo portão principal.
- **CANCELLED**: Caso a empresa de transporte falte no horário (No-Show).

## Integração Frontend
Este microsserviço é pesadamente acessado pelos componentes:
- `GateCheckIn.tsx` (cria os agendamentos).
- `DockSchedule.tsx` (lista e gerencia o status dos agendamentos em uma matriz temporal).
