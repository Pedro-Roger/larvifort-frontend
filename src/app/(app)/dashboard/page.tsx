"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CaretDown,
  Clock,
  SlidersHorizontal,
  Target,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  fetchDashboardStats,
  fetchDashboardCharts,
  type DashboardStats,
  type DashboardCharts,
} from "@/services/dashboard";
import { fetchTasks, type StatusTarefa, type Task } from "@/services/tasks";
import { summarizeActivities } from "@/services/dashboardMetrics";
import {
  loadCommercialGoals,
  COMMERCIAL_METAS_EVENT,
  type CommercialGoalsConfig,
  calcGoalsTotals,
} from "@/services/commercialMetas";
import {
  loadDashboardLayout,
  DASHBOARD_LAYOUT_EVENT,
  type DashboardLayoutItem,
} from "@/services/dashboardCustomization";
import {
  loadDashboardWidgets,
  moveDashboardWidget,
  removeDashboardWidget,
  DASHBOARD_WIDGETS_EVENT,
  type DashboardMetricWidget,
} from "@/services/dashboardWidgets";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import MetasOverviewWidget from "@/components/dashboard/MetasOverviewWidget";
import MetasConsultoresWidget from "@/components/dashboard/MetasConsultoresWidget";
import GoalChart from "@/components/dashboard/GoalChart";
import SalesRate from "@/components/dashboard/SalesRate";
import VisitChart from "@/components/dashboard/VisitChart";
import FrequencySection from "@/components/dashboard/FrequencySection";
import WorkloadCard from "@/components/dashboard/WorkloadCard";
import DynamicMetricWidgetCard from "@/components/dashboard/DynamicMetricWidgetCard";
import DashboardCustomizerModal from "@/components/dashboard/DashboardCustomizerModal";

const statusConfig: Record<
  StatusTarefa,
  { label: string; dot: string; badge: string }
> = {
  BACKLOG: {
    label: "Pendentes",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700",
  },
  EM_REVISAO: {
    label: "Em revisão",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  CONCLUIDO: {
    label: "Concluídas",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },
};

function LoadingCard() {
  return (
    <div className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white p-6">
      <div className="h-9 w-9 rounded-2xl bg-slate-100" />
      <div className="mt-5 h-7 w-28 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-8 p-4 sm:p-6 xl:p-8">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid gap-5 md:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>
      <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-8">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center max-w-xl mx-auto">
        <Warning size={36} className="mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-red-700 text-lg">
          Não foi possível carregar as informações do Dashboard
        </h3>
        <p className="mt-1 text-sm text-red-600">
          Verifique a conexão com a API e tente novamente.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer shadow-md shadow-red-600/20"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function ActivityList({ tasks }: { tasks: Task[] }) {
  const recent = [...tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={20} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Atividades Recentes do CRM
            </h2>
            <p className="text-xs text-slate-500">
              Últimas movimentações e status de tarefas
            </p>
          </div>
        </div>

        <Link
          href="/kanban"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Ver Kanban →
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {recent.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            Nenhuma atividade encontrada no período selecionado.
          </p>
        ) : (
          recent.map((task) => {
            const status = statusConfig[task.status] || statusConfig.BACKLOG;
            return (
              <div key={task.id} className="flex items-center gap-3 py-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                    {task.titulo}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {task.assigneeName || "Sem responsável"} •{" "}
                    {task.prioridade || "Normal"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.badge}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  // Customization & Metas state
  const [layoutItems, setLayoutItems] = useState<DashboardLayoutItem[]>(() =>
    loadDashboardLayout(),
  );
  const [commercialGoals, setCommercialGoals] = useState<CommercialGoalsConfig>(
    () => loadCommercialGoals(),
  );
  const [dynamicWidgets, setDynamicWidgets] = useState<DashboardMetricWidget[]>(
    () => loadDashboardWidgets(),
  );
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Filter state
  const [periodFilter, setPeriodFilter] = useState<
    "month" | "quarter" | "year" | "all"
  >("month");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter] = useState<StatusTarefa | "all">("all");
  const [teamSort, setTeamSort] = useState<
    "progress" | "activities" | "pending"
  >("progress");
  const [showInactiveMembers] = useState(false);

  // Listen to Layout changes & Metas changes
  useEffect(() => {
    const refreshLayout = () => setLayoutItems(loadDashboardLayout());
    const refreshGoals = () => setCommercialGoals(loadCommercialGoals());
    const refreshDynamic = () => setDynamicWidgets(loadDashboardWidgets());

    window.addEventListener(DASHBOARD_LAYOUT_EVENT, refreshLayout);
    window.addEventListener(COMMERCIAL_METAS_EVENT, refreshGoals);
    window.addEventListener(DASHBOARD_WIDGETS_EVENT, refreshDynamic);
    window.addEventListener("storage", refreshLayout);
    window.addEventListener("storage", refreshGoals);
    window.addEventListener("storage", refreshDynamic);

    return () => {
      window.removeEventListener(DASHBOARD_LAYOUT_EVENT, refreshLayout);
      window.removeEventListener(COMMERCIAL_METAS_EVENT, refreshGoals);
      window.removeEventListener(DASHBOARD_WIDGETS_EVENT, refreshDynamic);
      window.removeEventListener("storage", refreshLayout);
      window.removeEventListener("storage", refreshGoals);
      window.removeEventListener("storage", refreshDynamic);
    };
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setTryCount((count) => count + 1);
  }, []);

  // Fetch Stats, Charts and Tasks
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchDashboardStats().catch(() => null),
      fetchDashboardCharts().catch(() => null),
      fetchTasks().catch(() => []),
    ])
      .then(([statsResult, chartsResult, tasksResult]) => {
        if (cancelled) return;
        if (statsResult) setStats(statsResult);
        if (chartsResult) setCharts(chartsResult);
        setTasks(tasksResult || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tryCount]);

  // Client-side task filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (assigneeFilter !== "all" && task.assigneeName !== assigneeFilter)
        return false;
      if (periodFilter !== "all") {
        const taskDate = new Date(task.updatedAt);
        const now = new Date();
        if (periodFilter === "month") {
          if (
            taskDate.getMonth() !== now.getMonth() ||
            taskDate.getFullYear() !== now.getFullYear()
          )
            return false;
        } else if (periodFilter === "quarter") {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const taskQuarter = Math.floor(taskDate.getMonth() / 3);
          if (
            taskQuarter !== currentQuarter ||
            taskDate.getFullYear() !== now.getFullYear()
          )
            return false;
        } else if (periodFilter === "year") {
          if (taskDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [tasks, periodFilter, assigneeFilter, statusFilter]);

  const assignees = useMemo(() => {
    const names = new Set(
      tasks
        .map((t) => t.assigneeName)
        .filter((name): name is string => Boolean(name)),
    );
    return Array.from(names).sort();
  }, [tasks]);

  const teamMembers = stats?.teamMembers ?? [];
  const visibleMembers =
    teamMembers.length > 0
      ? teamMembers
      : Array.from(
          new Map(
            filteredTasks
              .filter((task) => task.assigneeName)
              .map((task) => [
                task.assigneeName,
                {
                  name: task.assigneeName!,
                  initials: task.assigneeInitials || "",
                  notDone: 0,
                  done: 0,
                  timeEstimate: { notDone: "0h", done: "0h" },
                  remaining: "0h",
                  ready: 0,
                  inProgress: 0,
                  review: 0,
                },
              ]),
          ).values(),
        );

  const memberRows = visibleMembers.map((member) => {
    const memberTasks = filteredTasks.filter(
      (task) => task.assigneeName === member.name,
    );
    return {
      member,
      tasks: memberTasks,
      summary: summarizeActivities(memberTasks),
    };
  });
  const activeMemberRows = memberRows.filter(
    ({ summary }) => summary.total > 0,
  );
  const displayedMemberRows = [
    ...(showInactiveMembers ? memberRows : activeMemberRows),
  ].sort((a, b) => {
    if (teamSort === "activities") return b.summary.total - a.summary.total;
    if (teamSort === "pending") return b.summary.pending - a.summary.pending;
    return b.summary.completionRate - a.summary.completionRate;
  });

  // Goal chart data computed directly from commercial goals & real stats
  const goalChartData = useMemo(() => {
    if (charts?.goalData && charts.goalData.length > 0) {
      return charts.goalData;
    }
    return commercialGoals.consultores.map((c) => ({
      vendedor: c.nome,
      valorAtual: c.realizadoValor || 0,
      valorMeta: c.valor || 0,
      volumeAtual: c.realizadoVolume || 0,
      volumeMeta: c.volume || 0,
    }));
  }, [charts, commercialGoals]);

  // Sales Rate General & Per Person
  const salesGeralData = useMemo(() => {
    const totals = calcGoalsTotals(commercialGoals);
    return {
      totalClientes: stats?.salesGeral?.totalClientes ?? 0,
      clientesAtivos: stats?.salesGeral?.clientesAtivos ?? 0,
      taxaConversao: stats?.salesGeral?.taxaConversao ?? 0,
      receitaTotal:
        stats?.salesGeral?.receitaTotal ?? totals.totalRealizadoValor ?? 0,
      ticketMedio: stats?.salesGeral?.ticketMedio ?? 0,
      vendasMes: stats?.salesGeral?.vendasMes ?? 0,
      metaValor: commercialGoals.metaGlobalValor,
      metaVolume: commercialGoals.metaGlobalVolume,
      visitas: stats?.salesGeral?.visitas ?? 0,
      clientesRetornando: stats?.salesGeral?.clientesRetornando ?? 0,
    };
  }, [stats, commercialGoals]);

  const salesPorPessoaData = useMemo(() => {
    if (stats?.salesPorPessoa && stats.salesPorPessoa.length > 0) {
      return stats.salesPorPessoa;
    }
    return commercialGoals.consultores.map((c) => ({
      nome: c.nome,
      initials: c.iniciais,
      clientes: c.contas || 0,
      vendas: c.vendas || 0,
      conversao: c.conversao || 0,
      receita: c.realizadoValor || 0,
      metaValor: c.valor || 0,
      metaVolume: c.volume || 0,
    }));
  }, [stats, commercialGoals]);

  const visitData = useMemo(() => stats?.visitData ?? [], [stats]);

  const frequencyData = useMemo(() => stats?.frequencyData ?? [], [stats]);

  // Dynamic metric widgets handlers
  const handleMoveDynamicWidget = useCallback(
    (id: string, direction: "up" | "down") => {
      setDynamicWidgets(moveDashboardWidget(id, direction));
    },
    [],
  );

  const handleRemoveDynamicWidget = useCallback((id: string) => {
    setDynamicWidgets(removeDashboardWidget(id));
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={retry} />;

  // Filter enabled layout items
  const enabledLayoutItems = layoutItems.filter((it) => it.enabled);

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 xl:p-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Operação Comercial & Metas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Acompanhamento executivo, metas comerciais e performance do time
          </p>
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          {/* Period Filter */}
          <DropdownMenu
            align="left"
            width="sm"
            trigger={
              <button
                type="button"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition sm:flex-none cursor-pointer"
              >
                {periodFilter === "month"
                  ? "Este mês"
                  : periodFilter === "quarter"
                    ? "Este trimestre"
                    : periodFilter === "year"
                      ? "Este ano"
                      : "Todo o período"}
                <CaretDown size={14} />
              </button>
            }
            items={[
              { label: "Este mês", onClick: () => setPeriodFilter("month") },
              {
                label: "Este trimestre",
                onClick: () => setPeriodFilter("quarter"),
              },
              { label: "Este ano", onClick: () => setPeriodFilter("year") },
              {
                label: "Todo o período",
                onClick: () => setPeriodFilter("all"),
              },
            ]}
          />

          {/* Assignee Filter */}
          <DropdownMenu
            align="left"
            width="sm"
            trigger={
              <button
                type="button"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition sm:flex-none cursor-pointer"
              >
                <UsersThree size={16} />
                {assigneeFilter === "all" ? "Equipe Toda" : assigneeFilter}
                <CaretDown size={14} />
              </button>
            }
            items={[
              { label: "Equipe Toda", onClick: () => setAssigneeFilter("all") },
              ...(assignees.map((name) => ({
                label: name,
                onClick: () => setAssigneeFilter(name),
              })) as Array<{ label: string; onClick: () => void }>),
            ]}
          />

          {/* Customize Layout Button */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            title="Personalizar layout e escolher o que aparece no dashboard"
          >
            <SlidersHorizontal
              size={16}
              weight="bold"
              className="text-brand-600"
            />
            <span>Personalizar</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
              {enabledLayoutItems.length}
            </span>
          </button>

          {/* Define Goals Link */}
          <Link
            href="/configurar-metas"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition cursor-pointer"
          >
            <Target size={16} weight="bold" />
            <span>Definir Metas</span>
          </Link>
        </div>
      </header>

      {/* Dynamic Metric Widgets from /metricas (if any) */}
      {dynamicWidgets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Métricas Personalizadas Fixadas ({dynamicWidgets.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {dynamicWidgets.map((widget, idx) => (
              <DynamicMetricWidgetCard
                key={widget.id}
                widget={widget}
                index={idx}
                total={dynamicWidgets.length}
                onMove={handleMoveDynamicWidget}
                onRemove={handleRemoveDynamicWidget}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Widgets Ordered by Layout Items */}
      {enabledLayoutItems.length === 0 && dynamicWidgets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <SlidersHorizontal size={28} weight="bold" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            Nenhum bloco ativo no seu Dashboard
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Você pode escolher quais métricas, gráficos e tabelas deseja
            visualizar na tela.
          </p>
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 cursor-pointer"
          >
            <SlidersHorizontal size={16} weight="bold" />
            <span>Escolher Widgets Agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {enabledLayoutItems.map((item) => {
            switch (item.id) {
              case "metas_overview":
                return (
                  <MetasOverviewWidget key={item.id} goals={commercialGoals} />
                );

              case "metas_consultores":
                return (
                  <MetasConsultoresWidget
                    key={item.id}
                    goals={commercialGoals}
                  />
                );

              case "goal_chart":
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Comparativo de Metas e Expedição
                      </h3>
                      <Link
                        href="/configurar-metas"
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Configurar Metas →
                      </Link>
                    </div>
                    <GoalChart data={goalChartData} />
                  </div>
                );

              case "sales_rate":
                return (
                  <div key={item.id}>
                    <SalesRate
                      geral={salesGeralData}
                      porPessoa={salesPorPessoaData}
                    />
                  </div>
                );

              case "team_workload":
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
                          <UsersThree size={20} weight="bold" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            Produtividade e Carga da Equipe
                          </h2>
                          <p className="text-xs text-slate-500">
                            Tarefas e tempo estimado por membro
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DropdownMenu
                          align="left"
                          width="sm"
                          trigger={
                            <button
                              type="button"
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Ordenar:{" "}
                              {teamSort === "activities"
                                ? "Mais tarefas"
                                : teamSort === "pending"
                                  ? "Mais pendências"
                                  : "Maior progresso"}
                            </button>
                          }
                          items={[
                            {
                              label: "Maior progresso",
                              onClick: () => setTeamSort("progress"),
                            },
                            {
                              label: "Mais tarefas",
                              onClick: () => setTeamSort("activities"),
                            },
                            {
                              label: "Mais pendências",
                              onClick: () => setTeamSort("pending"),
                            },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {displayedMemberRows.map(({ member }) => (
                        <WorkloadCard key={member.name} {...member} />
                      ))}
                    </div>
                  </div>
                );

              case "visit_chart":
                return (
                  <div key={item.id} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Visitas Presenciais a Clientes (GPS)
                    </h3>
                    <VisitChart data={visitData} />
                  </div>
                );

              case "client_frequency":
                return (
                  <div key={item.id} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Frequência de Compras e Últimos Contatos
                    </h3>
                    <FrequencySection
                      chartData={visitData}
                      tableData={frequencyData}
                    />
                  </div>
                );

              case "recent_activity":
                return <ActivityList key={item.id} tasks={filteredTasks} />;

              default:
                return null;
            }
          })}
        </div>
      )}

      {/* Dashboard Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        layoutItems={layoutItems}
        onUpdateLayout={(newItems) => setLayoutItems(newItems)}
      />
    </div>
  );
}
