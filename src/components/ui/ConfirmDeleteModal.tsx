"use client";

import { useState } from "react";
import { WarningCircle, CircleNotch, X } from "@phosphor-icons/react";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao excluir.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <WarningCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">{message}</p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/25 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading && <CircleNotch size={14} className="animate-spin" />}
            <span>{loading ? "Excluindo..." : "Excluir"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
