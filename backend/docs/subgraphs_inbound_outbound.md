# 🚪 Subgrafos: Inbound e Outbound

Esses dois microsserviços (embora separados) dividem arquiteturas extremamente similares. Eles são a representação estática da infraestrutura física (hardware e tijolos) do galpão de Davenport.

## Responsabilidades
- Catalogar as portas físicas de acesso ao armazém (ex: IN-01, OUT-45).
- Controlar atributos físicos como as coordenadas cartesianas no pátio (`locationX` e `locationY`), que são usadas para cálculo de distância pitagórica.
- Controlar capacidades da doca (ex: `isRefrigerated`, que diz se a doca é própria para itens como carne congelada, que não pode ficar numa porta de doca seca).

## Atualização Reativa Autônoma
Ambos possuem mutations (`updateInboundDockStatus` / `updateOutboundDockStatus`) que permitem ao Frontend agir como um orquestrador.

Os possíveis status físicos controlados aqui são:
- `AVAILABLE` (Verde): Doca livre. O motor do Crossdock pode enviar cargas para cá.
- `OCCUPIED` (Amarelo): Doca bloqueada (Há um caminhão ancorado). O motor de crossdock não deve mandar empilhadeiras, a não ser que a carga seja do próprio caminhão.
- `MAINTENANCE` (Vermelho): Interditada temporariamente (quebra mecânica do portão hidráulico ou higienização).

Esses dados são desenhados topograficamente no componente `WarehouseDashboard.tsx`.
