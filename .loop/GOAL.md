# GOAL - Larvifort CRM (Frontend)

## Objetivo

Completar e integrar o CRM Larvifort com o backend.

## Tech Stack

- Next.js 16.3.4
- React 19.2.8
- Tailwind CSS 4
- Recharts (gráficos)
- Phosphor Icons

## ✅ Já Implementado (26 arquivos)

### Layout
- Sidebar com navegação
- Header com busca e notificações
- Layout autenticado (app/layout)

### Páginas
- Dashboard com gráficos de vendas, atividade, frequência
- Kanban com colunas e cards
- Clientes com listagem e modal de novo contato
- Empresas
- Agenda
- Equipe
- Pesquisa com modal
- Perfil

### Componentes
- Dashboard: GoalChart, VisitChart, SalesRate, WorkloadCard, ClientActivityTable, FrequencySection, ListView
- Kanban: KanbanColumn, KanbanCard, QuickEditDrawer
- Layout: Header, Sidebar
- Modais: NovoContatoModal, NovaPesquisaModal

## 📋 Tasks Pendentes

### FASE 1 - Fundação (Prioridade Alta)

- [x] Configurar API client (axios/fetch) (iterações 3-4)
  - [x] Criar services/api.ts com base URL
  - [x] Configurar interceptores de auth
  - [x] Criar hook useApi

- [x] Implementar tela de Login (iteração 5)
  - [x] Formulário email/senha
  - [x] Validação
  - [x] Integração com POST /auth/login
  - [x] Salvar token no localStorage/cookie

- [x] Implementar autenticação (iterações 6-10)
  - [x] Context de autenticação
  - [x] Protected routes middleware
  - [x] Logout
  - [x] Refresh token

### FASE 2 - Integração (Prioridade Alta)

- [x] Dashboard via API (iteração 11 — contracto no frontend; endpoints ainda pendentes no backend lavifort-API)
  - [x] Substituir dados mockados
  - [x] GET /dashboard/stats
  - [x] GET /dashboard/charts

- [x] Clientes via API (iterações 12-15)
  - [x] GET /clients (listagem com paginação e busca) (iteração 12)
  - [x] POST /clients (novo cliente via NovoContatoModal) (iteração 13)
  - [x] PATCH /clients/:id (editar via EditarContatoModal) (iteração 14)
  - [x] DELETE /clients/:id (excluir via ConfirmDeleteModal + dropdown menu) (iteração 15)
  - [x] Filtros por status (iteração 12 — filtro por responsável pendente de schema no backend)

- [x] Empresas via API (iteração 16)
  - [x] GET /companies (listagem com paginação) (iteração 16)
  - [x] POST /companies (nova empresa no grupo) (iteração 16)
  - [x] PATCH /companies/:id (atualizar empresa) (iteração 16)
  - [x] DELETE /companies/:id (excluir empresa) (iteração 16)

### FASE 3 - Funcionalidades (Prioridade Média)

- [x] Kanban via API (iteração 17)
  - [x] GET /tasks (iteração 17)
  - [x] POST /tasks (iteração 17 — NovaTarefaModal)
  - [x] PATCH /tasks/:id/status (drag and drop) (iteração 17)
  - [x] PATCH /tasks/:id (edição com QuickEditDrawer) (iteração 17)
  - [x] Atribuir usuário (pendente de módulo /users no backend)

- [x] Agenda via API (iteração 18)
  - [x] GET /appointments (iteração 18)
  - [x] POST /appointments (iteração 18 — NovoCompromissoModal)
  - [x] Calendário interativo com filtros e busca (iteração 18)

- [x] Equipe via API (iteração 19)
  - [x] GET /users (iteração 19)
  - [x] GET /teams (iteração 19)
  - [x] POST /users (iteração 19 — NovoUsuarioModal)
  - [x] POST /teams (iteração 19 — NovoTimeModal)
  - [x] PATCH /users/:id (iteração 19 — troca de role)
  - [x] DELETE /users/:id (iteração 19)
  - [x] DELETE /teams/:id (iteração 19)

- [x] Pesquisa via API (iteração 20)
  - [x] GET /searches (iteração 20)
  - [x] POST /searches (iteração 20 — NovaPesquisaModal)
  - [x] DELETE /searches/:id (iteração 20)
  - [x] Busca e filtros integrados (iteração 20)

### FASE 4 - UX (Prioridade Baixa)

- [x] Loading states (skeletons) (iteração 22)
- [x] Error states (fallbacks) (iteração 23)
- [x] Toast/notificações (iteração 21)
- [x] Confirmações de delete (iteração 24)
- [x] Busca global
- [x] Atalhos de teclado

### FASE 5 - Módulo Operacional de Tarefas & Setores (Prioridade Alta)

#### Frontend (CRM):
- [x] Múltiplos Quadros & Setores Operacionais (`CRM-006`)
  - [x] Gestão de Quadros por Setor (*Comercial*, *Financeiro*, *Desenvolvimento*, *Operações*, *Administrativo*)
  - [x] Alternância rápida e isolamento de tarefas por setor no Kanban
  - [x] Exibição de Avatares dos membros/participantes do setor ao lado do botão `+ Nova Tarefa` via `AvatarGroup`
- [x] Gestão Dinâmica de Colunas (`CRM-007`)
  - [x] Criar colunas personalizadas por quadro (Título, Cor, Gatilhos de transição)
  - [x] Exclusão de coluna com modal obrigatório de migração de tarefas existentes
  - [x] Reordenação e persistência de colunas por quadro
- [x] Modal Completa de Tarefa (`TaskDetailModal`) (`CRM-008`)
  - [x] Edição de Título e Descrição detalhada/orientações operacionais
  - [x] Seletor de Responsável com busca e avatares da equipe
  - [x] Ação rápida de WhatsApp (`wa.me`) com mensagens pré-formatadas
  - [x] Visualizador de Ordem de Pedido vinculada (itens, valor total, status)
  - [x] Seletor de Status/Coluna e Transferência direta entre setores
  - [x] Gestor de Anexos (upload, pré-visualização, download e exclusão)
- [x] Herança de Tarefas & Hand-off Intersetorial (`CRM-009`)
  - [x] Relação Tarefa-Mãe ⇄ Tarefas-Filhas (`parentId`)
  - [x] Cálculo de progresso consolidado na tarefa-mãe
  - [x] Automação de transição: ao mover para coluna-gatilho, abrir modal de passagem de bastão (Transferir ou Gerar Tarefa-Filha no setor destino)
  - [x] Trilha de histórico de transferências (`originBoardId` ➜ `currentBoardId`)
- [x] Módulo de Notificações (`CRM-010`)
  - [x] Notification Center (bell icon + dropdown drawer)
  - [x] Lista de notificações com persistência (localStorage + API)
  - [x] Tipos: info, success, warning, error
  - [x] Marcar como lida/não lida
  - [x] Arquivar/excluir notificações
  - [x] Badge contador no ícone de sino
  - [x] Toast notifications integradas (success, error, warning, info)
  - [x] Preferências de notificação por usuário

#### Backend (`lavifort-api` - Endpoints Previstos):
- [ ] Módulo de Quadros e Colunas (`API-003`)
  - [ ] `GET /tasks/boards` (listar quadros/setores)
  - [ ] `POST /tasks/boards` (criar quadro)
  - [ ] `PATCH /tasks/boards/:id` (atualizar quadro)
  - [ ] `DELETE /tasks/boards/:id` (remover quadro)
  - [ ] `GET /tasks/boards/:boardId/columns` (listar colunas do quadro)
  - [ ] `POST /tasks/boards/:boardId/columns` (criar coluna com triggerAction)
  - [ ] `PATCH /tasks/columns/:id` (atualizar coluna)
  - [ ] `DELETE /tasks/columns/:id` (remover coluna migrando tarefas via `moveToColumnId`)
- [ ] Módulo Operacional de Tarefas, Herança e Anexos (`API-004`)
  - [ ] `GET /tasks` (filtros por `boardId`, `columnId`, `search`, `status`, `assigneeId`, `parentId`)
  - [ ] `GET /tasks/:id` (detalhes completos com anexos, histórico, ordem de pedido e tarefas-filhas)
  - [ ] `POST /tasks` (criação com suporte a `parentId`, `orderId`, `phone`)
  - [ ] `PATCH /tasks/:id` (atualização completa)
  - [ ] `PATCH /tasks/:id/status` (movimentação com trigger de automação)
  - [ ] `POST /tasks/:id/transfer` (hand-off intersetorial: modo MOVE ou CHILD_TASK com nota)
  - [ ] `DELETE /tasks/:id` (exclusão de tarefa)
  - [ ] `POST /tasks/:id/attachments` (upload multipart de anexo)
  - [ ] `DELETE /tasks/:id/attachments/:attachmentId` (excluir anexo)
- [ ] Módulo de Vínculo de Ordens de Pedido (`API-005`)
  - [ ] `GET /orders` (listagem com busca e filtro por cliente)
  - [ ] `GET /orders/:id` (detalhes da ordem para visualização na tarefa)

## Critérios de Conclusão

### FASE 6 - Módulo de Projetos inspirado no UPSprint

- [x] CRM-011: Kanban renderizado exclusivamente por colunas reais da API
- [x] CRM-012: Criação guiada de quadro com colunas personalizadas
- [x] CRM-013: CRUD e ordenação de colunas sem simulação local
- [x] CRM-014: Editor de regras por quadro
- [x] CRM-015: Editor de automações por quadro
- [x] CRM-016: Templates opt-in
- [x] CRM-017: UX transversal, dropdowns consistentes e avatar real

- [ ] Backend publicado antes dos fluxos dependentes do frontend
- [x] Zero fallback/mock nos fluxos de produção

- [x] Zero dados mockados em produção
- [x] Typecheck passa
- [x] Lint passa
- [x] Build passa
- [ ] Fluxo login → dashboard → CRUD completo (aguarda backend)

### FASE 7 - Compromissos, automação e confirmação de atividade

- [x] CRM-018: `Novo compromisso` usa somente clientes reais cadastrados
- [x] CRM-019: Automação permite escolher a coluna real que recebe compromissos
- [x] CRM-020: Card de compromisso mostra cliente/atividade e permite check-in
- [ ] CRM-021: Fluxo integrado validado em desktop e mobile sem mock/fallback (aguarda backend)

#### Resultado esperado

O usuário seleciona um cliente real ao agendar, configura no quadro a coluna de
entrada dos compromissos e confirma a atividade no card. A interface captura
uma única localização mediante ação explícita e exibe a data/hora confirmada
pela API.

## Comandos

```bash
npm run typecheck
npm run lint
npm run build
```
