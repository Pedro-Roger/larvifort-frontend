"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CaretDown,
  CheckCircle,
  ClipboardText,
  Clock,
  Funnel,
  Kanban,
  List,
  Plus,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  fetchDashboardStats,
  type DashboardStats,
  type TeamMember,
} from "@/services/dashboard";
import { fetchTasks, type StatusTarefa, type Task } from "@/services/tasks";
import { summarizeActivities } from "@/services/dashboardMetrics";

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

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: typeof ClipboardText;
  label: string;
  value: number | string;
  helper: string;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}
        >
          <Icon size={20} className="text-brand-600" />
        </div>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

function TeamCard({ member, tasks }: { member: TeamMember; tasks: Task[] }) {
  const memberTasks = tasks.filter((task) => task.assigneeName === member.name);
  const summary = summarizeActivities(memberTasks);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-600">
            {member.initials}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{member.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Responsável por atividades
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">
          {summary.completionRate}%
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${summary.completionRate}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100">
        <div className="pr-3">
          <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
          <p className="text-xs text-slate-500">Atividades</p>
        </div>
        <div className="px-3">
          <p className="text-2xl font-bold text-slate-900">
            {summary.inProgress}
          </p>
          <p className="text-xs text-slate-500">Em andamento</p>
        </div>
        <div className="pl-3">
          <p className="text-2xl font-bold text-slate-900">
            {summary.completed}
          </p>
          <p className="text-xs text-slate-500">Concluídas</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <span className="text-slate-500">
          {summary.pending} pendentes ou em revisão
        </span>
        <span className="font-semibold text-slate-700">
          {memberTasks.reduce(
            (total, task) => total + (task.estimativaH ?? 0),
            0,
          )}
          h estimadas
        </span>
      </div>
    </article>
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
  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setTryCount((count) => count + 1);
  }, []);

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

  const summary = useMemo(() => summarizeActivities(tasks), [tasks]);
  const teamMembers = stats?.teamMembers ?? [];
  const visibleMembers =
    teamMembers.length > 0
      ? teamMembers
      : Array.from(
          new Map(
            tasks
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
          <button
            type="button"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none"
          >
            <Funnel size={16} /> Este mês <CaretDown size={14} />
          </button>
          <button
            type="button"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm sm:flex-none"
          >
            <UsersThree size={16} /> Responsável <CaretDown size={14} />
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 sm:w-auto"
          >
            <Plus size={17} /> Nova atividade
          </button>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={ClipboardText}
          label="Total de atividades"
          value={summary.total}
          helper="Atividades carregadas"
          tone="bg-sky-50"
        />
        <SummaryCard
          icon={Clock}
          label="Em andamento"
          value={summary.inProgress}
          helper="Precisam de acompanhamento"
          tone="bg-violet-50"
        />
        <SummaryCard
          icon={CheckCircle}
          label="Concluídas"
          value={summary.completed}
          helper={`${summary.completionRate}% de conclusão`}
          tone="bg-emerald-50"
        />
        <SummaryCard
          icon={TrendUp}
          label="Pendentes"
          value={summary.pending}
          helper="Aguardando ação ou revisão"
          tone="bg-amber-50"
        />
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100">
              <UsersThree size={19} className="text-brand-600" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950">
                Desempenho da equipe
              </h2>
              <p className="truncate text-xs text-slate-500">
                Atividades atribuídas por responsável
              </p>
            </div>
          </div>
          <button
            type="button"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 sm:flex"
          >
            Ver detalhes <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleMembers.map((member) => (
            <TeamCard key={member.name} member={member} tasks={tasks} />
          ))}
        </div>
      </section>
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
    </div>
  );
}
