"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import {
  createTask,
  type Task,
  type TaskInput,
  type StatusTarefa,
  type Prioridade,
  STATUS_TAREFA_VALUES,
  PRIORIDADE_VALUES,
  statusTarefaLabel,
  prioridadeLabel,
} from "@/services/tasks";
import { ApiError } from "@/services/api";

interface NovaTarefaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: Task) => void;
  defaultProjetoId?: string;
  defaultStatus?: string;
  projetos: { id: string; name: string }[];
}

type FormState = {
  titulo: string;
  descricao: string;
  projetoId: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  progresso: number;
  prazo: string;
  estimativaH: string;
  tags: string;
};

export default function NovaTarefaModal({
  open,
  onClose,
  onSuccess,
  defaultProjetoId = "",
  defaultStatus,
  projetos,
}: NovaTarefaModalProps) {
  const initialProjectId =
    defaultProjetoId || (projetos.length > 0 ? projetos[0].id : "");

  const [form, setForm] = useState<FormState>({
    titulo: "",
    descricao: "",
    projetoId: initialProjectId,
    prioridade: "MEDIA",
    status: (defaultStatus as StatusTarefa) || "BACKLOG",
    progresso: 0,
    prazo: "",
    estimativaH: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    titulo?: string;
    projetoId?: string;
  }>({});

  if (!open) return null;

  const handleChange = (field: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "titulo" || field === "projetoId") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({
      titulo: "",
      descricao: "",
      projetoId: initialProjectId,
      prioridade: "MEDIA",
      status: (defaultStatus as StatusTarefa) || "BACKLOG",
      progresso: 0,
      prazo: "",
      estimativaH: "",
      tags: "",
    });
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errors: { titulo?: string; projetoId?: string } = {};
    if (!form.titulo.trim()) {
      errors.titulo = "Título é obrigatório";
    }
    const currentProj = form.projetoId || initialProjectId;
    if (!currentProj) {
      errors.projetoId = "Selecione um projeto";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    const parsedTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const estimativaNum = form.estimativaH.trim()
      ? parseFloat(form.estimativaH)
      : null;

    const payload: TaskInput = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      projetoId: form.projetoId || initialProjectId,
      prioridade: form.prioridade,
      status: form.status,
      progresso: Number(form.progresso) || 0,
      tags: parsedTags,
      prazo: form.prazo ? new Date(form.prazo).toISOString() : null,
      estimativaH:
        estimativaNum !== null && !isNaN(estimativaNum) ? estimativaNum : null,
    };

    try {
      const created = await createTask(payload);
      onSuccess?.(created);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao criar tarefa (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao criar tarefa");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Nova Tarefa</h2>
            <p className="text-xs text-slate-500">
              Preencha os dados da tarefa para o quadro Kanban
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Projeto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Projeto <span className="text-red-500">*</span>
            </label>
            <select
              value={form.projetoId || initialProjectId}
              onChange={(e) => handleChange("projetoId", e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                fieldErrors.projetoId ? "border-red-400" : "border-slate-200"
              }`}
            >
              {projetos.length === 0 && (
                <option value="">Nenhum projeto disponível</option>
              )}
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {fieldErrors.projetoId && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.projetoId}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Tarefa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              placeholder="Ex: Instalação de aeradores no viveiro 04"
              disabled={loading}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                fieldErrors.titulo ? "border-red-400" : "border-slate-200"
              }`}
            />
            {fieldErrors.titulo && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.titulo}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Detalhes ou orientações sobre a tarefa..."
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Prioridade e Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                value={form.prioridade}
                onChange={(e) =>
                  handleChange("prioridade", e.target.value as Prioridade)
                }
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {PRIORIDADE_VALUES.map((p) => (
                  <option key={p} value={p}>
                    {prioridadeLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coluna / Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as StatusTarefa)
                }
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {STATUS_TAREFA_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {statusTarefaLabel(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prazo e Estimativa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prazo (Data limite)
              </label>
              <input
                type="date"
                value={form.prazo}
                onChange={(e) => handleChange("prazo", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimativa (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.estimativaH}
                onChange={(e) => handleChange("estimativaH", e.target.value)}
                placeholder="Ex: 4"
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="Ex: Campo, Urgente, Viveiro"
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Footer inside form */}
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
                  Salvando...
                </>
              ) : (
                "Criar Tarefa"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
