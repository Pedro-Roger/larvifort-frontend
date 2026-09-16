# Métricas no Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** permitir que a tela de Métricas adicione visualizações personalizadas ao Dashboard e que o Dashboard fique limpo quando não houver widgets escolhidos.

**Architecture:** salvar widgets escolhidos no navegador por usuário via `localStorage`, com um serviço pequeno para leitura/escrita. A página de Métricas cria a configuração do widget a partir dos filtros atuais. O Dashboard lê esses widgets e renderiza cards simples com link para Métricas; quando não há widgets, mostra um estado vazio.

**Tech Stack:** Next.js/React, TypeScript, localStorage, testes Jest/Testing Library.

---

### Task 1: Storage de widgets

**Files:**
- Create: `src/services/dashboardWidgets.ts`

- [ ] Criar tipos `DashboardMetricWidget` e funções `loadDashboardWidgets`, `addDashboardWidget`, `removeDashboardWidget`, `clearDashboardWidgets` usando chave `larvifort:dashboard-widgets:v1`.

### Task 2: Adicionar em Métricas

**Files:**
- Modify: `src/app/(app)/metricas/MetricsAnalysis.tsx`
- Test: `src/app/(app)/metricas/MetricsAnalysis.test.tsx`

- [ ] Receber metadados da seleção e adicionar botão “Adicionar ao Dashboard”.
- [ ] Salvar a configuração quando os dados estiverem carregados.
- [ ] Exibir mensagem “Adicionado ao Dashboard”.

### Task 3: Dashboard limpo/personalizável

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] Ler widgets salvos.
- [ ] Se houver widgets, mostrar seção “Dashboard personalizado” e botões para remover widgets.
- [ ] Se não houver widgets, mostrar estado limpo com link “Configurar em Métricas”.

### Task 4: Verificação e publicação

- [ ] Rodar lint, typecheck, build e testes de Métricas.
- [ ] Commitar somente arquivos relacionados.
- [ ] Fazer push e esperar Vercel ficar Ready.
- [ ] Validar `/metricas` e `/dashboard` em produção.
