"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CaretRight,
  Warning,
  ArrowUpRight,
  Users,
  CalendarCheck,
  Target,
  Kanban,
  List,
  Square,
  Plus,
} from "@phosphor-icons/react";
import WorkloadCard from "@/components/dashboard/WorkloadCard";
import ListView from "@/components/dashboard/ListView";
import FrequencySection from "@/components/dashboard/FrequencySection";
import ClientActivityTable from "@/components/dashboard/ClientActivityTable";
import SalesRate from "@/components/dashboard/SalesRate";
import GoalChart from "@/components/dashboard/GoalChart";
import {
  fetchDashboardCharts,
  fetchDashboardStats,
  type DashboardCharts,
  type DashboardStats,
} from "@/services/dashboard";
import { fetchTasks, type Task } from "@/services/tasks";

const viewOptions = [
  { label: "List", icon: List },
  { label: "Board", icon: Kanban },
  { label: "Box", icon: Square },
];

function LoadingCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="h-10 w-10 rounded-full bg-slate-200" />
      <div className="mt-4 h-6 w-24 bg-slate-200 rounded" />
      <div className="mt-2 h-4 w-32 bg-slate-100 rounded" />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="px-6 py-6 space-y-8">
      <section>
        <div className="h-8 w-44 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </section>
      <section>
        <div className="h-8 w-56 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-64 animate-pulse" />
      </section>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-6 py-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Warning size={32} className="text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-red-700 mb-1">
          Não foi possível carregar o dashboard
        </h3>
        <p className="text-xs text-red-600 mb-4">
          Verifique se o servidor da API está no ar e tente novamente.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          <CaretRight size={14} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("Box");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  const startLoad = useCallback(() => {
    setLoading(true);
    setError(false);
    setStats(null);
    setCharts(null);
    setTasks([]);
    setTryCount((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [statsResult, chartsResult, tasksResult] = await Promise.all([
          fetchDashboardStats(),
          fetchDashboardCharts(),
          fetchTasks(),
        ]);
        if (cancelled) return;
        setStats(statsResult);
        setCharts(chartsResult);
        setTasks(tasksResult);
        setError(false);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [tryCount]);

  const teamMembers = stats?.teamMembers ?? [];
  const totalTasks =
    stats?.totalTasks ?? teamMembers.reduce((a, m) => a + m.notDone + m.done, 0);

  return (
    <>
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          {!loading && !error && (
            <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {totalTasks} tarefas
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
            <ArrowUpRight size={14} />
            <span>Exportar</span>
          </button>
        </div>
      </header>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState onRetry={startLoad} />
      ) : (
        <div className="px-6 py-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                  <Kanban size={16} className="text-violet-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Release Project</h2>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                {viewOptions.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => setActiveView(v.label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeView === v.label
                        ? "bg-violet-50 text-violet-700 border border-violet-200"
                        : "text-slate-500 hover:text-slate-700 border border-transparent"
                    }`}
                  >
                    <v.icon size={14} />
                    {v.label}
                  </button>
                ))}
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  <Plus size={14} />
                  Add view
                </button>
              </div>
            </div>
            {activeView === "List" ? (
              <ListView
                members={teamMembers}
                tasksByAssignee={tasks.reduce((acc, task) => {
                  const assigneeName = task.assigneeName || "Não atribuído";
                  if (!acc[assigneeName]) acc[assigneeName] = [];
                  acc[assigneeName].push(task);
                  return acc;
                }, {} as Record<string, typeof tasks>)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {teamMembers.map((member, i) => (
                  <WorkloadCard key={i} {...member} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                <CalendarCheck size={16} className="text-sky-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Frequência de Visitas</h2>
            </div>
            <FrequencySection
              chartData={stats?.visitData ?? []}
              tableData={stats?.frequencyData ?? []}
            />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <Users size={16} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Atividade dos Clientes</h2>
            </div>
            <ClientActivityTable data={stats?.clientActivity ?? []} />
          </section>

          <section>
            <SalesRate
              geral={stats?.salesGeral ?? {
                totalClientes: 0,
                clientesAtivos: 0,
                taxaConversao: 0,
                receitaTotal: 0,
                ticketMedio: 0,
                vendasMes: 0,
                metaValor: 0,
                metaVolume: 0,
              }}
              porPessoa={stats?.salesPorPessoa ?? []}
            />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Target size={16} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Metas de Vendas</h2>
            </div>
            <GoalChart data={charts?.goalData ?? []} />
          </section>
        </div>
      )}
    </>
  );
}