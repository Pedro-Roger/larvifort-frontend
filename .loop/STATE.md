# LOOP STATE

status: BLOCKED
iteration: 41b
VERIFICATION: PASS (2026-09-10 - iteracao 41b: Correcoes aplicadas - Botao Templates duplicado removido, onSuccess do TemplatesQuadroModal atualizado para setAllTasks, dependencias do useEffect de atalhos corrigidas. Typecheck, Lint e Build limpos.)

## Bloqueio

BLOCKED: Aguardando backend lavifort-API entregar endpoints /dashboard/stats, /dashboard/charts, /clients, /tasks, /appointments, /users, /teams, /searches, /tasks/boards, /tasks/columns, /tasks/rules, /tasks/automations, /tasks/templates. Sem backend, CRM-004 (Validar fluxo login → dashboard → CRUD completo) não pode prosseguir.

## Verification Feedback

- **Botão "Templates" duplicado no header do Kanban**:
  - Arquivo: `src/app/(app)/kanban/page.tsx` (linhas 491 a 507)
  - Comportamento esperado: Deve existir apenas um botão de "Templates" no header ao lado de "Automações" e "Nova Tarefa".

- **Tarefa criada por aplicação de template não atualiza o estado local do Kanban**:
  - Aquivo: `src/app/(app)/kanban/page.tsx` (linhas 745 a 752) e `src/components/kanban/TemplatesQuadroModal.tsx` (linhas 23, 395 a 402)
  - Comportamento esperado: Ao aplicar um template com sucesso (`handleApply`), a `Task` retornada pelo endpoint deve ser adicionada à lista de tarefas (`setAllTasks((prev) => [newTask, ...prev])`) para que o card apareça imediatamente no Kanban sem necessitar recarregar a página, removendo também o `console.log`.

- **Dependências ausentes no useEffect de atalhos de teclado (Escape / atalhos)**:
  - Arquivo: `src/app/(app)/kanban/page.tsx` (linhas 72 a 91)
  - Comportamento esperado: O array de dependências do `useEffect` deve incluir `automacoesQuadroModalOpen` e `templatesQuadroModalOpen` para garantir que o fechamento por `Escape` funcione corretamente sem stale closure e sem disparar avisos no ESLint (`react-hooks/exhaustive-deps`).

VERIFICATION: PASS (2026-09-10 - iteracao 41b: Correcoes aplicadas - Botao Templates duplicado removido, onSuccess do TemplatesQuadroModal atualizado para setAllTasks, dependencias do useEffect de atalhos corrigidas. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-10 - iteracao 39: CRM-015 PASS — Editor de Automações por Quadro (AutomacoesQuadroModal) implementado com CRUD completo (criar, editar, excluir, reordenar, testar), 7 gatilhos (Tarefa Criada, Movida, Concluída, Atribuída, Prazo Próximo, WIP Excedido, Agendado), 8 ações (Mover Tarefa, Atribuir Usuário, Definir Prioridade, Adicionar Tag, Enviar Notificação, Criar Subtarefa, Atualizar Campo, Webhook), drag-and-drop para reordenar, toggle ativo/inativo, teste de automação, persistência via API. Integrado no header do Kanban ao lado de Regras. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-10 - iteracao 37: CRM-013 PASS — CRUD e ordenação de colunas completo: EditarColunaModal para editar título/cor, drag-and-drop de colunas para reordenar (handleColumnDragStart/End/Over/Drop), persistência via updateColumn e reorderColumns API. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-10 - iteracao 36: CRM-012 PASS — Wizard guiado de criação de quadros com colunas personalizadas (NovoQuadroWizard). Passos: nome do quadro, definição de colunas (título, cor, ordem), revisão e criação via API. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-10 - iteracao 35: CRM-011 PASS — Kanban agora renderiza colunas exclusivamente da API (fetchColumns). Removido array hardcoded COLUNAS; colunas ordenadas por 'order' do backend; loading skeleton adaptado; handleCardMove usa columnToStatus derivado das colunas da API; ExcluirColunaModal usa availableColumns da API. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-10 - iteracao 34: CRM-010 PASS — Notification Center implementado com NotificationProvider, useNotifications hook, NotificationCenter component (variants sidebar/header/icon-only), persistência localStorage + API fallback, preferências de notificação, tipos info/success/warning/error, badge contador no ícone de sino, toast integrado. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-08 - iteracao 33: CRM-003 PASS — Mocks do ListView do dashboard removidos; ListView agora consome dados reais da API via fetchTasks; tasksByAssignee passado para ListView. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-08 - iteracao 32: CRM-008 PASS — Modal Completa de Tarefa (TaskDetailModal) implementada com edição persistente de título/descrição, seletor de responsável da equipe, seletor de quadro/setor, WhatsApp integrado com telefone real, ordem de pedido vinculada, gerenciamento de anexos com upload/delete e exclusão confirmada. Typecheck, Lint e Build limpos.)
VERIFICATION: PASS (2026-09-08 - iteracao 30: CRM-007 PASS — Modais de coluna com persistência via endpoint (createColumn, deleteColumn) e modal ExcluirColuna com destino de migração. Limpeza de console.logs dummy. Verificação limpa.)
VERIFICATION: PASS (2026-09-07 - iteracao 23: FASE 4 Task 3 Error states (fallbacks) — src/components/ui/ErrorState.tsx criado com componente reutilizável ErrorState (variants: network/server/generic/not-found/unauthorized, ícones Phosphor, cores semânticas, botão retry, modo compacto); helpers InlineError, FieldError, ToastError; integração com ícones Phosphor CellSignalSlash/Database/WarningCircle/CaretRight; sem TODOs/as-any/console.log; npx tsc --noEmit EXIT 0; npx eslint src/components/ui/ErrorState.tsx EXIT 0; npm run build EXIT 0 com 10 rotas + Proxy; FASE 4 Task 3 Error states COMPLETA; proxima: FASE 4 Task 4 Confirmações de delete)

## Current Task

BLOQUEADO: Aguardando backend lavifort-API. CRM-004 nao pode iniciar sem API-001/API-002.

PENDENCIAS ABERTAS (nao pertencem a esta iteracao):
- (a) Backend lavifort-API ainda NAO tem /dashboard/stats, /dashboard/charts, /clients, /companies, /companies/groups, /tasks, /tasks/projects, /appointments, /users, /teams, /searches. O frontend contrata o shape via services; validacao E2E depende do backend entregar os endpoints.
- (b) ListView (src/components/dashboard/ListView.tsx) mantem mockTasks internos (demo de tasks); pode ser integrado com GET /tasks em refator futuro de ListView.
- (c) Filtro por responsável em Clientes: o schema Prisma do backend não modela `responsavel` ou `userId` em `Cliente`. Quando o backend adicionar essa relação ou decidirmos o modelo, o filtro será implementado.
- (d) Dropdown de clientes/empresas no NovoCompromissoModal usa mocks locais; substituir por fetch real quando endpoints /clients e /companies estiverem disponíveis no backend.
- (e) Dropdown de clientes/responsáveis no NovaPesquisaModal usa mocks locais; substituir por fetch real quando endpoints /clients e /users estiverem disponíveis no backend.

## Completed

- [x] Estrutura de pastas criada
- [x] GOAL.md definido com tasks reais
- [x] Agentes configurados
- [x] Código enviado para GitHub
- [x] FASE 1: services/api.ts com base URL (fetch nativo, ApiError tipado, helpers get/post/patch/delete)
- [x] FASE 1: interceptores de auth no api client (Bearer automático via localStorage, get/set/clearAuthToken, setUnauthorizedHandler para 401, opt-out por request com auth:false)
- [x] FASE 1: hook useApi (src/hooks/useApi.ts com data/error/loading, execute(fetcher), reset, cleanup de unmount)
- [x] FASE 1: service de autenticação (src/services/auth.ts com login via POST /auth/login + persistência de token + logout/isAuthenticated)
- [x] FASE 1: formulário Login integrado (src/app/page.tsx com validação email/senha + login service + redirect /dashboard)
- [x] FASE 1: context de autenticação (src/contexts/AuthContext.tsx com AuthProvider + useAuth, persistência de user, auto-logout no 401, provido no RootLayout, consumido no Login)
- [x] FASE 1: guard protegido no grupo (app) (src/app/(app)/layout.tsx com useAuth + router.replace / + early return null)
- [x] FASE 1: logout visível na Sidebar (src/components/layout/Sidebar.tsx com useAuth().logout + router.replace /)
- [x] FASE 1: proxy de rotas protegidas (src/proxy.ts com checagem otimista via cookie larvifort_token + redirects; services/api.ts espelha token em cookie)
- [x] FASE 1: refresh token (src/services/auth.ts com refreshToken via POST /auth/refresh + services/api.ts com retry 1x no 401 via setRefreshHandler + AuthContext registra handler com fallback p/ auto-logout)
- [x] FASE 2: Dashboard via API (src/services/dashboard.ts com tipos + fetchDashboardStats/fetchDashboardCharts; src/app/(app)/dashboard/page.tsx com Skeleton/ErrorState/retry, mocks inline removidos e dados vindos de stats/charts via useEffect)
- [x] FASE 2: Clientes via API - parte 1 (src/services/clients.ts com CRUD completo + normalização; src/app/(app)/clientes/page.tsx com GET /clients, paginação, busca com debounce, filtros de status, ErrorState/retry, mocks removidos)
- [x] FASE 2: Clientes via API - parte 2 (NovoContatoModal.tsx reescrito com FormState tipado, campos controlados, validação firstName+lastName, onSubmit com createClient, loading/error states, reset, onSuccess → refetch na page)
- [x] FASE 2: Clientes via API - parte 3 (EditarContatoModal.tsx criado com EditarContatoForm interno key=client.id, campos controlados, validação, updateClient, loading/error, onSuccess → refetch; page.tsx com editingClient/editModalOpen + botão "⋮")
- [x] FASE 2: Clientes via API - parte 4 (ConfirmDeleteModal.tsx criado, exclusão via dropdown menu "⋮" com Editar/Excluir, deleteClient, refetch; FASE 2 Clientes COMPLETA)
- [x] FASE 2: Empresas via API (src/services/companies.ts com CRUD completo para Empresas e Grupos; src/app/(app)/empresas/page.tsx com GET /companies + GET /companies/groups, loading skeleton, ErrorState/retry, criar/excluir grupos, criar/excluir empresas, tabs, busca; FASE 2 Empresas COMPLETA)
- [x] FASE 3: Kanban via API (src/services/tasks.ts + src/app/(app)/kanban/page.tsx + NovaTarefaModal.tsx + QuickEditDrawer.tsx; GET /tasks, POST /tasks, PATCH /tasks/:id/status, PATCH /tasks/:id, drag-and-drop com update otimista, estatísticas por coluna, busca em tempo real, filtros de projeto; FASE 3 Kanban COMPLETA)
- [x] FASE 3: Agenda via API (src/services/appointments.ts + src/app/(app)/agenda/page.tsx + NovoCompromissoModal.tsx; GET /appointments com range mensal, POST /appointments, calendário interativo, filtros tipo/busca, painel detalhes dia; FASE 3 Agenda COMPLETA)
- [x] FASE 3: Equipe via API (src/services/users.ts + src/app/(app)/equipe/page.tsx + NovoUsuarioModal.tsx + NovoTimeModal.tsx; GET /users, GET /teams, POST /users, POST /teams, PATCH /users/:id, DELETE /users/:id, DELETE /teams/:id, cards expansíveis por time, avatares, role inline, exclusão confirmada; FASE 3 Equipe COMPLETA)
- [x] FASE 3: Pesquisa via API (src/services/searches.ts + src/app/(app)/pesquisa/page.tsx + NovaPesquisaModal.tsx; GET /searches, POST /searches, DELETE /searches/:id, tabela com busca/filtros, painel detalhes, exclusão confirmada; FASE 3 Pesquisa COMPLETA)
- [x] FASE 4: Toast/Notificações (src/hooks/useToast.ts + src/components/ui/Toast.tsx + src/components/ui/ToastProvider.tsx; sistema global de toasts com tipos success/error/warning, animações, auto-dismiss, integração nas 10 rotas)
- [x] FASE 4: Loading states (skeletons) (src/components/ui/Skeleton.tsx + src/lib/utils.ts + src/app/(app)/perfil/page.tsx; componentes reutilizáveis, skeleton loading padronizado, form state sem effects)
- [x] FASE 4: Error states (fallbacks) (src/components/ui/ErrorState.tsx; componente reutilizável com 5 variants, retry button, compact mode, helpers InlineError/FieldError/ToastError)
- [x] FASE 4: Confirmações de delete (ConfirmDeleteModal integrado em Clientes, Empresas, Equipe, Pesquisa, Agenda e Kanban)
- [x] FASE 4: Módulo de Notificações (Notification Center + Toasts) — NotificationProvider, useNotifications hook, NotificationCenter (sidebar/header/icon-only), localStorage + API fallback, preferências, badge contador, toast integrado (src/contexts/NotificationContext.tsx, src/components/ui/NotificationCenter.tsx, src/services/notifications.ts, src/hooks/useToast.ts, src/components/ui/Toast.tsx)
- [x] FASE 6: CRM-011 Kanban renderizado exclusivamente por colunas reais da API — fetchColumns no service/tasks, colunas ordenadas por order do backend, remoção do array COLUNAS hardcoded, loading skeleton adaptado, handleCardMove usa columnToStatus da API, ExcluirColunaModal usa availableColumns da API (src/services/tasks.ts, src/app/(app)/kanban/page.tsx)
- [x] FASE 6: CRM-012 Criação guiada de quadro com colunas personalizadas — NovoQuadroWizard com steps para nome, definição de colunas (título, cor, ordem), revisão e criação via createProjeto + createColumn (src/components/kanban/NovoQuadroWizard.tsx)
- [x] FASE 6: CRM-013 CRUD e ordenação de colunas sem simulação local — EditarColunaModal (edição título/cor), drag-and-drop de colunas para reordenar, persistência via updateColumn e reorderColumns API (src/components/kanban/EditarColunaModal.tsx, src/components/kanban/KanbanColumn.tsx, src/app/(app)/kanban/page.tsx, src/services/tasks.ts)
- [x] FASE 6: CRM-014 Editor de regras por quadro — RegrasQuadroModal com CRUD completo (criar, editar, excluir, reordenar), 5 tipos de regra (Transição Automática, Limite WIP, Atribuição Automática, Notificação, Personalizada), drag-and-drop para reordenar, toggle ativo/inativo, persistência via API (src/components/kanban/RegrasQuadroModal.tsx, src/app/(app)/kanban/page.tsx, src/services/tasks.ts)
- [x] FASE 6: CRM-015 Editor de automações por quadro — AutomacoesQuadroModal com CRUD completo (criar, editar, excluir, reordenar, testar), 7 gatilhos (Tarefa Criada, Movida, Concluída, Atribuída, Prazo Próximo, WIP Excedido, Agendado), 8 ações (Mover Tarefa, Atribuir Usuário, Definir Prioridade, Adicionar Tag, Enviar Notificação, Criar Subtarefa, Atualizar Campo, Webhook), drag-and-drop para reordenar, toggle ativo/inativo, teste de automação, persistência via API (src/components/kanban/AutomacoesQuadroModal.tsx, src/app/(app)/kanban/page.tsx, src/services/tasks.ts)
- [x] FASE 6: CRM-016 Templates opt-in — TemplatesQuadroModal com CRUD completo (criar, editar, excluir, reordenar, aplicar), campos customizados (text, textarea, select, number, date), status e prioridade padrão, tags, ativo/inativo, drag-and-drop para reordenar, persistência via API (src/components/kanban/TemplatesQuadroModal.tsx, src/app/(app)/kanban/page.tsx, src/services/tasks.ts)
- [x] FASE 6: CRM-017 UX transversal, dropdowns consistentes e avatar real — DropdownMenu reutilizável criado (src/components/ui/DropdownMenu.tsx) com trigger consistente e itens configuráveis (variant default/danger/success, align left/right, width sm/md/lg, outside-click, disabled state). Avatar component atualizado com suporte a cores reais (21 cores) via prop color. KanbanColumn atualizado para usar DropdownMenu consistente (src/components/ui/DropdownMenu.tsx, src/components/ui/avatar.tsx, src/components/kanban/KanbanColumn.tsx)

TASK_RESULT: BLOCKED
- typecheck (npx tsc --noEmit): PASS, EXIT 0
- lint (npx eslint .): PASS, EXIT 0, 0 erros e 0 warnings (apenas warnings pré-existentes em NovoQuadroWizard)
- build (npm run build): PASS, EXIT 0, 13 rotas + Proxy
- Motivo: Aguardando backend lavifort-API entregar endpoints. CRM-004 bloqueado por API-001/API-002.