"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, ArrowsLeftRight, ArrowRight } from "@phosphor-icons/react";
import { transferTask, type Projeto, type Task } from "@/services/tasks";

interface PassagemBastaoModalProps {
  open: boolean;
  onClose: () => void;
  task: { id: string; titulo: string; projetoId: string };
  currentProjetoName: string;
  projetos: Projeto[];
  onSuccess?: (result: { originalTask: Task; targetTask?: Task; mode: "MOVE" | "CHILD_TASK" }) => void;
}

export default function PassagemBastaoModal({
  open,
  onClose,
  task,
  currentProjetoName,
  projetos,
  onSuccess,
}: PassagemBastaoModalProps) {
  const availableProjetos = projetos.filter((p) => p.id !== task.projetoId);
  const [targetBoardId, setTargetBoardId] = useState<string>(
    availableProjetos[0]?.id || ""
  );
  const [mode, setMode] = useState<"MOVE" | "CHILD_TASK">("MOVE");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setNote("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBoardId) {
      setError("Selecione um setor de destino.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await transferTask(task.id, {
        targetBoardId,
        mode,
        note: note.trim() || undefined,
      });
      onSuccess?.({ ...result, mode });
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao transferir tarefa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ArrowsLeftRight size={18} className="text-sky-600" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Passagem de Bastão Intersetorial</h2>
              <p className="text-xs text-slate-500">Transfira a demanda ou gere uma subtarefa para outro setor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Context Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demanda</div>
            <p className="text-xs font-bold text-slate-800">{task.titulo}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Origem: <strong>{currentProjetoName || "Setor Atual"}</strong></span>
              <ArrowRight size={12} className="text-slate-400" />
              <span>Destino: <strong>{projetos.find(p => p.id === targetBoardId)?.name || "Selecione..."}</strong></span>
            </div>
          </div>

          {/* Target Sector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Setor de Destino <span className="text-red-500">*</span>
            </label>
            <select
              value={targetBoardId}
              onChange={(e) => setTargetBoardId(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {availableProjetos.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tipo de Transição
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer bg-white">
                <input
                  type="radio"
                  name="transferMode"
                  value="MOVE"
                  checked={mode === "MOVE"}
                  onChange={() => setMode("MOVE")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Mover tarefa inteira para o setor de destino</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">A tarefa sai do quadro atual e passa a ser operada pelo setor destino.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer bg-white">
                <input
                  type="radio"
                  name="transferMode"
                  value="CHILD_TASK"
                  checked={mode === "CHILD_TASK"}
                  onChange={() => setMode("CHILD_TASK")}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Manter aqui e criar Tarefa-Filha vinculada</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">A tarefa original permanece neste quadro e gera uma subtarefa para o setor destino.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Hand-off Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instruções / Nota de Passagem de Bastão
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="Descreva detalhes específicos ou orientações para a equipe do setor de destino..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Transferindo...
                </>
              ) : (
                "Confirmar Passagem"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
