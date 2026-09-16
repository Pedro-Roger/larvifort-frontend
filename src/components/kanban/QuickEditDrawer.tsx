"use client";

import { useState } from "react";
import { X, FloppyDisk, CircleNotch, WarningCircle, Plus, Trash } from "@phosphor-icons/react";
import type { ProjectCard } from "./KanbanCard";
import {
  updateTask,
  deleteTask,
  type Task,
  type Prioridade,
} from "@/services/tasks";
import { ApiError } from "@/services/api";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

interface QuickEditDrawerProps {
  open: boolean;
  onClose: () => void;
  card: ProjectCard | null;
  onSuccess?: (updated: Task) => void;
  onDelete?: (deletedId: string) => void;
}

const priorityOptions: { value: "alta" | "media" | "baixa"; label: string; color: string }[] = [
  { value: "alta", label: "Alta", color: "bg-red-50 text-red-600 border-red-200" },
  { value: "media", label: "Média", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "baixa", label: "Baixa", color: "bg-slate-100 text-slate-500 border-slate-200" },
];

export default function QuickEditDrawer({
  open,
  onClose,
  card,
  onSuccess,
  onDelete,
}: QuickEditDrawerProps) {
  if (!open || !card) return null;

  return (
    <QuickEditDrawerContent
      key={card.id}
      card={card}
      onClose={onClose}
      onSuccess={onSuccess}
      onDelete={onDelete}
    />
  );
}

function QuickEditDrawerContent({
  card,
  onClose,
  onSuccess,
  onDelete,
}: {
  card: ProjectCard;
  onClose: () => void;
  onSuccess?: (updated: Task) => void;
  onDelete?: (deletedId: string) => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [priority, setPriority] = useState<"alta" | "media" | "baixa">(
    card.priority || "media"
  );
  const [progress, setProgress] = useState(card.progress);
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : "");
  const [tags, setTags] = useState<string[]>(card.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage("O título da tarefa não pode ficar vazio.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const prioridadePrisma: Prioridade =
      priority === "alta" ? "ALTA" : priority === "baixa" ? "BAIXA" : "MEDIA";

    try {
      const updated = await updateTask(card.id, {
        titulo: title.trim(),
        prioridade: prioridadePrisma,
        progresso: progress,
        prazo: dueDate ? new Date(dueDate).toISOString() : null,
        tags,
      });
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao salvar tarefa (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao salvar tarefa");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
        onClick={() => !loading && onClose()}
      />
      <aside className="fixed top-0 right-0 h-full w-[460px] bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-[-15px_0_40px_rgba(0,0,0,0.08)] z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sky-600 text-lg">✎</span>
            <h2 className="text-base font-bold text-slate-800">
              Editar Tarefa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Título da Tarefa
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 focus:border-sky-500 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500/40 font-medium"
              type="text"
              value={title}
              disabled={loading}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Prioridade
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={loading}
                  onClick={() => setPriority(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    priority === opt.value
                      ? opt.color + " ring-1 ring-offset-1 ring-sky-300"
                      : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Progresso{" "}
                {card.subtasksCount && card.subtasksCount > 0
                  ? `(${card.completedSubtasksCount || 0}/${card.subtasksCount} subtarefas)`
                  : ""}
              </label>
              <span
                className={`text-xs font-bold ${
                  progress === 100 ? "text-emerald-600" : "text-sky-600"
                }`}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress === 100 ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {card.subtasksCount && card.subtasksCount > 0 ? (
              <p className="text-[11px] text-slate-400">
                O progresso é calculado automaticamente com base nas subtarefas concluídas.
              </p>
            ) : (
              <input
                className="w-full accent-sky-600 cursor-pointer"
                type="range"
                min={0}
                max={100}
                value={progress}
                disabled={loading}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            )}
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Responsável
              </label>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {card.assignee?.initials || "??"}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">
                    {card.assignee?.name || "Não atribuído"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Prazo
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-sky-500 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                type="date"
                value={dueDate}
                disabled={loading}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600 flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={loading}
                    className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {isAddingTag ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === "Escape") {
                        setIsAddingTag(false);
                      }
                    }}
                    placeholder="Nome da tag..."
                    className="px-2 py-0.5 text-[11px] border border-sky-400 rounded-md focus:outline-none w-24"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-[11px] font-medium text-slate-400 hover:text-sky-600 hover:border-sky-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} /> Adicionar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash size={14} />
            Excluir
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FloppyDisk size={14} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>

        {confirmDeleteOpen && (
          <ConfirmDeleteModal
            open={true}
            title="Excluir Tarefa"
            message={`Tem certeza que deseja excluir a tarefa "${card.title}"? Esta ação não pode ser desfeita.`}
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={async () => {
              await deleteTask(card.id);
              onDelete?.(card.id);
              setConfirmDeleteOpen(false);
              onClose();
            }}
          />
        )}
      </aside>
    </>
  );
}
