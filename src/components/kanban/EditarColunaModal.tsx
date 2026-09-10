"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, Kanban } from "@phosphor-icons/react";
import { updateColumn } from "@/services/tasks";
import type { TaskColumn } from "@/services/tasks";

interface EditarColunaModalProps {
  open: boolean;
  onClose: () => void;
  column: TaskColumn;
  onSuccess?: (updatedColumn: TaskColumn) => void;
}

export default function EditarColunaModal({ open, onClose, column, onSuccess }: EditarColunaModalProps) {
  const [title, setTitle] = useState(column.title);
  const [color, setColor] = useState(column.color);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setTitle("");
    setColor("slate");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Título da coluna é obrigatório.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await updateColumn(column.id, {
        title: title.trim(),
        color,
      });
      onSuccess?.(updated);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar coluna");
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { value: "slate", label: "Cinza", class: "bg-slate-400" },
    { value: "sky", label: "Azul", class: "bg-sky-500" },
    { value: "amber", label: "Âmbar", class: "bg-amber-500" },
    { value: "emerald", label: "Verde", class: "bg-emerald-500" },
    { value: "rose", label: "Rosa", class: "bg-rose-500" },
    { value: "violet", label: "Violeta", class: "bg-violet-500" },
    { value: "orange", label: "Laranja", class: "bg-orange-500" },
    { value: "fuchsia", label: "Fúcsia", class: "bg-fuchsia-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Kanban size={18} className="text-sky-600" />
            <h2 className="text-base font-bold text-slate-800">Editar Coluna</h2>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" disabled={loading}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Coluna <span className="text-red-500">*</span></label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="Ex: Em Revisão" disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)} className={`w-8 h-8 rounded-full ${c.class} ring-2 ring-offset-1 transition-all cursor-pointer ${color === c.value ? "ring-sky-500" : "ring-transparent hover:ring-slate-300"}`} title={c.label} />
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              {loading ? <><CircleNotch size={14} className="animate-spin" /> Salvando...</> : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}