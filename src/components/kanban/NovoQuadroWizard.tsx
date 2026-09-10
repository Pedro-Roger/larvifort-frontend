"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, Kanban, CaretLeft, CaretRight, Check, CheckCircle, Plus, Trash } from "@phosphor-icons/react";
import { createProjeto, type Projeto } from "@/services/tasks";
import { createColumn, type TaskColumn } from "@/services/tasks";
import { ApiError } from "@/services/api";

interface NovoQuadroWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: { id: string; name: string }) => void;
}

interface ColumnDraft {
  id: string;
  title: string;
  color: string;
  order: number;
}

const COLORS = [
  { value: "slate", label: "Cinza", className: "bg-slate-400" },
  { value: "sky", label: "Azul", className: "bg-sky-500" },
  { value: "amber", label: "Âmbar", className: "bg-amber-500" },
  { value: "emerald", label: "Verde", className: "bg-emerald-500" },
  { value: "rose", label: "Rosa", className: "bg-rose-500" },
  { value: "violet", label: "Violeta", className: "bg-violet-500" },
  { value: "orange", label: "Laranja", className: "bg-orange-500" },
  { value: "indigo", label: "Índigo", className: "bg-indigo-500" },
];

const STEP_LABELS = {
  1: "Nome do Quadro",
  2: "Colunas Iniciais",
  3: "Revisão",
};

const STEP_DESCRIPTIONS = {
  1: "Defina o nome do seu quadro/setor",
  2: "Adicione e organize as colunas iniciais",
  3: "Confira e confirme a criação",
};

type Step = 1 | 2 | 3;

interface BoardDraft {
  name: string;
  columns: ColumnDraft[];
}

interface ColumnDraft {
  id: string;
  title: string;
  color: string;
  order: number;
}

export default function NovoQuadroWizard({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: { id: string; name: string }) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [boardDraft, setBoardDraft] = useState<{ name: string; columns: { id: string; title: string; color: string; order: number }[] }>({
    name: "",
    columns: [
      { id: "1", title: "Backlog", color: "slate", order: 0 },
      { id: "2", title: "Em Andamento", color: "sky", order: 1 },
      { id: "3", title: "Concluído", color: "emerald", order: 2 },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setBoardDraft({ name: "", columns: [] });
    setStep(1);
    setErrorMessage(null);
    onClose();
  };

  const goToStep = (newStep: 1 | 2 | 3) => {
    if (newStep === 2 && !boardDraft.name.trim()) {
      setErrorMessage("Nome do quadro é obrigatório.");
      return;
    }
    if (newStep === 3 && boardDraft.columns.length === 0) {
      setErrorMessage("Adicione pelo menos uma coluna.");
      return;
    }
    setStep(newStep);
    setErrorMessage(null);
  };

  const handleNameChange = (name: string) => {
    setBoardDraft((prev) => ({ ...prev, name }));
    if (errorMessage === "Nome do quadro é obrigatório.") setErrorMessage(null);
  };

  const addColumn = () => {
    const newId = String(Date.now());
    setBoardDraft((prev) => ({
      ...prev,
      columns: [
        ...prev.columns,
        {
          id: String(Date.now()),
          title: "",
          color: "slate",
          order: prev.columns.length,
        },
      ],
    }));
  };

  const updateColumn = (id: string, field: keyof { title: string; color: string }, value: string) => {
    setBoardDraft((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const removeColumn = (id: string) => {
    if (boardDraft.columns.length <= 1) {
      setErrorMessage("Mantenha pelo menos uma coluna.");
      return;
    }
    setBoardDraft((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
    }));
  };

  const handleSubmit = async () => {
    if (!boardDraft.name.trim()) {
      setErrorMessage("Nome do quadro é obrigatório.");
      return;
    }
    if (boardDraft.columns.length === 0) {
      setErrorMessage("Adicione pelo menos uma coluna.");
      return;
    }
    const emptyTitle = boardDraft.columns.some((c) => !c.title.trim());
    if (emptyTitle) {
      setErrorMessage("Todas as colunas devem ter um título.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Criar o projeto/quadro
      const created = await createProjeto({ name: boardDraft.name.trim() });

      // 2. Criar as colunas no backend
      for (const col of boardDraft.columns) {
        if (col.title.trim()) {
          await createColumn(created.id, {
            title: col.title.trim(),
            color: col.color,
            order: col.order,
          });
        }
      }

      onSuccess?.({ id: created.id, name: created.name });
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

  const isFirstStep = step === 1;
  const isLastStep = step === 3;

  const COLORS = [
    { value: "slate", label: "Cinza", className: "bg-slate-400" },
    { value: "sky", label: "Azul", className: "bg-sky-500" },
    { value: "amber", label: "Âmbar", className: "bg-amber-500" },
    { value: "emerald", label: "Verde", className: "bg-emerald-500" },
    { value: "rose", label: "Rosa", className: "bg-rose-500" },
    { value: "violet", label: "Violeta", className: "bg-violet-500" },
    { value: "orange", label: "Laranja", className: "bg-orange-500" },
    { value: "indigo", label: "Índigo", className: "bg-indigo-500" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Passo {step} de 3</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`w-6 h-1 rounded-full transition-colors ${
                      s <= step ? "bg-sky-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Kanban size={18} className="text-sky-600" />
              Novo Quadro / Setor
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs font-medium">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    s <= step ? "text-sky-600" : "text-slate-400"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    s < step
                      ? "bg-sky-600 text-white"
                      : s === step
                      ? "bg-sky-600 text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    {s < step ? <Check size={14} weight="bold" /> : s}
                  </div>
                  <span className="text-[10px] font-medium truncate w-24 text-center">
                    {STEP_LABELS[s as keyof typeof STEP_LABELS]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              {STEP_DESCRIPTIONS[step as keyof typeof STEP_DESCRIPTIONS]}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
                <WarningCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {/* Step 1: Board Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Quadro / Setor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={boardDraft.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Financeiro, Comercial, Desenvolvimento, Administrativo"
                    autoFocus
                    disabled={loading}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Escolha um nome que identifique o setor ou projeto (ex: Financeiro, Desenvolvimento, Marketing)
                </p>
              </div>
            )}
            {/* Step 2: Columns */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Defina as colunas iniciais do seu quadro. Cada coluna representa um estágio do processo.
                </p>
                <div className="space-y-3">
                  {boardDraft.columns.map((col, idx) => (
                    <div key={col.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                            Coluna {idx + 1}
                          </span>
                          <span className="text-xs text-slate-400">Ordem: {col.order + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColumn(col.id)}
                          disabled={boardDraft.columns.length <= 1 || loading}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Remover coluna"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Título da Coluna <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={boardDraft.columns.find((c) => c.id === boardDraft.columns[idx].id)?.title || ""}
                            onChange={(e) => updateColumn(boardDraft.columns[idx].id, "title", e.target.value)}
                            placeholder="Ex: Backlog, Em Análise, Aguardando Aprovação"
                            disabled={loading}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-2">Cor</label>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                              <button key={c.value} type="button" onClick={() => updateColumn(boardDraft.columns[idx].id, "color", c.value)} className={`w-8 h-8 rounded-full ${c.className} ring-2 ring-offset-1 transition-all cursor-pointer ${boardDraft.columns[idx].color === c.value ? "ring-sky-500" : "ring-transparent hover:ring-slate-300"}`} title={c.label} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={addColumn}
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-sky-600 hover:bg-sky-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={14} weight="bold" />
                    Adicionar Coluna
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Mínimo 1 coluna, sem limite máximo. A ordem define a sequência no Kanban.
                </p>
              </div>
            )}
            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Resumo do Quadro</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Nome</span>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">{boardDraft.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Colunas</span>
                      <span className="font-medium text-slate-800">{boardDraft.columns.length}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Colunas:</p>
                      <div className="space-y-1">
                        {boardDraft.columns.map((col, idx) => (
                          <div key={col.id} className="flex items-center gap-2 text-xs">
                            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: col.color }} />
                            <span className="font-medium text-slate-800">{col.title}</span>
                            <span className="text-slate-400">→</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Ao confirmar, o quadro e as colunas serão criados no backend.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
{!isFirstStep && (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as Step)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <CaretLeft size={14} /> Voltar
                </button>
              )}
              <div className="flex-1" />
              {isLastStep ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm shadow-sky-500/25 transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
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
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Próximo
                  <CaretRight size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export { type Step, STEP_LABELS, STEP_DESCRIPTIONS, COLORS };