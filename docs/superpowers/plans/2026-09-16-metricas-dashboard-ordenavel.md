# Métricas com Blocos Ordenáveis no Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir escolher até dois modos de visualização em Métricas e reposicionar os blocos salvos no Dashboard.

**Architecture:** O estado dos blocos continua em `dashboardWidgets.ts` via `localStorage`. Métricas passa a salvar um bloco por modo selecionado. Dashboard passa a chamar funções de reordenação para mover blocos para cima ou para baixo.

**Tech Stack:** Next.js App Router, React client components, TypeScript, localStorage, Phosphor icons.

---

### Task 1: Multi-seleção em Métricas

**Files:**
- Modify: `src/app/(app)/metricas/MetricsAnalysis.tsx`

- [ ] Trocar `mode` por `selectedModes` com limite de 2.
- [ ] Atualizar os botões para `aria-pressed` por modo selecionado.
- [ ] Ao adicionar ao Dashboard, salvar um widget por modo selecionado.
- [ ] Mostrar mensagem clara com quantidade de blocos adicionados.

### Task 2: Reordenação persistida

**Files:**
- Modify: `src/services/dashboardWidgets.ts`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] Criar `moveDashboardWidget(id, direction)` no serviço.
- [ ] Adicionar botões de mover para cima/baixo no card do Dashboard.
- [ ] Desabilitar botão de subir no primeiro card e descer no último card.
- [ ] Persistir a nova ordem no `localStorage`.

### Task 3: Validação

**Commands:**
- `npm --prefix larvifort-crm run lint`
- `npm --prefix larvifort-crm run typecheck`
- `npm --prefix larvifort-crm run build`
- `cd larvifort-crm && npx jest --runTestsByPath 'src/app/(app)/metricas/page.test.tsx' 'src/app/(app)/metricas/MetricsAnalysis.test.tsx' --runInBand --forceExit`

