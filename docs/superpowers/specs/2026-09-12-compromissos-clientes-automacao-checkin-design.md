# Design: compromissos com cliente real, card automático e check-in

## Objetivo

Remover a mistura entre clientes e empresas no cadastro de compromisso,
permitir escolher pela automação a coluna que recebe compromissos e oferecer
confirmação da atividade com data, hora e localização.

## Novo compromisso

O campo passa a se chamar `Cliente` e lista somente dados reais de
`GET /clients`. A opção mostra o nome do cliente e, quando houver, sua empresa
como informação auxiliar, mas sempre envia `clienteId`.

O cliente é obrigatório. Enquanto a lista carrega, o campo fica desabilitado e
mostra estado de carregamento. Falha exibe erro com ação de tentar novamente;
lista vazia orienta cadastrar um cliente. O formulário não transforma falha da
API em lista vazia e não contém empresas ou opções mockadas.

## Configuração da automação

No editor `Quando / Se / Então`, adicionar:

- Quando: `Compromisso criado`;
- Então: `Criar card de compromisso`;
- Coluna de destino: seletor obrigatório alimentado pelas colunas reais do
  quadro atual.

O resumo da automação mostra o nome da coluna escolhida. Coluna indisponível
impede salvar ou ativar e apresenta instrução para escolher outra. O frontend
envia IDs e não cria card localmente; a task aparece após resposta/evento da API
ou refetch seguro.

## Card e detalhe da task

Cards com `tipo = COMPROMISSO` exibem:

- identificação visual `Compromisso`;
- nome do cliente;
- título da atividade;
- data e horário agendados;
- estado `Pendente de confirmação` ou `Confirmado`.

O botão `Confirmar atividade` aparece no card e no detalhe somente para task de
compromisso ainda não confirmada e quando o usuário tem permissão. Tasks gerais
mantêm a interface atual.

## Fluxo de check-in

Ao clicar em `Confirmar atividade`:

1. a interface explica que registrará o horário atual e a localização;
2. solicita uma única posição com `navigator.geolocation.getCurrentPosition`;
3. envia latitude, longitude e precisão para
   `POST /tasks/:id/confirm-activity`;
4. substitui o botão por `Atividade confirmada`, data/hora local e indicador de
   localização registrada.

O horário exibido vem de `confirmedAt` retornado pela API. O relógio do browser
não é fonte de verdade. Durante captura/envio o botão mostra progresso e impede
duplo clique.

## Erros e privacidade

- Permissão de localização negada: explicar como habilitar e manter a task
  pendente.
- Localização indisponível ou timeout: permitir nova tentativa sem criar
  confirmação parcial.
- `409` já confirmado: recarregar o detalhe e mostrar a confirmação existente.
- `403`: ocultar/desabilitar a ação após atualizar permissões.
- Geolocalização requer contexto seguro (`https` ou localhost).
- Não há captura contínua ou em segundo plano.

## Componentes e contratos

- `AgendaPage` carrega clientes reais e não carrega empresas para a modal.
- `NovoCompromissoModal` recebe clientes, exige `clienteId` e envia apenas o
  vínculo correto.
- `services/appointments.ts` mantém o contrato da agenda.
- `services/tasks.ts` incorpora tipo, dados do compromisso e confirmação.
- `AutomacoesQuadroModal` configura gatilho, ação e `targetColumnId` reais.
- `KanbanCard` e `TaskDetailModal` compartilham a mesma ação de confirmação para
  evitar comportamentos divergentes.

## Critérios de aceite

1. O seletor contém somente clientes cadastrados e envia o ID correto.
2. Erro ao carregar clientes fica visível; não há fallback/mock silencioso.
3. A automação permite selecionar uma coluna real para compromissos.
4. Compromisso criado gera card com cliente e atividade na coluna configurada.
5. Somente task de compromisso pendente oferece `Confirmar atividade`.
6. Confirmação registra e exibe horário retornado pela API e localização.
7. Negação, timeout, duplo clique e confirmação repetida têm estados claros.
8. Typecheck, lint, build e testes dos componentes/services passam.
9. O fluxo é validado em desktop e viewport móvel, incluindo permissão real de
   geolocalização em contexto seguro.

