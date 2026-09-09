"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, Trash } from "@phosphor-icons/react";
import { deleteColumn } from "@/services/tasks";

interface ExcluirColunaModalProps {
  open: boolean;
  onClose: () => void;
  column: { id: string; title: string };
  availableColumns: { id: string; title: string }[];
  onSuccess?: () => void;
}

export default function ExcluirColunaModal({
  open,
  onClose,
  column,
  availableColumns,
  onSuccess,
}: ExcluirColunaModalProps) {
  const [targetColumnId, setTargetColumnId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const validTargetColumns = availableColumns.filter((c) => c.id !== column.id);

  const handleClose = () => {
    if (loading) return;
    setTargetColumnId("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetColumnId) {
      setError("Selecione uma coluna de destino para as tarefas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteColumn(column.id, targetColumnId);
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir coluna");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-red-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Trash size={18} className="text-red-600" />
            <h2 className="text-base font-bold text-red-800">Excluir Coluna</h2>
          </div>
          <button type="button" onClick={handleClose} disabled={loading} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Você está prestes a excluir a coluna <strong>&quot;{column.title}&quot;</strong>. 
            Todas as tarefas nesta coluna precisam ser movidas para outra.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mover tarefas para... <span className="text-red-500">*</span>
            </label>
            <select
              value={targetColumnId}
              onChange={(e) => setTargetColumnId(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="" disabled>Selecione uma coluna destino</option>
              {validTargetColumns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="pt-5 flex items-center justify-end gap-2">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              {loading ? <><CircleNotch size={14} className="animate-spin" /> Excluindo...</> : "Confirmar Exclusão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
