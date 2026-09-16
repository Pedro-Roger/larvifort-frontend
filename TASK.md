# Plano de tarefas — módulo de Projetos LarviFort (Frontend)

O backend deve estar publicado e validado antes de ativar cada fluxo.

## CRM-011 — Kanban dirigido pela API (P0)

- Remover `COLUNAS` e `COLUMN_TO_STATUS` fixos do fluxo de produção.
- Buscar colunas reais por quadro e renderizar nome, cor, ordem e contagem.
- Usar `columnId` para criar, mover, filtrar e detalhar tarefas.
- Tratar quadro/coluna sem dados com estados vazios acionáveis.
- Remover fallback de setores, colunas e cards mockados.

## CRM-012 — Criação guiada de quadro e colunas (P0, depende de API-003)

- Ampliar `NovoQuadroModal` para nome, template opcional e lista de colunas.
- Permitir adicionar, remover, editar, escolher cor e reordenar colunas.
- Enviar criação atômica com `columns[]` e preservar formulário em erro.
- Selecionar quadro criado e carregar colunas reais.

## CRM-013 — Gestão de colunas (P0, depende de CRM-011)

- Criar coluna pela API, sem simulação local.
- Editar nome, cor e ordem.
- Excluir com destino de tarefas e impedir exclusão da última coluna ativa.
- Atualizar o Kanban sem reload completo quando seguro.

## CRM-014 — Editor de regras (P1, depende de API-005)

- Lista por quadro com prioridade, ativo/inativo e soft delete.
- Formulário “quem pode fazer o quê e em quais colunas”.
- Seletores alimentados por usuários, equipes e colunas reais.
- Preview de permissão e tratamento de 403.

## CRM-015 — Editor de automações (P1, depende de API-006)

- Editor “Quando / Se / Então”, condições AND/OR e ações ordenadas.
- Usar gatilhos, colunas, usuários e tags reais da API.
- Adicionar dry-run, toggle, prioridade, histórico, erro e reprocessamento seguro.
- Proteger referências a colunas/usuários arquivados.

## CRM-016 — Templates opt-in (P2, depende de CRM-012/014/015)

- Mostrar templates com descrição e preview.
- Permitir edição antes de aplicar e confirmar cada recurso criado.
- Nunca aplicar template no carregamento da página.

## CRM-017 — UX transversal (P1)

- Substituir dropdowns genéricos pelo componente visual consistente onde aplicável.
- Manter formulários responsivos e acessíveis.
- Usar `Avatar` real quando houver URL e iniciais como fallback.
- Eliminar nomes/e-mails hardcoded e padronizar mensagens em português.

## CRM-018 — Cliente real no novo compromisso (P0, depende de API-011)

- Remover empresas do seletor e da carga de dados da modal de compromisso.
- Listar somente clientes reais de `GET /clients` e enviar `clienteId`.
- Tornar cliente obrigatório e mostrar carregamento, erro com retry e estado
  vazio sem fallback silencioso.
- Exibir a empresa vinculada apenas como texto auxiliar do cliente, quando
  disponível.
- Cobrir payload correto e impedir que ID de empresa seja enviado como cliente.

## CRM-019 — Coluna de compromissos na automação (P0, depende de API-012)

- Adicionar `Compromisso criado` ao seletor de gatilho.
- Adicionar `Criar card de compromisso` ao seletor de ação.
- Exigir coluna de destino carregada do quadro atual e persistir
  `targetColumnId`.
- Mostrar a coluna no resumo e bloquear referência inexistente/arquivada.
- Atualizar o quadro por evento ou refetch seguro, sem inserir card simulado.

## CRM-020 — Card de compromisso e confirmação (P0, depende de API-013/CRM-019)

- Estender o contrato de task com tipo, compromisso, cliente e confirmação.
- Exibir cliente, atividade, data/horário e estado de confirmação no card.
- Mostrar `Confirmar atividade` apenas em compromisso pendente autorizado.
- Capturar uma posição com Geolocation API e enviar latitude, longitude e
  precisão; usar `confirmedAt` da API na apresentação.
- Tratar permissão negada, indisponibilidade, timeout, 403, 409 e duplo clique.
- Compartilhar a ação entre `KanbanCard` e `TaskDetailModal`.

## CRM-021 — Validação integrada e responsiva (P0, depende de CRM-018/020)

- Testar services e componentes para clientes, automação e confirmação.
- Validar agenda → card na coluna → check-in em desktop e mobile.
- Confirmar que task geral não exibe botão e que não existe mock/fallback.
- Executar typecheck, lint e build após o backend estar publicado e validado.

## Gate de cada tarefa

Executar `npm run typecheck`, `npm run lint`, `npm run build` e inspeção desktop/mobile.
Não publicar frontend antes do contrato backend. Não incluir alterações não relacionadas.
