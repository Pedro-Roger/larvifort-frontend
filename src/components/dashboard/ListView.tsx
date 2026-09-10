"use client";

import { Clock } from "@phosphor-icons/react";
import { type Task, type StatusTarefa } from "@/services/tasks";

interface TaskWithStatus extends Task {
  status: StatusTarefa;
}

interface ListViewProps {
  members: {
    name: string;
    initials: string;
    notDone: number;
    done: number;
    ready: number;
    inProgress: number;
    review: number;
  }[];
  tasksByAssignee: Record<string, TaskWithStatus[]>;
}

const statusConfig = {
  BACKLOG: { label: "Pronto", color: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  EM_ANDAMENTO: { label: "Em Progresso", color: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  EM_REVISAO: { label: "Revisão", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  CONCLUIDO: { label: "Concluído", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const priorityConfig = {
  ALTA: { label: "Alta", color: "text-red-500" },
  MEDIA: { label: "Média", color: "text-amber-500" },
  BAIXA: { label: "Baixa", color: "text-slate-400" },
};

interface TaskWithStatus extends Task {
  status: StatusTarefa;
}

interface ListViewProps {
  members: {
    name: string;
    initials: string;
    notDone: number;
    done: number;
    ready: number;
    inProgress: number;
    review: number;
  }[];
  tasksByAssignee: Record<string, TaskWithStatus[]>;
}

export default function ListView({ members, tasksByAssignee }: ListViewProps) {
  return (
    <div className="space-y-4">
      {members.map((member, i) => {
        const tasks = tasksByAssignee[member.name] || [];
        const total = member.notDone + member.done;
        const pct = total > 0 ? Math.round((member.done / total) * 100) : 0;

        return (
          <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.notDone + member.done} tarefas · {pct}% concluído</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> Pronto ({member.ready})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" /> Progresso ({member.inProgress})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Revisão ({member.review})</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusConfig[task.status]?.dot || statusConfig.BACKLOG.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.titulo}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusConfig[task.status]?.color || statusConfig.BACKLOG.color}`}>
                    {statusConfig[task.status]?.label || "Pronto"}
                  </span>
                  <span className={`text-xs font-medium ${priorityConfig[task.prioridade]?.color || priorityConfig.MEDIA.color}`}>
                    {priorityConfig[task.prioridade]?.label || "Média"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 w-12 justify-end">
                    <Clock size={11} />
                    {task.estimativaH ? `${task.estimativaH}h` : "—"}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="px-5 py-6 text-center text-xs text-slate-400">Nenhuma tarefa</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}