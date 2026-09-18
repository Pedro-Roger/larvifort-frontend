# Métricas com três modos de construção

## Objetivo

Transformar Métricas no centro de análise operacional do CRM. A pessoa usuária
deve escolher, no momento da criação, entre um construtor guiado, uma tela de
blocos configuráveis ou um construtor avançado. Todas as análises salvas podem
ser usadas como widgets no dashboard.

## Modos

### Guiado

Fluxo em etapas: fonte da métrica A, fonte opcional da métrica B, período,
filtros, tipo de visualização, meta opcional e ação de salvar. Deve explicar os
campos com linguagem de negócio e validar combinações incompatíveis.

### Blocos

Lista de análises em cards editáveis. Cada card mostra título, fontes, período,
resultado e visualização. O botão “Adicionar análise” abre um formulário curto.
Cards podem ser editados, duplicados, ocultados, excluídos ou adicionados ao
dashboard.

### Avançado

Editor para combinar várias fontes, operações e fórmulas. Deve permitir
agregação, comparação, percentual, razão e diferença, sempre exibindo a
expressão resultante antes de salvar. Uma análise avançada deve continuar
legível no modo de blocos.

## Fontes iniciais

Pedidos, faturamento, visitas, reuniões, clientes novos, clientes antigos,
estoque, reservas, laboratório, separação, entregas e pós-venda. As fontes
devem usar os mesmos contratos de dados para o eixo A, eixo B e filtros.

## Persistência e dashboard

Uma análise salva possui identificador, modo, fontes, dimensões, filtros,
período, visualização, meta opcional, título e estado de publicação no
dashboard. Adicionar ao dashboard não duplica a análise; cria ou atualiza sua
posição e visibilidade. O dashboard deve permitir mover, ocultar, editar,
duplicar e remover widgets.

## Validação

- O usuário consegue trocar entre os três modos sem perder uma análise já salva.
- Uma comparação pode usar pedidos contra visitas, faturamento contra pedidos,
  clientes novos contra antigos e outras combinações disponíveis.
- Dados vazios exibem estado vazio explícito, nunca números inventados.
- Metas podem ser definidas sobre qualquer métrica compatível.
- A análise publicada aparece no dashboard na posição escolhida.
- Métricas e dashboard continuam funcionais em desktop e mobile.

