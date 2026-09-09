"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, Handshake, MapPin } from "@phosphor-icons/react";
import {
  createAppointment,
  type Appointment,
  type AppointmentInput,
  type TipoCompromisso,
  TIPO_COMPROMISSO_VALUES,
  tipoCompromissoLabel,
} from "@/services/appointments";
import { ApiError } from "@/services/api";

interface NovoCompromissoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: Appointment) => void;
  defaultDate?: string; // YYYY-MM-DD
  clientes: { id: string; nome: string }[];
  empresas: { id: string; nome: string }[];
}

type FormState = {
  tipo: TipoCompromisso;
  titulo: string;
  clienteId: string;
  empresaId: string;
  data: string;
  horario: string;
  endereco: string;
  observacoes: string;
};

export default function NovoCompromissoModal({
  open,
  onClose,
  onSuccess,
  defaultDate = "",
  clientes,
  empresas,
}: NovoCompromissoModalProps) {
  const [form, setForm] = useState<FormState>({
    tipo: "REUNIAO",
    titulo: "",
    clienteId: "",
    empresaId: "",
    data: defaultDate,
    horario: "",
    endereco: "",
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    titulo?: string;
    data?: string;
    horario?: string;
  }>({});

  if (!open) return null;

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "titulo" || field === "data" || field === "horario") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({
      tipo: "REUNIAO",
      titulo: "",
      clienteId: "",
      empresaId: "",
      data: defaultDate,
      horario: "",
      endereco: "",
      observacoes: "",
    });
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errors: { titulo?: string; data?: string; horario?: string } = {};
    if (!form.titulo.trim()) {
      errors.titulo = "Título é obrigatório";
    }
    if (!form.data) {
      errors.data = "Data é obrigatória";
    }
    if (!form.horario) {
      errors.horario = "Horário é obrigatório";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    const payload: AppointmentInput = {
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      data: form.data,
      horario: form.horario || null,
      endereco: form.endereco.trim() || null,
      observacoes: form.observacoes.trim() || null,
      clienteId: form.clienteId || null,
      empresaId: form.empresaId || null,
    };

    try {
      const created = await createAppointment(payload);
      onSuccess?.(created);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao criar compromisso (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao criar compromisso");
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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Novo Compromisso</h2>
            <p className="text-xs text-slate-500">
              Agende uma reunião ou visita
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

          {/* Tipo de Compromisso */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tipo de Compromisso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPO_COMPROMISSO_VALUES.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleChange("tipo", tipo)}
                  disabled={loading}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    form.tipo === tipo
                      ? `${tipo === "REUNIAO" ? "border-violet-400 bg-violet-50" : "border-sky-400 bg-sky-50"}`
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {tipo === "REUNIAO" ? (
                    <Handshake size={18} className={`mx-auto mb-1.5 ${form.tipo === tipo ? "text-violet-600" : "text-slate-400"}`} />
                  ) : (
                    <MapPin size={18} className={`mx-auto mb-1.5 ${form.tipo === tipo ? "text-sky-600" : "text-slate-400"}`} />
                  )}
                  <p className={`text-xs font-bold ${form.tipo === tipo ? (tipo === "REUNIAO" ? "text-violet-700" : "text-sky-700") : "text-slate-500"}`}>
                    {tipoCompromissoLabel(tipo)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              placeholder="Ex: Reunião de acompanhamento"
              disabled={loading}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                fieldErrors.titulo ? "border-red-400" : "border-slate-200"
              }`}
            />
            {fieldErrors.titulo && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.titulo}</p>
            )}
          </div>

          {/* Cliente / Empresa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cliente / Empresa
            </label>
            <select
              value={form.clienteId}
              onChange={(e) => handleChange("clienteId", e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Selecione o cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome} (Empresa)
                </option>
              ))}
            </select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => handleChange("data", e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  fieldErrors.data ? "border-red-400" : "border-slate-200"
                }`}
              />
              {fieldErrors.data && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.data}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horário <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.horario}
                onChange={(e) => handleChange("horario", e.target.value)}
                disabled={loading}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  fieldErrors.horario ? "border-red-400" : "border-slate-200"
                }`}
              />
              {fieldErrors.horario && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.horario}</p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              disabled={loading}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              value={form.observacoes}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Detalhes do compromisso..."
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
                "Agendar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}