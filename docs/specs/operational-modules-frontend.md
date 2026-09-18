# Especificação — Módulos Operacionais do LarviFort CRM

## Objetivo

Criar as telas frontend que completam o fluxo operacional iniciado em Pedidos,
sem dados simulados e consumindo os contratos reais do `lavifort-API`.

Fluxo principal:

```text
Pedido → Estoque/Reserva → Laboratório → Separação → Entrega → Fiscal → Pós-venda
```

## Regras transversais

- Cada tela deve ter loading, erro, vazio, busca/filtro e paginação quando o
  endpoint fornecer metadados.
- Nenhuma tela pode inventar produtos, unidades, status, motoristas, veículos,
  reservas ou entregas.
- Serviços em `src/services` são responsáveis por contratos, normalização e
  envelopes da API; componentes cuidam apenas da apresentação e interação.
- Ações de mudança de estado devem mostrar confirmação, responsável, data e
  motivo quando exigidos pelo contrato.
- Pedidos devem permanecer navegáveis por número, cliente, status e etapa.
- Desktop prioriza tabelas operacionais; mobile usa lista compacta e drawers.
- Estoque disponível nunca pode ser confundido com estoque reservado.

## Telas e escopo

### 1. Produtos — `/produtos`

Catálogo de produtos usados em pedidos e estoque.

- Listar, buscar, filtrar ativos/inativos e ordenar.
- Criar e editar nome, código, unidade de medida, preço padrão e status.
- Exibir uso do produto em pedidos/estoque quando a API fornecer.
- Contratos: `GET/POST/PATCH /products`, `GET /products/:id`.

### 2. Unidades e berçários — `/estoque/unidades`

Cadastro da estrutura física de produção e armazenamento.

- Listar unidades produtivas e filtrar por status.
- Criar/editar unidade.
- Listar locais/berçários por unidade, tipo, capacidade e status.
- Criar/editar local ou berçário sem apagar histórico de movimentação.
- Contratos: `/stock/units` e `/stock/locations`.

### 3. Estoque — `/estoque`

Consulta operacional da disponibilidade por produto, unidade e local.

- Filtros por produto, unidade, local/berçário e data.
- Colunas: disponível, reservado, bloqueado, baixado e última atualização.
- Ações para registrar entrada, saída, bloqueio e ajuste com motivo.
- Histórico de movimentações auditável.
- Contratos: `/stock/availability` e `/stock/movements`.

### 4. Reservas — `/estoque/reservas`

Controle das quantidades comprometidas por pedido.

- Listar reservas ativas, canceladas e consumidas.
- Filtrar por pedido, produto, unidade, local e período.
- Criar reserva somente até o limite disponível.
- Cancelar/liberar reserva com confirmação e atualização imediata da disponibilidade.
- No detalhe do pedido, consultar opções de estoque e reservar/liberar.
- Contratos: `/stock/reservations` e `/orders/:id/stock-options`,
  `/orders/:id/reserve-stock`, `/orders/:id/release-stock`.

### 5. Laboratório — `/laboratorio`

Fila de ordens de serviço geradas a partir de pedidos fechados.

- Filtrar por status, unidade, data de entrega e responsável.
- Exibir pedido, produto, quantidade, origem, entrega e prazo.
- Criar OS a partir de pedido fechado.
- Atualizar status: aguardando, recebido, em preparação, pronto, bloqueado ou
  cancelado.
- Bloqueio exige motivo; pronto para separação libera a próxima etapa.
- Contratos: `/lab/orders`, `/orders/:id/lab-work-order`,
  `/lab/work-orders/:id/status`, `/lab/work-orders/:id`.

### 6. Separação — `/separacao`

Conferência física do pedido antes de encaminhar para logística.

- Fila de pedidos aguardando separação.
- Iniciar separação atribuindo responsável e registrando horário.
- Informar quantidade separada e concluir conferência.
- Registrar divergência com motivo obrigatório e evidência quando suportada.
- Pedido separado avança para aguardando motorista.
- Contratos: `/separation/orders`, `/orders/:id/separation/start`,
  `/orders/:id/separation/complete`, `/orders/:id/separation/divergence`.

### 7. Motoristas e veículos — `/logistica`

Cadastros e disponibilidade dos recursos de transporte.

- Abas independentes para motoristas e veículos.
- Motorista: nome, telefone, documento, região e status.
- Veículo: identificação, placa, tipo e status.
- Filtros por disponível, em rota e indisponível.
- Contratos: `/logistics/drivers` e `/logistics/vehicles`.

### 8. Entregas — `/entregas`

Planejamento e acompanhamento da última etapa logística.

- Listar entregas por data, status, motorista, região e pedido.
- Criar entrega somente para pedido separado.
- Atribuir motorista/veículo e exibir rota/previsão.
- Atualizar: aguardando motorista, definido, saiu, em rota, entregue,
  problema ou reagendado.
- Registrar comprovante e problema auditável.
- Contratos: `/deliveries`, `/orders/:id/delivery`,
  `/deliveries/:id/assign-driver`, `/deliveries/:id/status`,
  `/deliveries/:id/proof`.

### 9. Fiscal — `/fiscal`

Pendências fiscais e resumo pronto para emissão/exportação.

- Listar pedidos por status fiscal.
- Exibir dados do cliente, entrega, produto, valores, pagamento e vendedor.
- Editar dados fiscais com histórico.
- Status: não solicitado, pendente, pronto, NF emitida e NF cancelada.
- Contratos: `/orders/:id/fiscal-summary`, `/orders/:id/fiscal-data`,
  `/orders/:id/fiscal-status`.

### 10. Pós-venda — `/pos-venda`

Acompanhamento gerado após a entrega concluída.

- Listar acompanhamentos por status, cliente, responsável e período.
- Registrar situação do produto, problema, próxima ação e responsável.
- Status: aguardando contato, contato feito, produto ok, problema,
  revisita necessária e finalizado.
- Problema pode abrir pendência no quadro quando permitido pela API.
- Contratos: `/post-sales`, `/orders/:id/post-sale`,
  `/post-sales/:id`, `/post-sales/:id/complete`.

## Critérios de aceite do conjunto

- Todas as telas têm navegação clara e nomes literais no menu.
- Todas as transições respeitam a ordem operacional e o backend é a autoridade.
- Um pedido pode ser rastreado do estoque ao pós-venda sem perder seu número,
  cliente ou histórico.
- Falhas de API aparecem como erro explícito; nunca como lista vazia falsa.
- Componentes compartilhados cobrem status, filtros, paginação, tabela, drawer
  de detalhe e confirmação de ações.
- Typecheck, lint, build e testes de serviços passam antes da publicação.

## Ordem de entrega

1. Produtos.
2. Unidades e berçários.
3. Estoque.
4. Reservas e integração no detalhe do pedido.
5. Laboratório.
6. Separação.
7. Motoristas e veículos.
8. Entregas.
9. Fiscal.
10. Pós-venda.
