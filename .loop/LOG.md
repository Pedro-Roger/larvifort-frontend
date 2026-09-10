# Loop Log

Formato por iteracao: `YYYY-MM-DD | TASK-ID | PASS/FAIL/BLOCKED | resumo curto`

2026-09-10 | CRM-017 | PASS | UX transversal implementada: DropdownMenu reutilizável criado (src/components/ui/DropdownMenu.tsx) com trigger consistente e itens configuráveis (variant default/danger/success, align left/right, width sm/md/lg, outside-click, disabled state). Avatar component atualizado com suporte a cores reais (21 cores) via prop color. KanbanColumn atualizado para usar DropdownMenu consistente.
2026-09-10 | CRM-016 | PASS | Templates opt-in (TemplatesQuadroModal) implementado com CRUD completo (criar, editar, excluir, reordenar, aplicar), campos customizados (text, textarea, select, number, date), status e prioridade padrão, tags, ativo/inativo, drag-and-drop para reordenar, persistência via API. Integrado no header do Kanban.
2026-09-10 | CRM-015 | PASS | Editor de Automações por Quadro (AutomacoesQuadroModal) implementado com CRUD completo (criar, editar, excluir, reordenar, testar), 7 gatilhos (Tarefa Criada, Movida, Concluída, Atribuída, Prazo Próximo, WIP Excedido, Agendado), 8 ações (Mover Tarefa, Atribuir Usuário, Definir Prioridade, Adicionar Tag, Enviar Notificação, Criar Subtarefa, Atualizar Campo, Webhook), drag-and-drop para reordenar, toggle ativo/inativo, teste de automação, persistência via API. Integrado no header do Kanban ao lado de Regras.
2026-09-10 | CRM-013 | PASS | CRUD e ordenação de colunas completo: EditarColunaModal para editar título/cor, drag-and-drop de colunas para reordenar (handleColumnDragStart/End/Over/Drop), persistência via updateColumn e reorderColumns API.
2026-09-10 | CRM-012 | PASS | Wizard guiado de criação de quadros com colunas personalizadas (NovoQuadroWizard). Passos: nome, colunas (título, cor, ordem), revisão e criação via API. Build passando.
2026-09-10 | CRM-011 | PASS | Kanban renderizado exclusivamente por colunas da API: fetchColumns no service/tasks, colunas ordenadas por 'order' do backend, removido array COLUNAS hardcoded, loading skeleton adaptado, handleCardMove usa columnToStatus derivado das colunas da API, ExcluirColunaModal usa availableColumns da API.
2026-09-09 | CRM-010 | PASS | Módulo de Notificações completo: NotificationProvider, useNotifications hook, NotificationCenter component (variants sidebar/header/icon-only), persistência localStorage + API fallback, preferências de notificação, tipos info/success/warning/error, badge contador no ícone de sino, toast integrado com 4 tipos.
2026-09-08 | CRM-009 | PASS | Herança, hand-off intersetorial e gatilhos implementados (transferTask, PassagemBastaoModal, botão transferir no TaskDetailModal, gatilho Em Revisão).
2026-09-08 | CRM-008 | PASS | TaskDetailModal completo (seletor de responsável, seletor de setor, whatsapp real, ordem de pedido, anexos e persistência).
2026-09-08 | CRM-006 | PASS | Gestão de múltiplos quadros/setores, seletor de setor e AvatarGroup contextual integrado.
2026-09-08 | CRM-007 | PASS | Gestão de Colunas completa. Criar e Excluir colunas com endpoints e migração. Build passando.
2026-09-08 | CRM-002 | PASS | Busca global CMD+K com fetch de (Clientes, Empresas, Tarefas) integrada. Build passando limpo.
2026-09-08 | CRM-INFRA | PASS | Correções de lint/typecheck, package.json scripts atualizados, regressão de tarefas de mocks fake, build 10 rotas passando, verificação limpa.
2026-09-08 | CRM-009 | PASS | Herança de tarefas: parentId no service/modelo; seção de subtarefas vinculadas no TaskDetailModal; indicador ArrowRight no KanbanCard; build passando
2026-09-08 | CRM-008 | PASS | TaskDetailModal implementado com todos os campos (descrição, responsável, WhatsApp, ordem de pedido, anexos, status, excluir); build passando
2026-09-08 | CRM-007 | PASS | NovaColunaModal + KanbanColumn menu de criar/excluir colunas; build passando
2026-09-08 | CRM-006 | PASS | AvatarGroup integrado ao lado do + Nova Tarefa (fetchUsers, avatares, count); build passando
2026-09-08 | CRM-001 | PASS | ConfirmDeleteModal integrado em Agenda e Kanban; typecheck, lint 0 erros/warnings e build 10 rotas passando.
