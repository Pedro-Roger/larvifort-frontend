"use client";
import Link from "next/link";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CaretDown,
  Clock,
  Funnel,
  Kanban,
  List,
  Plus,
  Trash,
  Target,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  fetchDashboardStats,
  type DashboardStats,
} from "@/services/dashboard";
import { fetchTasks, type StatusTarefa, type Task } from "@/services/tasks";
import { summarizeActivities } from "@/services/dashboardMetrics";
import {
  DASHBOARD_WIDGETS_EVENT,
  loadDashboardWidgets,
  removeDashboardWidget,
  type DashboardMetricWidget,
} from "@/services/dashboardWidgets";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

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
    <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="h-9 w-9 rounded-full bg-slate-100" />
      <div className="mt-5 h-7 w-20 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-8 p-6 xl:p-8">
      <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-8">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <Warning size={32} className="mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-red-700">
          Não foi possível carregar as atividades
        </h3>
        <p className="mt-1 text-sm text-red-600">
          Verifique a conexão com a API e tente novamente.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function PersonalizedWidgetCard({
  widget,
  onRemove,
}: {
  widget: DashboardMetricWidget;
  onRemove: (id: string) => void;
}) {
  const modeLabel =
    widget.mode === "charts"
      ? "Gráficos"
      : widget.mode === "table"
        ? "Tabela"
        : "Cards";
  const axisLabel = widget.axis === "value" ? "Valor" : "Quantidade";
  const groupLabel = widget.group === "period" ? "Período" : "Perfil";
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            {modeLabel}
          </p>
          <h3 className="mt-2 truncate text-base font-bold text-slate-950">
            {widget.typeLabel}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{widget.teamName}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(widget.id)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remover ${widget.title}`}
        >
          <Trash size={17} />
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-600">
          {widget.periodLabel}
        </span>
        <span className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-600">
          {axisLabel}
        </span>
        <span className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-600">
          {groupLabel}
        </span>
        <span className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-600">
          {widget.userIds.length || "Todas"} pessoas
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        {widget.startDate} até {widget.endDate}
      </p>
    </article>
  );
}

function EmptyPersonalDashboard() {
  return (
    <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Target size={24} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-950">
        Seu Dashboard está limpo
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
        Vá em Métricas, escolha o indicador, período, visualização e adicione ao Dashboard.
      </p>
      <Link
        href="/metricas"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
      >
        Configurar em Métricas
      </Link>
    </section>
  );
}

function ActivityList({ tasks }: { tasks: Task[] }) {
  const recent = [...tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);
  return (
    <div className="divide-y divide-slate-100">
      {recent.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">
          Nenhuma atividade encontrada.
        </p>
      ) : (
        recent.map((task) => {
          const status = statusConfig[task.status];
          return (
            <div key={task.id} className="flex items-center gap-3 px-5 py-3.5">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {task.titulo}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {task.assigneeName || "Sem responsável"}
                </p>
              </div>
              <span
                className={`hidden rounded-full px-2 py-1 text-[11px] font-semibold sm:inline-flex ${status.badge}`}
              >
                {status.label}
              </span>
              <Clock size={14} className="shrink-0 text-slate-300" />
            </div>
          );
        })
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardMetricWidget[]>(() =>
    loadDashboardWidgets(),
  );

  // Filter state
  const [periodFilter, setPeriodFilter] = useState<"month" | "quarter" | "year" | "all">("month");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusTarefa | "all">("all");
  const [teamSort, setTeamSort] = useState<"progress" | "activities" | "pending">("progress");
  const [showInactiveMembers, setShowInactiveMembers] = useState(false);


  useEffect(() => {
    const refresh = () => setDashboardWidgets(loadDashboardWidgets());
    window.addEventListener(DASHBOARD_WIDGETS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DASHBOARD_WIDGETS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const removePersonalWidget = useCallback((id: string) => {
    setDashboardWidgets(removeDashboardWidget(id));
  }, []);
  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setTryCount((count) => count + 1);
  }, []);

  // Apply client-side filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) return false;

      // Assignee filter
      if (assigneeFilter !== "all" && task.assigneeName !== assigneeFilter) return false;

      // Period filter
      if (periodFilter !== "all") {
        const taskDate = new Date(task.updatedAt);
        const now = new Date();
        if (periodFilter === "month") {
          if (taskDate.getMonth() !== now.getMonth() || taskDate.getFullYear() !== now.getFullYear()) return false;
        } else if (periodFilter === "quarter") {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const taskQuarter = Math.floor(taskDate.getMonth() / 3);
          if (taskQuarter !== currentQuarter || taskDate.getFullYear() !== now.getFullYear()) return false;
        } else if (periodFilter === "year") {
          if (taskDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [tasks, periodFilter, assigneeFilter, statusFilter]);

  // Get unique assignees for filter dropdown
  const assignees = useMemo(() => {
    const names = new Set(tasks.map((t) => t.assigneeName).filter(Boolean));
    return Array.from(names).sort();
  }, [tasks]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDashboardStats(), fetchTasks()])
      .then(([statsResult, tasksResult]) => {
        if (cancelled) return;
        setStats(statsResult);
        setTasks(tasksResult);
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

  const summary = useMemo(() => summarizeActivities(filteredTasks), [filteredTasks]);
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
    const memberTasks = filteredTasks.filter((task) => task.assigneeName === member.name);
    return { member, tasks: memberTasks, summary: summarizeActivities(memberTasks) };
  });
  const activeMemberRows = memberRows.filter(({ summary }) => summary.total > 0);
  const displayedMemberRows = [...(showInactiveMembers ? memberRows : activeMemberRows)].sort((a, b) => {
    if (teamSort === "activities") return b.summary.total - a.summary.total;
    if (teamSort === "pending") return b.summary.pending - a.summary.pending;
    return b.summary.completionRate - a.summary.completionRate;
  });

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={retry} />;

  return (
    <div className="min-h-full bg-[#f8faff] p-4 sm:p-6 xl:p-8">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
            Operação comercial
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Visão geral das atividades da equipe
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          {/* Period Filter */}
          <DropdownMenu
            align="left"
            width="sm"
            trigger={
              <button
                type="button"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none"
              >
                <Funnel size={16} />
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
              { label: "Este trimestre", onClick: () => setPeriodFilter("quarter") },
              { label: "Este ano", onClick: () => setPeriodFilter("year") },
              { label: "Todo o período", onClick: () => setPeriodFilter("all") },
            ]}
          />

          {/* Assignee Filter */}
          <DropdownMenu
            align="left"
            width="sm"
            trigger={
              <button
                type="button"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none"
              >
                <UsersThree size={16} />
                {assigneeFilter === "all" ? "Todos" : assigneeFilter}
                <CaretDown size={14} />
              </button>
            }
            items={[
              { label: "Todos", onClick: () => setAssigneeFilter("all") },
              ...(assignees.filter((name): name is string => Boolean(name)).map((name) => ({
                label: name,
                onClick: () => setAssigneeFilter(name),
              })) as Array<{ label: string; onClick: () => void }>),
            ]}
          />

          {/* Status Filter */}
          <DropdownMenu
            align="left"
            width="sm"
            trigger={
              <button
                type="button"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none"
              >
                <Kanban size={16} />
                {statusFilter === "all"
                  ? "Todos os status"
                  : statusConfig[statusFilter]?.label || statusFilter}
                <CaretDown size={14} />
              </button>
            }
            items={[
              { label: "Todos os status", onClick: () => setStatusFilter("all") },
              ...(Object.keys(statusConfig) as StatusTarefa[]).map((status) => ({
                label: statusConfig[status].label,
                onClick: () => setStatusFilter(status),
              })),
            ]}
          />

          <Link
            href="/configurar-metas"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none hover:bg-slate-50 transition-colors"
          >
            <Target size={16} /> Configurar Metas
          </Link>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 sm:w-auto"
          >
            <Plus size={17} /> Nova atividade
          </button>
        </div>
      </header>
      {dashboardWidgets.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardWidgets.map((widget) => (
            <PersonalizedWidgetCard
              key={widget.id}
              widget={widget}
              onRemove={removePersonalWidget}
            />
          ))}
          <Link
            href="/metricas"
            className="flex min-h-[190px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <Plus size={18} />
            <span className="ml-2">Adicionar outro bloco</span>
          </Link>
        </section>
      ) : (
        <EmptyPersonalDashboard />
      )}

      {dashboardWidgets.length > 0 && (
      <section className="mt-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-4 sm:grid-cols-4 sm:p-5">
            {[
              { label: "Equipe", value: teamMembers.length, detail: "membros" },
              { label: "Atividades", value: summary.total, detail: "atribuídas" },
              { label: "Concluídas", value: summary.completed, detail: `${summary.completionRate}% do total` },
              { label: "Pendentes / revisão", value: summary.pending, detail: "requerem atenção" },
            ].map((metric) => (
              <article key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
                <p className="text-xs text-slate-500">{metric.detail}</p>
              </article>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Desempenho por responsável</h2>
              <p className="mt-1 text-sm text-slate-500">Carga de trabalho e progresso da equipe</p>
            </div>
            <DropdownMenu
              align="right"
              width="sm"
              trigger={<button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                {teamSort === "progress" ? "Maior progresso" : teamSort === "activities" ? "Mais atividades" : "Mais pendentes"}<CaretDown size={14} />
              </button>}
              items={[
                { label: "Maior progresso", onClick: () => setTeamSort("progress") },
                { label: "Mais atividades", onClick: () => setTeamSort("activities") },
                { label: "Mais pendentes", onClick: () => setTeamSort("pending") },
              ]}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500">
                  <th className="px-6 py-4 font-medium">Responsável</th>
                  <th className="px-6 py-4 font-medium">Progresso</th>
                  <th className="px-6 py-4 font-medium text-center">Atividades</th>
                  <th className="px-6 py-4 font-medium text-center">Andamento</th>
                  <th className="px-6 py-4 font-medium text-center">Pendentes</th>
                  <th className="px-6 py-4 font-medium text-center">Concluídas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMemberRows.map(({ member, summary: sum }) => {
                   return (
                      <tr key={member.name} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-sky-50 font-bold text-sky-600">
                              {member.initials}
                            </div>
                            <span className="text-base font-bold text-slate-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 w-1/4">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-500">Progresso</span>
                            <span className="font-bold text-slate-700">{sum.completionRate}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-brand-600" style={{ width: `${sum.completionRate}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-xl font-bold text-slate-900">{sum.total}</td>
                        <td className="px-6 py-5 text-center text-xl font-bold text-slate-900">{sum.inProgress}</td>
                        <td className="px-6 py-5 text-center text-xl font-bold text-slate-900">{sum.pending}</td>
                        <td className="px-6 py-5 text-center text-xl font-bold text-slate-900">{sum.completed}</td>
                      </tr>
                   );
                })}
              </tbody>
            </table>
          </div>

          {!showInactiveMembers && memberRows.length > activeMemberRows.length && <button type="button" onClick={() => setShowInactiveMembers(true)} className="w-full border-t border-slate-100 p-5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            Mostrar {memberRows.length - activeMemberRows.length} {memberRows.length - activeMemberRows.length === 1 ? "membro" : "membros"} sem atividades
          </button>}
          {showInactiveMembers && activeMemberRows.length < memberRows.length && <button type="button" onClick={() => setShowInactiveMembers(false)} className="w-full border-t border-slate-100 p-5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            Ocultar membros sem atividades
          </button>}
        </div>
      </section>
      )}
      {dashboardWidgets.length > 0 && (
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate font-bold text-slate-900">
                Atividades recentes
              </h2>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Acompanhe as últimas movimentações
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-50"
            >
              <List size={18} />
            </button>
          </div>
          <ActivityList tasks={tasks} />
        </div>
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Distribuição</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Status das atividades
              </p>
            </div>
            <Kanban size={20} className="text-brand-500" />
          </div>
          <div className="space-y-5">
            {(Object.keys(statusConfig) as StatusTarefa[]).map((status) => {
              const config = statusConfig[status];
              const count = tasks.filter(
                (task) => task.status === status,
              ).length;
              const width = summary.total
                ? Math.round((count / summary.total) * 100)
                : 0;
              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
                      />
                      {config.label}
                    </span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${config.dot}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
