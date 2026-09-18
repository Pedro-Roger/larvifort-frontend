# Métricas com três modos de construção Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir criar análises no modo Guiado, Blocos ou Avançado e publicar cada análise no dashboard.

**Architecture:** Manter a página de Métricas como orquestradora e extrair os três fluxos para componentes focados. Persistir uma definição serializável de análise no serviço de métricas e reutilizar a configuração de widgets já existente para dashboard.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules, Jest, serviços HTTP existentes.

---

### Task 1: Modelar análises persistíveis

**Files:**
- Modify: `src/services/metrics.ts`
- Create: `src/services/metricAnalyses.ts`
- Test: `src/services/metricAnalyses.test.ts`

- [ ] Definir `MetricAnalysis`, `MetricSource`, `MetricFilter`, `MetricVisualization` e `MetricMode` (`guided`, `blocks`, `advanced`).
- [ ] Implementar armazenamento local versionado para criar, atualizar, duplicar, remover e alternar publicação no dashboard.
- [ ] Testar serialização, duplicação e remoção sem dados fictícios.
- [ ] Executar `npm test -- --runInBand src/services/metricAnalyses.test.ts`.
- [ ] Commitar `feat: persistir analises de metricas`.

### Task 2: Extrair seletor e componentes dos três modos

**Files:**
- Create: `src/app/(app)/metricas/MetricModeSelector.tsx`
- Create: `src/app/(app)/metricas/GuidedMetricBuilder.tsx`
- Create: `src/app/(app)/metricas/MetricBlocksView.tsx`
- Create: `src/app/(app)/metricas/AdvancedMetricBuilder.tsx`
- Modify: `src/app/(app)/metricas/MetricsAnalysis.tsx`

- [ ] Criar seletor acessível com os três modos e preservar o rascunho ao trocar de modo.
- [ ] Implementar Guiado com fonte A, fonte B opcional, período, filtros, visualização, meta e salvar.
- [ ] Implementar Blocos com adicionar, editar, duplicar, ocultar, excluir e publicar.
- [ ] Implementar Avançado com múltiplas fontes, operações de diferença, percentual, razão e agregação, mostrando a expressão antes de salvar.
- [ ] Rejeitar combinações sem fonte ou sem dimensão temporal e exibir estado vazio explícito.
- [ ] Adicionar testes de interação para troca de modo e salvamento.
- [ ] Executar `npm test -- --runInBand 'src/app/(app)/metricas'`.
- [ ] Commitar `feat: adicionar tres modos de metricas`.

### Task 3: Integrar fontes reais e metas

**Files:**
- Modify: `src/services/metrics.ts`
- Modify: `src/app/(app)/metricas/page.tsx`
- Modify: `src/app/(app)/metricas/MetricsAnalysis.tsx`
- Test: `src/app/(app)/metricas/page.test.tsx`

- [ ] Expor catálogo de pedidos, faturamento, visitas, reuniões, clientes, estoque, reservas, laboratório, separação, entregas e pós-venda.
- [ ] Reusar as mesmas fontes para eixo A, eixo B e filtros.
- [ ] Vincular metas à definição da métrica, sem manter configuração separada como destino principal.
- [ ] Renderizar erro, carregamento e ausência de dados com estado explícito.
- [ ] Executar testes de página e lint.
- [ ] Commitar `feat: conectar fontes operacionais nas metricas`.

### Task 4: Publicar e posicionar widgets no dashboard

**Files:**
- Modify: `src/services/dashboardCustomization.ts`
- Modify: `src/components/dashboard/DashboardCustomizerModal.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Test: `src/services/dashboardCustomization.test.ts`

- [ ] Transformar análise publicada em widget sem duplicar a definição.
- [ ] Permitir mover, ocultar, editar, duplicar e remover o widget.
- [ ] Renderizar widget conforme visualização salva e refletir filtros/período.
- [ ] Validar layout responsivo desktop/mobile.
- [ ] Executar `npm test -- --runInBand src/services/dashboardCustomization.test.ts` e `npm run build`.
- [ ] Commitar `feat: publicar analises no dashboard`.

### Task 5: Remover o caminho separado de metas e validar fluxo completo

**Files:**
- Modify: `src/app/(app)/configurar-metas/page.tsx`
- Modify: `src/components/dashboard/MetasOverviewWidget.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/(app)/configurar-metas/configurar-metas.test.tsx`

- [ ] Retirar o acesso principal a “Configurar metas” e apontar o usuário para Métricas.
- [ ] Preservar leitura de metas existentes enquanto elas migram para análises salvas.
- [ ] Atualizar testes e textos para refletir Métricas como centro de metas.
- [ ] Executar `npm run lint`, `npm run build` e a suíte de testes relevante.
- [ ] Commitar `refactor: centralizar metas em metricas`.
