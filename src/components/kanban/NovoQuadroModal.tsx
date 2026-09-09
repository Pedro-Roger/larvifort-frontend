"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, Kanban } from "@phosphor-icons/react";
import { createProjeto, type Projeto } from "@/services/tasks";
import { ApiError } from "@/services/api";

interface NovoQuadroModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: Projeto) => void;
}

export default function NovoQuadroModal({
  open,
  onClose,
  onSuccess,
}: NovoQuadroModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setName("");
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nome do quadro ou setor é obrigatório");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const created = await createProjeto({ name: name.trim() });
      onSuccess?.(created);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao criar quadro (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao criar quadro");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Kanban size={18} className="text-sky-600" />
              Novo Quadro / Setor
            </h2>
            <p className="text-xs text-slate-500">
              Crie um novo quadro para um setor ou projeto
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Setor / Quadro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Financeiro, Comercial, Desenvolvimento, Administrativo"
              disabled={loading}
              autoFocus
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <CircleNotch size={14} className="animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Quadro"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
