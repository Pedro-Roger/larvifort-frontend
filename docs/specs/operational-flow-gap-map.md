# LarviFort CRM — Mapa de Fluxo Operacional e Features Faltantes

## Objetivo

Traduzir o caminho real da operação em um fluxo de sistema para identificar quais módulos, telas, dados, automações e validações ainda faltam implementar no LarviFort CRM.

O fluxo principal é:

```txt
Lead/Cliente
→ Montagem do pedido
→ Consulta de estoque
→ Reserva/disponibilidade
→ Confirmação do cliente
→ Pedido fechado
→ Laboratório
→ Separação
→ Motorista/logística
→ Entrega
→ Fiscal/NF
→ Pós-venda
→ Métricas e auditoria
```

---

## 1. Lead e Cliente

### Fluxo esperado

```txt
Lead novo ou cliente antigo
→ cadastrar/atualizar dados 360
→ classificar origem/status
→ vincular empresa/fazenda
→ definir carteira/responsável
→ iniciar pedido ou atividade comercial
```

### Dados necessários

- Nome do cliente.
- Nome fantasia/apelido.
- CPF/CNPJ.
- Telefone.
- Endereço.
- Cidade/UF.
- Empresa/fazenda vinculada.
- Origem do lead.
- Status do lead.
- Responsável/vendedor.
- Histórico de contatos.

### Já existe

- Módulo de clientes.
- Módulo de empresas.
- Vínculo básico cliente/empresa.
- Status de lead/cliente.

### Falta implementar/refinar

- Carteira comercial por vendedor/responsável.
- Distribuição automática de lead por região, carteira ou regra.
- Histórico estruturado de interações comerciais.
- Ação rápida: “montar pedido” a partir do cliente.
- Auditoria de mudança de responsável/carteira.

---

## 2. Montagem do Pedido

### Fluxo esperado

```txt
Selecionar cliente
→ preencher dados fiscais e endereço automaticamente
→ selecionar produto
→ informar quantidade
→ informar data/turno de entrega
→ calcular preço e total
→ consultar estoque antes de confirmar
```

### Produtos iniciais

- Pós-larvas.
- Matriz.
- Náuplios.

### Dados necessários no pedido

- Cliente.
- Nome fantasia/apelido.
- CPF/CNPJ.
- Endereço de entrega.
- Produto.
- Quantidade.
- Unidade de medida: milheiro/unidade conforme produto.
- Preço unitário.
- Total.
- Data de entrega.
- Turno: manhã/tarde/noite, quando aplicável.
- Forma de pagamento.
- Data de pagamento.
- Vendedor(a).
- Observações.

### Já existe

- Tela inicial de Pedidos.
- Criação de pedido com cliente, quantidade, data, endereço, observação e valor.
- Produto padrão configurável em Configurações.
- Card automático no quadro quando configurado.

### Falta implementar/refinar

- Catálogo real de produtos.
- Preço por produto.
- Unidade de medida por produto.
- Forma e data de pagamento.
- Turno de entrega.
- Dados fiscais completos no pedido.
- Validação de estoque antes de confirmar pedido.
- Status detalhado do pedido.
- Pedido iniciado direto pelo cliente e pela task.

---

## 3. Estoque por Unidade/Local

### Fluxo esperado

```txt
Pedido informa produto + quantidade + data
→ sistema consulta estoque disponível
→ verifica unidade/local/berçário
→ mostra disponibilidade
→ reserva estoque ou bloqueia confirmação
```

### Conceito de estoque na larvicultura

O estoque pode estar dividido em várias unidades e locais produtivos.

Exemplos:

```txt
Unidade: Morada Nova
Local: Berçários
Quantidade de berçários: 12
Produto: Pós-larvas
Estoque disponível: X milheiros
```

```txt
Unidade: Itarema
Local: Berçários
Quantidade de berçários: 2
Produto: Pós-larvas
Estoque disponível: Y milheiros
```

### Entidades necessárias

- Unidade produtiva.
- Local de estoque.
- Berçário.
- Produto.
- Lote.
- Estoque disponível.
- Estoque reservado.
- Movimentação de estoque.
- Reserva vinculada ao pedido.

### Status de estoque

```txt
Disponível
Reservado
Bloqueado
Baixado
Indisponível
```

### Falta implementar

- Módulo de Estoque.
- Cadastro de unidades produtivas.
- Cadastro de locais/berçários por unidade.
- Cadastro de produtos.
- Cadastro de lotes/quantidade disponível.
- Reserva de estoque por pedido.
- Baixa de estoque por entrega.
- Histórico de movimentações.
- Tela para consultar disponibilidade por data/produto/unidade.
- Alerta de estoque insuficiente.

---

## 4. Confirmação do Cliente

### Fluxo esperado

```txt
Pedido montado + estoque disponível
→ enviar/confirmar com cliente
→ cliente confirma
→ pedido muda para confirmado
→ estoque fica reservado
```

### Status possíveis

```txt
Aguardando confirmação do cliente
Confirmado pelo cliente
Cliente pediu alteração
Cliente cancelou
```

### Falta implementar

- Status específico de confirmação do cliente.
- Registro de quem confirmou.
- Data/hora da confirmação.
- Histórico de alterações antes da confirmação.
- Bloqueio para não avançar sem estoque ou aprovação manual.

---

## 5. Pedido Fechado

### Fluxo esperado

```txt
Cliente confirmou
→ responsável fecha pedido
→ sistema gera tarefas operacionais
→ pedido entra no fluxo laboratório/separação/logística
```

### Status

```txt
Confirmado pelo cliente
Pedido fechado
Fechado com pendência
Cancelado após confirmação
```

### Falta implementar

- Botão/ação “Fechar pedido”.
- Regra para validar dados obrigatórios antes de fechar.
- Auditoria de fechamento.
- Geração automática de tarefas para laboratório, separação e logística.
- Bloqueio contra edição sensível após fechamento sem permissão.

---

## 6. Laboratório

### Fluxo esperado

```txt
Pedido fechado
→ cria tarefa/OS para laboratório
→ laboratório prepara produto
→ marca como pronto para separação
```

### Dados necessários

- Pedido.
- Produto.
- Quantidade.
- Unidade de origem.
- Berçário/local.
- Data de entrega.
- Observações.
- Responsável do laboratório.
- Status.

### Status

```txt
Aguardando laboratório
Recebido pelo laboratório
Em preparação
Pronto para separação
Bloqueado
Cancelado
```

### Falta implementar

- Módulo ou etapa de Laboratório.
- OS/tarefa automática para laboratório.
- Responsável do laboratório.
- Status operacional do laboratório.
- Evidências/observações do laboratório.
- Métrica de tempo no laboratório.

---

## 7. Separação

### Fluxo esperado

```txt
Laboratório pronto
→ equipe separa produto
→ confere quantidade
→ marca pedido como separado
→ pedido aguarda motorista
```

### Dados necessários

- Pedido.
- Produto.
- Quantidade prevista.
- Quantidade separada.
- Unidade/local de origem.
- Responsável pela separação.
- Data/hora da separação.
- Divergência, se houver.

### Status

```txt
Aguardando separação
Em separação
Separado
Separação com divergência
```

### Falta implementar

- Etapa de separação no pedido.
- Responsável por separação.
- Registro de quantidade separada.
- Validação de divergência.
- Evidência/anexo opcional.
- Auditoria de separação.

---

## 8. Motorista e Logística

### Fluxo esperado

```txt
Pedido separado
→ escolher motorista
→ definir veículo/rota
→ registrar saída
→ acompanhar entrega
→ concluir ou registrar problema
```

### Cadastro de motorista

- Nome.
- Telefone.
- Documento.
- Veículo.
- Placa.
- Região atendida.
- Disponibilidade.
- Status.

### Status do motorista

```txt
Disponível
Em rota
Indisponível
Férias
```

### Dados da entrega

- Pedido.
- Cliente.
- Endereço.
- Contato.
- Motorista.
- Veículo.
- Placa.
- Rota.
- Data de saída.
- Hora de saída.
- Previsão de entrega.
- Comprovante.
- Observação.

### Status de entrega

```txt
Aguardando motorista
Motorista definido
Saiu para entrega
Em rota
Entregue
Entrega parcial
Entrega com problema
Reagendado
```

### Falta implementar

- Cadastro de motoristas.
- Cadastro de veículos.
- Atribuição de motorista ao pedido.
- Status de rota/entrega.
- Comprovante de entrega.
- Registro de problema na entrega.
- Métrica por motorista.

---

## 9. Fiscal / Nota Fiscal

### Fluxo esperado

```txt
Pedido fechado ou entregue
→ gerar dados para emissão fiscal
→ revisar dados
→ marcar NF emitida ou pendente
```

### Dados base para NF

Exemplo recebido:

```txt
15/09 – TERÇA – MANHÃ
Nome fantasia ou apelido:
CPF/CNPJ:
Endereço:
Data de entrega: 15/09/2026
Quantidade: 600 milheiros
Preço: R$ 15,00/milheiro
Total NF:
Pagamento: 16/09/2026 (Transferência Bancária)
Vendedor(a): Maisa
```

### Campos fiscais necessários

- Nome fantasia/apelido.
- CPF/CNPJ.
- Endereço.
- Data de entrega.
- Dia/turno.
- Produto.
- Quantidade.
- Preço unitário.
- Total NF.
- Forma de pagamento.
- Data de pagamento.
- Vendedor(a).
- Status fiscal.
- Número da NF, quando disponível.
- Observações fiscais.

### Status fiscal

```txt
Não solicitado
Pendente de dados
Pronto para emissão
NF emitida
NF cancelada
```

### Falta implementar

- Campos fiscais completos no pedido.
- Tela/aba fiscal do pedido.
- Exportação/resumo para emissão de NF.
- Status fiscal.
- Auditoria de alteração fiscal.

---

## 10. Pós-venda

### Fluxo esperado

```txt
Entrega concluída
→ criar acompanhamento de pós-venda
→ checar larva/produto com cliente
→ registrar retorno
→ abrir pendência se houver problema
→ finalizar acompanhamento
```

### Dados necessários

- Cliente.
- Pedido.
- Produto.
- Quantidade entregue.
- Data da entrega.
- Responsável pelo pós-venda.
- Data de acompanhamento.
- Situação da larva/produto.
- Observações.
- Problemas relatados.
- Próxima ação.

### Status

```txt
Aguardando contato
Contato feito
Larva ok
Cliente com problema
Revisita necessária
Finalizado
```

### Falta implementar

- Módulo/etapa de pós-venda.
- Atividade automática após entrega.
- Formulário de acompanhamento.
- Problemas e tratativas.
- Métrica de qualidade/satisfação.

---

## 11. Automações necessárias

```txt
Lead novo → distribuir para carteira certa.
Pedido criado → consultar estoque.
Estoque disponível → permitir reserva.
Estoque insuficiente → bloquear confirmação ou solicitar aprovação.
Cliente confirmou → reservar estoque e liberar fechamento.
Pedido fechado → criar OS/tarefa para laboratório.
Laboratório concluiu → criar tarefa de separação.
Pedido separado → solicitar motorista.
Motorista definido → criar entrega/rota.
Entrega concluída → abrir pós-venda.
Entrega com problema → abrir pendência no quadro.
Pós-venda finalizado → atualizar métricas do cliente.
```

---

## 12. Métricas necessárias

### Comercial

- Leads novos.
- Clientes ativos.
- Clientes atendidos.
- Pedidos criados.
- Pedidos confirmados.
- Pedidos fechados.
- Valor vendido.
- Vendas por vendedor.

### Estoque

- Estoque disponível por unidade.
- Estoque reservado por unidade.
- Estoque por produto.
- Pedidos bloqueados por falta de estoque.
- Movimentações por período.

### Laboratório

- Pedidos enviados ao laboratório.
- Tempo médio no laboratório.
- Pedidos bloqueados no laboratório.

### Separação/logística

- Pedidos separados.
- Pedidos aguardando motorista.
- Entregas por motorista.
- Tempo entre separado e entrega.
- Entregas com problema.
- Reentregas.

### Pós-venda

- Acompanhamentos abertos.
- Acompanhamentos finalizados.
- Clientes com problema.
- Recompra por cliente.

---

## 13. Ordem recomendada de implementação

### Fase 1 — Base do Pedido Real

- Catálogo de produtos.
- Campos fiscais/comerciais completos no pedido.
- Status detalhado do pedido.
- Ação “fechar pedido”.

### Fase 2 — Estoque

- Unidades produtivas.
- Locais/berçários.
- Estoque por produto/unidade/local.
- Reserva de estoque por pedido.

### Fase 3 — Laboratório e Separação

- OS/tarefa de laboratório.
- Status de laboratório.
- Separação e conferência.

### Fase 4 — Logística

- Motoristas.
- Veículos.
- Entregas.
- Comprovante/problema de entrega.

### Fase 5 — Fiscal e Pós-venda

- Dados para NF.
- Status fiscal.
- Pós-venda automático.
- Formulário de acompanhamento.

### Fase 6 — Métricas e Automações avançadas

- Métricas por etapa.
- Regras configuráveis.
- Auditoria completa.
- Dashboard operacional por gargalo.

---

## 14. Gap geral por módulo

| Módulo | Estado atual | Principal gap |
| --- | --- | --- |
| Clientes | Existe base | Carteira, distribuição e histórico comercial estruturado |
| Empresas | Existe base | Relação operacional/fiscal mais forte com pedidos |
| Pedidos | Existe início | Status completo, dados fiscais, estoque, laboratório, logística |
| Estoque | Não existe como módulo | Unidade, berçário, produto, lote, reserva e baixa |
| Laboratório | Não existe como módulo | OS/tarefa operacional vinculada ao pedido |
| Separação | Não existe como etapa | Conferência, responsável e divergência |
| Motoristas | Não existe | Cadastro, disponibilidade, rota e entrega |
| Fiscal | Não existe como etapa | Dados NF, status fiscal e exportação/resumo |
| Pós-venda | Não existe como fluxo | Acompanhamento automático após entrega |
| Métricas | Existe base | Métricas por etapa operacional e gargalos |
| Automações | Existe base no quadro | Regras cruzando pedido, estoque, laboratório e logística |
| Auditoria | Parcial | Histórico por etapa e responsável |
