"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  CaretDown,
  CalendarBlank,
  MagnifyingGlass,
  Warning,
  CaretRight,
  Trash,
} from "@phosphor-icons/react";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import QuickEditDrawer from "@/components/kanban/QuickEditDrawer";
import NovaTarefaModal from "@/components/kanban/NovaTarefaModal";
import NovoQuadroWizard from "@/components/kanban/NovoQuadroWizard";
import NovaColunaModal from "@/components/kanban/NovaColunaModal";
import ExcluirColunaModal from "@/components/kanban/ExcluirColunaModal";
import ExcluirQuadroModal from "@/components/kanban/ExcluirQuadroModal";
import PassagemBastaoModal from "@/components/kanban/PassagemBastaoModal";
import TaskDetailModal from "@/components/kanban/TaskDetailModal";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { fetchUsers, type User } from "@/services/users";
import type { ProjectCard } from "@/components/kanban/KanbanCard";
import {
  fetchTasks,
  fetchProjetos,
  fetchColumns,
  updateTaskStatus,
  mapTaskToCard,
  type Task,
  type StatusTarefa,
  type Projeto,
  type TaskColumn,
} from "@/services/tasks";

export default function KanbanPage() {
  const [projetoId, setProjetoId] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [novaTarefaModalOpen, setNovaTarefaModalOpen] = useState(false);
  const [novoQuadroWizardOpen, setNovoQuadroWizardOpen] = useState(false);
  const [novaColunaModalOpen, setNovaColunaModalOpen] = useState(false);
  const [excluirColunaTarget, setExcluirColunaTarget] = useState<{id: string, title: string} | null>(null);
  const [excluirQuadroTarget, setExcluirQuadroTarget] = useState<Projeto | null>(null);
  const [selectedCard, setSelectedCard] = useState<ProjectCard | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [passagemTask, setPassagemTask] = useState<{ id: string; titulo: string; projetoId: string } | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.repeat) {
        if (e.key.toLowerCase() === "n") { e.preventDefault(); setNovaTarefaModalOpen(true); }
        if (e.key.toLowerCase() === "b") { e.preventDefault(); setNovoQuadroWizardOpen(true); }
      }
      if (e.key === "Escape") {
        if (novaTarefaModalOpen) setNovaTarefaModalOpen(false);
        else if (novoQuadroWizardOpen) setNovoQuadroWizardOpen(false);
        else if (novaColunaModalOpen) setNovaColunaModalOpen(false);
        else if (selectedCard) { setTaskDetailOpen(false); setSelectedCard(null); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [novaTarefaModalOpen, novoQuadroWizardOpen, novaColunaModalOpen, selectedCard, taskDetailOpen]);

  const [busca, setBusca] = useState("");

  // Load projetos + tasks
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(false);
      try {
    const [projetosResult, usersResult, tasksResult] = await Promise.all([
      fetchProjetos(),
      fetchUsers(),
      fetchTasks(),
    ]);
        if (cancelled) return;

        setProjetos(projetosResult);
        setUsers(usersResult);

        const firstId = projetosResult.length > 0 ? projetosResult[0].id : "";
        if (!cancelled) {
          setProjetoId(firstId);
          setAllTasks(tasksResult);
        }
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

  // Fetch columns for selected board/projeto
  useEffect(() => {
    let cancelled = false;

    async function fetchBoardColumns() {
      if (!projetoId) {
        setColumns([]);
        return;
      }
      try {
        const columnsResult = await fetchColumns(projetoId);
        if (!cancelled) {
          setColumns(columnsResult);
        }
      } catch {
        if (!cancelled) {
          setColumns([]);
        }
      }
    }

    void fetchBoardColumns();
    return () => {
      cancelled = true;
    };
  }, [projetoId]);

  // Build column-to-status map from API columns
  const columnToStatus = useMemo(() => {
    const map: Record<string, StatusTarefa> = {};
    for (const col of columns) {
      map[col.title] = col.status;
    }
    return map;
  }, [columns]);

  const cards = useMemo(() => {
    const term = busca.trim().toLowerCase();
    const filtered = allTasks.filter((t) => {
      const matchProject = !projetoId || t.projetoId === projetoId;
      const matchSearch =
        !term ||
        t.titulo.toLowerCase().includes(term) ||
        (t.descricao && t.descricao.toLowerCase().includes(term)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchProject && matchSearch;
    });

    const data: Record<string, ProjectCard[]> = {};
    for (const col of columns) {
      const colStatus = col.status;
      data[col.title] = filtered
        .filter((t) => t.status === colStatus)
        .map(mapTaskToCard);
    }
    return data;
  }, [projetoId, allTasks, busca, columns]);

  const startLoad = () => setTryCount((c) => c + 1);

  const projetoAtual = projetos.find((p) => p.id === projetoId);

  const sectorMembers = useMemo(() => {
    const assigneeIds = new Set(
      allTasks
        .filter((t) => !projetoId || t.projetoId === projetoId)
        .map((t) => t.assigneeId)
        .filter(Boolean)
    );
    if (assigneeIds.size > 0) {
      const filtered = users.filter((u) => assigneeIds.has(u.id));
      if (filtered.length > 0) return filtered;
    }
    return users;
  }, [allTasks, projetoId, users]);

  const totalTasks = columns.reduce(
    (acc, col) => acc + (cards[col.title]?.length || 0),
    0
  );
  const concluidas = cards["Concluído"]?.length || 0;
  const emAndamento = cards["Em Andamento"]?.length || 0;

  const handleDragStart = useCallback((cardId: string) => {
    setDraggedCardId(cardId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCardId(null);
  }, []);

  const handleCardMove = useCallback(
    (cardId: string, toColumn: string, toIndex: number) => {
      void toIndex;
      const newStatus = columnToStatus[toColumn];
      if (!newStatus) return;

      // Optimistic update — change the task status in local state
      setAllTasks((prev) =>
        prev.map((t) => (t.id === cardId ? { ...t, status: newStatus } : t))
      );

      // Persist to API
      void updateTaskStatus(cardId, { status: newStatus }).catch(() => {
        startLoad();
      });

      // Trigger column hand-off: when moved to column with status EM_REVISAO, open passagem modal
      const targetColumn = columns.find((c) => c.title === toColumn);
      if (targetColumn?.status === "EM_REVISAO") {
        const task = allTasks.find((t) => t.id === cardId);
        if (task) {
          setPassagemTask({ id: task.id, titulo: task.titulo, projetoId: task.projetoId || projetoId });
        }
      }

      setDraggedCardId(null);
    },
    [projetoId, allTasks, columnToStatus, columns]
  );

  if (loading) {
    return (
      <>
        <header className="px-8 py-5 flex flex-col gap-4 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Quadro de Acompanhamento
            </h1>
            <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </header>
        <main className="flex-1 overflow-hidden p-8">
          <div className="flex gap-5 h-full">
            {columns.length > 0 ? columns.map((col) => (
              <div
                key={col.id}
                className="flex-1 bg-slate-100 rounded-xl p-4 animate-pulse min-w-[260px]"
              >
                <div className="h-5 w-24 bg-slate-200 rounded mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-slate-200 p-4 mb-3"
                  >
                    <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            )) : (
              <div className="flex-1 bg-slate-100 rounded-xl p-4 animate-pulse min-w-[260px]">
                <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
                <p className="text-sm text-slate-400 text-center py-8">Carregando colunas...</p>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="px-8 py-5 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Quadro de Acompanhamento
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
            <Warning size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-red-700 mb-1">
              Não foi possível carregar o kanban
            </h3>
            <p className="text-xs text-red-600 mb-4">
              Verifique sua conexão ou tente novamente.
            </p>
            <button
              type="button"
              onClick={startLoad}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              <CaretRight size={14} />
              Tentar novamente
            </button>
          </div>
        </main>
      </>
    );
  }

  if (projetos.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-800">Nenhum quadro criado</h1>
          <p className="mt-2 text-sm text-slate-500">Crie seu primeiro quadro ou setor para começar a organizar as tarefas.</p>
          <button type="button" onClick={() => setNovoQuadroWizardOpen(true)} className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700">
            <Plus size={16} /> Criar quadro
          </button>
        </div>
        <NovoQuadroWizard open={novoQuadroWizardOpen} onClose={() => setNovoQuadroWizardOpen(false)} onSuccess={(newProjeto) => { const fullProjeto = { ...newProjeto, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; setProjetos((prev) => [...prev, fullProjeto]); setProjetoId(fullProjeto.id); }} />
      </main>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="px-8 py-5 flex flex-col gap-4 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
        {/* Row 1: Title + Project Selector + Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Quadro de Acompanhamento
            </h1>

            {/* Project Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 px-3 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 border border-slate-200 shadow-sm transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {projetoAtual?.name || "Selecionar projeto"}
                <CaretDown
                  size={12}
                  className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {projetos.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400">
                          Nenhum setor ou quadro
                        </div>
                      ) : (
                        projetos.map((p) => (
                          <div key={p.id} className={`flex items-center ${p.id === projetoId ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                            <button type="button" onClick={() => { setProjetoId(p.id); setDropdownOpen(false); }} className={`min-w-0 flex-1 px-3 py-2 text-left text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${p.id === projetoId ? "text-sky-700" : "text-slate-600"}`}>
                              <span className={`w-2 h-2 shrink-0 rounded-full ${p.id === projetoId ? "bg-sky-500" : "bg-slate-300"}`} />
                              <span className="truncate">{p.name}</span>
                            </button>
                            <button type="button" aria-label={`Excluir ${p.name}`} onClick={() => { setDropdownOpen(false); setExcluirQuadroTarget(p); }} className="mr-2 cursor-pointer rounded p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"><Trash size={14} /></button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setNovoQuadroWizardOpen(true);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        Criar Novo Quadro / Setor
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AvatarGroup aria-label="Participantes do setor">
              {sectorMembers.slice(0, 4).map((u) => (
                <Avatar key={u.id} size="sm" title={`${u.firstName} ${u.lastName}`}>
                  <AvatarFallback className="bg-brand-600 text-white text-[10px] font-bold">
                    {(u.firstName?.[0] || "").toUpperCase()}{(u.lastName?.[0] || "").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {sectorMembers.length > 4 && (
                <AvatarGroupCount size="sm">+{sectorMembers.length - 4}</AvatarGroupCount>
              )}
            </AvatarGroup>
            <button
              type="button"
              onClick={() => setNovaTarefaModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Plus size={14} />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* Row 2: Stats + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Total:{" "}
              <strong className="text-slate-700">{totalTasks} tarefas</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Em andamento:{" "}
              <strong className="text-sky-600">{emAndamento}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Concluído:{" "}
              <strong className="text-emerald-600">{concluidas}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Progresso geral:{" "}
              <strong className="text-sky-600">
                {totalTasks > 0
                  ? Math.round((concluidas / totalTasks) * 100)
                  : 0}
                %
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={13}
              />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-8 w-52 text-xs pl-8 pr-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-400"
                placeholder="Buscar tarefa..."
                type="text"
              />
            </div>
            <button
              type="button"
              className="h-8 px-3 rounded-lg bg-white text-xs text-slate-600 flex items-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <CalendarBlank size={13} className="text-sky-600" />
              <span className="font-medium">Outubro / 2024</span>
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-hidden">
        <div
          className="flex gap-5 overflow-x-auto p-8 h-full"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {columns
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((col) => (
                <KanbanColumn
                  key={col.id}
                  title={col.title}
                  count={cards[col.title]?.length || 0}
                  color={col.color}
                  cards={cards[col.title] || []}
                  highlighted={col.status === "EM_ANDAMENTO"} // Highlight "Em Andamento" column
                  onCardClick={(card) => {
                    setSelectedCard(card);
                    setTaskDetailOpen(true);
                  }}
                  onCardMove={handleCardMove}
                  draggedCardId={draggedCardId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onAddColumn={() => setNovaColunaModalOpen(true)}
                  onDeleteColumn={() => {
                    setExcluirColunaTarget({ id: col.id, title: col.title });
                  }}
                />
            ))}
        </div>
      </main>

      <TaskDetailModal
        open={!!(selectedCard && taskDetailOpen)}
        onClose={() => { setTaskDetailOpen(false); setSelectedCard(null); }}
        taskId={selectedCard?.id || ""}
        users={users}
        projetos={projetos}
        onUpdate={(updatedTask) => {
          setAllTasks((prev) => prev.map((t) => t.id === updatedTask.id ? updatedTask : t));
          setTaskDetailOpen(false);
          setSelectedCard(null);
        }}
        onDelete={() => {
          if (selectedCard) {
            setAllTasks((prev) => prev.filter((t) => t.id !== selectedCard.id));
          }
          setTaskDetailOpen(false);
          setSelectedCard(null);
        }}
        onTransfer={() => {
          if (selectedCard) {
            setPassagemTask({ id: selectedCard.id, titulo: selectedCard.title, projetoId: projetoId });
            setTaskDetailOpen(false);
          }
        }}
      />

      <PassagemBastaoModal
        open={!!passagemTask}
        onClose={() => setPassagemTask(null)}
        task={passagemTask || { id: "", titulo: "", projetoId: "" }}
        currentProjetoName={projetos.find(p => p.id === projetoId)?.name || "Setor Atual"}
        projetos={projetos}
        onSuccess={() => {
          // After a transfer, refresh tasks to reflect board changes
          startLoad();
          setSelectedCard(null);
        }}
      />

      <QuickEditDrawer
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard}
        onSuccess={(updatedTask) => {
          setAllTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
        }}
        onDelete={(deletedId) => {
          setAllTasks((prev) => prev.filter((t) => t.id !== deletedId));
          setSelectedCard(null);
        }}
      />

      <NovaTarefaModal
        open={novaTarefaModalOpen}
        onClose={() => setNovaTarefaModalOpen(false)}
        defaultProjetoId={projetoId}
        projetos={projetos}
        onSuccess={(newTask) => {
          setAllTasks((prev) => [newTask, ...prev]);
        }}
      />

<NovoQuadroWizard
        open={novoQuadroWizardOpen}
        onClose={() => setNovoQuadroWizardOpen(false)}
        onSuccess={(newProjeto) => {
          const fullProjeto = {
            ...newProjeto,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProjetos((prev) => [...prev, fullProjeto]);
          setProjetoId(fullProjeto.id);
        }}
      />

      <NovaColunaModal
        open={novaColunaModalOpen}
        onClose={() => setNovaColunaModalOpen(false)}
        boardId={projetoId}
        onSuccess={(col) => {
          console.log("Aqui atualizaríamos o estado de colunas no board:", col.title);
        }}
      />

      <ExcluirColunaModal
        open={!!excluirColunaTarget}
        onClose={() => setExcluirColunaTarget(null)}
        column={excluirColunaTarget!}
        availableColumns={columns.map((c) => ({ id: c.id, title: c.title }))}
        onSuccess={() => {
          console.log("Coluna excluída. Atualizaríamos estado local removendo a coluna e redirecionando tarefas.");
        }}
      />

      {excluirQuadroTarget && (
        <ExcluirQuadroModal
          open
          onClose={() => setExcluirQuadroTarget(null)}
          projeto={excluirQuadroTarget}
          taskCount={allTasks.filter((task) => task.projetoId === excluirQuadroTarget.id).length}
          onSuccess={() => {
            setExcluirQuadroTarget(null);
            startLoad();
          }}
        />
      )}
    </>
  );
}
