"use client";

import { useState } from "react";
import { CircleNotch, Trash, WarningCircle, X } from "@phosphor-icons/react";
import { deleteProjeto } from "@/services/tasks";

interface ExcluirQuadroModalProps {
  open: boolean;
  onClose: () => void;
  projeto: { id: string; name: string };
  taskCount: number;
  onSuccess?: () => void;
}

export default function ExcluirQuadroModal({
  open,
  onClose,
  projeto,
  taskCount,
  onSuccess,
}: ExcluirQuadroModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProjeto(projeto.id);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir quadro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl border-b border-red-100 bg-red-50/50 px-6 py-5">
          <div className="flex items-center gap-2">
            <Trash size={18} className="text-red-600" />
            <h2 className="text-base font-bold text-red-800">Excluir quadro</h2>
          </div>
          <button type="button" onClick={handleClose} disabled={loading} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">
            Excluir o quadro <strong>&quot;{projeto.name}&quot;</strong>?
            {taskCount > 0 && " As tarefas dele também serão excluídas."}
          </p>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button type="button" onClick={handleClose} disabled={loading} className="cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={handleDelete} disabled={loading} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-red-500/20 hover:bg-red-700 disabled:opacity-50">
              {loading ? <><CircleNotch size={14} className="animate-spin" /> Excluindo...</> : "Confirmar exclusão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
