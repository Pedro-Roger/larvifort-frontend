"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, ShieldCheck } from "@phosphor-icons/react";
import {
  createSearch,
  type FieldSearch,
  type FieldSearchInput,
  type Uniformidade,
  UNIFORMIDADE_VALUES,
  uniformidadeLabel,
} from "@/services/searches";
import { ApiError } from "@/services/api";

interface NovaPesquisaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: FieldSearch) => void;
  clientes: { id: string; nome: string }[];
  responsaveis: { id: string; nome: string }[];
}

type FormState = {
  clienteId: string;
  dataPesquisa: string;
  responsavelId: string;
  larvas: string[];
  maioriaLarvifort: boolean;
  parouLarvifort: boolean;
  motivosSaida: string[];
  outroMotivo: string;
  uniformidadeBercario: Uniformidade | "";
  uniformidadeCultivo: Uniformidade | "";
  sobrevBercario: string;
  sobrevCultivo: string;
  resultadosUltimoCiclo: string;
  observacoes: string;
};

const TIPOS_LARVA = [
  "Larvifort",
  "Larva A",
  "Larva B",
  "Larva C",
  "Outro",
];

const MOTIVOS_SAIDA = [
  "Preço",
  "Qualidade",
  "Atendimento",
  "Resultado insatisfatório",
  "Mudança de fornecedor",
  "Indicação",
  "Outro",
];

export default function NovaPesquisaModal({
  open,
  onClose,
  onSuccess,
  clientes,
  responsaveis,
}: NovaPesquisaModalProps) {
  const [form, setForm] = useState<FormState>({
    clienteId: "",
    dataPesquisa: new Date().toISOString().split("T")[0],
    responsavelId: "",
    larvas: [],
    maioriaLarvifort: false,
    parouLarvifort: false,
    motivosSaida: [],
    outroMotivo: "",
    uniformidadeBercario: "",
    uniformidadeCultivo: "",
    sobrevBercario: "",
    sobrevCultivo: "",
    resultadosUltimoCiclo: "",
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    clienteId?: string;
    larvas?: string;
    maioriaLarvifort?: string;
  }>({});

  if (!open) return null;

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    if (loading) return;
    setForm({
      clienteId: "",
      dataPesquisa: new Date().toISOString().split("T")[0],
      responsavelId: "",
      larvas: [],
      maioriaLarvifort: false,
      parouLarvifort: false,
      motivosSaida: [],
      outroMotivo: "",
      uniformidadeBercario: "",
      uniformidadeCultivo: "",
      sobrevBercario: "",
      sobrevCultivo: "",
      resultadosUltimoCiclo: "",
      observacoes: "",
    });
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const toggleLarva = (larva: string) => {
    handleChange("larvas", form.larvas.includes(larva)
      ? form.larvas.filter((l) => l !== larva)
      : [...form.larvas, larva] as FormState["larvas"]);
  };

  const toggleMotivo = (motivo: string) => {
    handleChange("motivosSaida", form.motivosSaida.includes(motivo)
      ? form.motivosSaida.filter((m) => m !== motivo)
      : [...form.motivosSaida, motivo] as FormState["motivosSaida"]);
  };

  const validate = (): boolean => {
    const errors: { clienteId?: string; larvas?: string; maioriaLarvifort?: string } = {};
    if (!form.clienteId) errors.clienteId = "Cliente é obrigatório";
    if (form.larvas.length === 0) errors.larvas = "Selecione pelo menos uma larva";
    if (form.maioriaLarvifort === undefined) errors.maioriaLarvifort = "Informe se a maioria é Larvifort";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    const payload: FieldSearchInput = {
      clienteId: form.clienteId,
      dataPesquisa: form.dataPesquisa,
      responsavelId: form.responsavelId || null,
      larvas: form.larvas,
      maioriaLarvifort: form.maioriaLarvifort,
      parouLarvifort: form.parouLarvifort,
      motivosSaida: form.motivosSaida,
      outroMotivo: form.outroMotivo || null,
      uniformidadeBercario: form.uniformidadeBercario || null,
      uniformidadeCultivo: form.uniformidadeCultivo || null,
      sobrevBercario: form.sobrevBercario ? Number(form.sobrevBercario) : null,
      sobrevCultivo: form.sobrevCultivo ? Number(form.sobrevCultivo) : null,
      resultadosUltimoCiclo: form.resultadosUltimoCiclo || null,
      observacoes: form.observacoes || null,
    };

    try {
      const created = await createSearch(payload);
      onSuccess?.(created);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao criar pesquisa (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao criar pesquisa");
      }
    } finally {
      setLoading(false);
    }
  };

  const maioriaOptions = [
    { value: true, label: "Sim", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { value: false, label: "Não", color: "bg-red-100 text-red-700 border-red-300" },
  ];

  const parouOptions = [
    { value: true, label: "Sim, pararam", color: "bg-amber-100 text-amber-700 border-amber-300" },
    { value: false, label: "Não pararam", color: "bg-sky-100 text-sky-700 border-sky-300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-600" />
              Nova Pesquisa de Campo
            </h2>
            <p className="text-xs text-slate-500">Registrar nova pesquisa de campo</p>
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

        <form className="flex-1 overflow-y-auto p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
              <WarningCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente / Fazenda <span className="text-red-500">*</span>
              </label>
              <select
                value={form.clienteId}
                onChange={(e) => handleChange("clienteId", e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  fieldErrors.clienteId ? "border-red-400" : "border-slate-200"
                }`}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              {fieldErrors.clienteId && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.clienteId}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data da Pesquisa <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dataPesquisa}
                onChange={(e) => handleChange("dataPesquisa", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responsável pela Pesquisa
            </label>
            <select
              value={form.responsavelId}
              onChange={(e) => handleChange("responsavelId", e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Selecione o responsável (opcional)</option>
              {responsaveis.map((r) => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quais larvas o cliente está usando? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_LARVA.map((larva) => (
                <button
                  key={larva}
                  type="button"
                  onClick={() => toggleLarva(larva)}
                  disabled={loading}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    form.larvas.includes(larva)
                      ? "bg-sky-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {larva}
                </button>
              ))}
            </div>
            {fieldErrors.larvas && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.larvas}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              A maioria é Larvifort? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {maioriaOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleChange("maioriaLarvifort", opt.value)}
                  disabled={loading}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    form.maioriaLarvifort === opt.value
                      ? opt.color
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {fieldErrors.maioriaLarvifort && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.maioriaLarvifort}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tinham deixado de usar Larvifort?
            </label>
            <div className="flex gap-3 mb-3">
              {parouOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleChange("parouLarvifort", opt.value)}
                  disabled={loading}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    form.parouLarvifort === opt.value
                      ? opt.color
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {form.parouLarvifort && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Por que pararam?
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {MOTIVOS_SAIDA.map((motivo) => (
                    <button
                      key={motivo}
                      type="button"
                      onClick={() => toggleMotivo(motivo)}
                      disabled={loading}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        form.motivosSaida.includes(motivo)
                          ? "bg-violet-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {motivo}
                    </button>
                  ))}
                </div>
                {form.motivosSaida.includes("Outro") && (
                  <input
                    type="text"
                    value={form.outroMotivo}
                    onChange={(e) => handleChange("outroMotivo", e.target.value)}
                    placeholder="Descreva o motivo"
                    disabled={loading}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Avaliação da Larva</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uniformidade - Berçário
                </label>
                <select
                  value={form.uniformidadeBercario}
                  onChange={(e) => handleChange("uniformidadeBercario", e.target.value as Uniformidade | "")}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Selecione</option>
                  {UNIFORMIDADE_VALUES.map((u) => (
                    <option key={u} value={u}>{uniformidadeLabel(u)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uniformidade - Cultivo
                </label>
                <select
                  value={form.uniformidadeCultivo}
                  onChange={(e) => handleChange("uniformidadeCultivo", e.target.value as Uniformidade | "")}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Selecione</option>
                  {UNIFORMIDADE_VALUES.map((u) => (
                    <option key={u} value={u}>{uniformidadeLabel(u)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sobrevivência - Berçário (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.sobrevBercario}
                  onChange={(e) => handleChange("sobrevBercario", e.target.value)}
                  placeholder="Ex: 85"
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sobrevivência - Cultivo (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.sobrevCultivo}
                  onChange={(e) => handleChange("sobrevCultivo", e.target.value)}
                  placeholder="Ex: 78"
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Resultados do Último Ciclo (últimos 30 dias)
            </h3>
            <textarea
              value={form.resultadosUltimoCiclo}
              onChange={(e) => handleChange("resultadosUltimoCiclo", e.target.value)}
              placeholder="Descreva os resultados: produção, mortalidade, conversão alimentar, peso final, etc."
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
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
                  Salvando...
                </>
              ) : (
                "Salvar Pesquisa"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}