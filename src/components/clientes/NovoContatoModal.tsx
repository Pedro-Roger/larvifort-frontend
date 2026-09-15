"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, CaretDown } from "@phosphor-icons/react";
import {
  createClient,
  type Cliente,
  type ClienteInput,
  type ClienteStatus,
} from "@/services/clients";
import { ApiError } from "@/services/api";

interface NovoContatoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: Cliente) => void;
}

type FormState = {
  name: string;
  email: string;
  phoneCountry: string;
  phoneNumber: string;
  birthdate: string;
  cpfCnpj: string;
  statusLead: ClienteStatus | "";
  origem: string;
  pais: string;
  cidadeUf: string;
  endereco: string;
  observacoes: string;
  laminaAgua: string;
  qtdViveiros: string;
  densidade: string;
  producaoMedia: string;
  temBercario: string;
  qtdBercarios: string;
  volumeBercarios: string;
  alimentadorAutomatico: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phoneCountry: "+55",
  phoneNumber: "",
  birthdate: "",
  cpfCnpj: "",
  statusLead: "NOVO",
  origem: "",
  pais: "Brasil",
  cidadeUf: "",
  endereco: "",
  observacoes: "",
  laminaAgua: "",
  qtdViveiros: "",
  densidade: "",
  producaoMedia: "",
  temBercario: "nao",
  qtdBercarios: "",
  volumeBercarios: "",
  alimentadorAutomatico: "nao",
};

export default function NovoContatoModal({
  open,
  onClose,
  onSuccess,
}: NovoContatoModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
  }>({});

  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const handleCnpjBlur = async () => {
    const digits = form.cpfCnpj.replace(/\D/g, "");
    if (digits.length === 14) {
      setLoadingCnpj(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            name: (data.razao_social || data.nome_fantasia || "").trim() || prev.name,
            cidadeUf: data.municipio ? `${data.municipio}, ${data.uf}` : prev.cidadeUf,
            endereco: data.logradouro ? `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''} - ${data.bairro} - CEP: ${data.cep}` : prev.endereco
          }));
          setFieldErrors((prev) => ({ ...prev, name: undefined }));
        }
      } catch (err) {
        console.error("Erro ao buscar CNPJ", err);
      } finally {
        setLoadingCnpj(false);
      }
    }
  };

  if (!open) return null;

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm(INITIAL_FORM);
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const parseCityUf = (cidadeUf: string): { cidade: string | null; uf: string | null } => {
    const trimmed = cidadeUf.trim();
    if (!trimmed) return { cidade: null, uf: null };
    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return { cidade: parts[0] || null, uf: parts[1] || null };
    }
    return { cidade: trimmed, uf: null };
  };

  const parseNumber = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    

    const errors: { name?: string } = {};
    const nameTrim = form.name.trim();
    if (!nameTrim) {
      errors.name = "Nome é obrigatório.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const { cidade, uf } = parseCityUf(form.cidadeUf);
    const fullPhone = form.phoneNumber.trim()
      ? `${form.phoneCountry} ${form.phoneNumber.trim()}`
      : null;

    const payload: ClienteInput = {
      firstName: nameTrim.split(' ')[0] || '',
      lastName: nameTrim.split(' ').slice(1).join(' ') || '',
      email: form.email.trim() || null,
      phone: fullPhone,
      birthdate: form.birthdate || null,
      cpfCnpj: form.cpfCnpj.trim() || null,
      statusLead: (form.statusLead as ClienteStatus) || "NOVO",
      origem: form.origem.trim() || null,
      pais: form.pais.trim() || "Brasil",
      cidade,
      uf,
      endereco: form.endereco.trim() || null,
      observacoes: form.observacoes.trim() || null,
      laminaAgua: parseNumber(form.laminaAgua),
      qtdViveiros: parseNumber(form.qtdViveiros),
      densidade: parseNumber(form.densidade),
      producaoMedia: parseNumber(form.producaoMedia),
      temBercario: form.temBercario === "sim",
      qtdBercarios: parseNumber(form.qtdBercarios),
      volumeBercarios: parseNumber(form.volumeBercarios),
      alimentadorAutomatico: form.alimentadorAutomatico === "sim",
    };

    setLoading(true);

    try {
      const created = await createClient(payload);
      setForm(INITIAL_FORM);
      setErrorMessage(null);
      setFieldErrors({});
      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Erro ao salvar cliente.");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocorreu um erro inesperado ao salvar o contato.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] min-h-0">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Criar Novo Contato</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-5">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2"
              >
                <WarningCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Photo Upload */}
            <div className="flex items-center gap-3.5 pb-2">
              <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                <span className="text-xl">👤</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Upload de Foto
              </button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome / Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400 ${
                    fieldErrors.name
                      ? "border-red-400 bg-red-50/50"
                      : "border-slate-200"
                  }`}
                  placeholder="Digite o nome ou razão social..."
                  type="text"
                />
                {fieldErrors.name && (
                  <span className="text-[11px] text-red-500 mt-1 block">
                    {fieldErrors.name}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                  placeholder="exemplo@empresa.com.br"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone
                </label>
                <div className="flex">
                  <select
                    value={form.phoneCountry}
                    onChange={(e) => handleChange("phoneCountry", e.target.value)}
                    className="text-xs bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg px-2 py-2 text-slate-600 focus:ring-0 focus:border-slate-200"
                  >
                    <option value="+55">+55</option>
                    <option value="+1">+1</option>
                    <option value="+351">+351</option>
                  </select>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-r-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="(11) 98765-4321"
                    type="tel"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento / Fundação
                </label>
                <input
                  value={form.birthdate}
                  onChange={(e) => handleChange("birthdate", e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600"
                  type="date"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                  CPF ou CNPJ
                  {loadingCnpj && <CircleNotch size={12} className="animate-spin text-brand-600" />}
                </label>
                <input
                  value={form.cpfCnpj}
                  onChange={(e) => handleChange("cpfCnpj", e.target.value)}
                  onBlur={handleCnpjBlur}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                  placeholder="000.000.000-00"
                  type="text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Lead
                </label>
                <div className="relative">
                  <select
                  value={form.statusLead}
                  onChange={(e) =>
                    handleChange("statusLead", e.target.value as ClienteStatus)
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 appearance-none pr-8 bg-white"
                >
                  <option value="NOVO">Novo</option>
                  <option value="CLIENTE_ATIVO">Cliente Ativo</option>
                  <option value="EM_NEGOCIACAO">Em Negociação</option>
                  <option value="SEM_CONTATO">Sem Contato</option>
                  </select>
                  <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Origem / Canal
                </label>
                <div className="relative">
                  <select
                  value={form.origem}
                  onChange={(e) => handleChange("origem", e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 appearance-none pr-8 bg-white"
                >
                  <option value="">Selecione a origem...</option>
                  <option value="Site Institucional">Site Institucional</option>
                  <option value="Indicação Comercial">Indicação Comercial</option>
                  <option value="Feira / Evento">Feira / Evento</option>
                  <option value="Prospecção Ativa">Prospecção Ativa</option>
                  </select>
                  <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  País
                </label>
                <div className="relative">
                  <select
                  value={form.pais}
                  onChange={(e) => handleChange("pais", e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 appearance-none pr-8 bg-white"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  </select>
                  <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade / UF
                </label>
                <input
                  value={form.cidadeUf}
                  onChange={(e) => handleChange("cidadeUf", e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                  placeholder="Ex: São Paulo, SP"
                  type="text"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Endereço Completo
              </label>
              <input
                value={form.endereco}
                onChange={(e) => handleChange("endereco", e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                placeholder="Rua, número, complemento e bairro..."
                type="text"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações & Descrição
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400 resize-none"
                placeholder="Insira detalhes adicionais do cliente ou diretrizes de atendimento..."
                rows={2}
              />
            </div>

            {/* Dados do Produtor de Camarão */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Dados da Piscicultura / Camarão
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lâmina d&apos;Água (m²)
                  </label>
                  <input
                    value={form.laminaAgua}
                    onChange={(e) => handleChange("laminaAgua", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 50000"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantos Viveiros
                  </label>
                  <input
                    value={form.qtdViveiros}
                    onChange={(e) => handleChange("qtdViveiros", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 12"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Densidade Utilizada (ind/m²)
                  </label>
                  <input
                    value={form.densidade}
                    onChange={(e) => handleChange("densidade", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 150"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Produção Média (kg/ciclo)
                  </label>
                  <input
                    value={form.producaoMedia}
                    onChange={(e) => handleChange("producaoMedia", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 8000"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tem Berçário?
                  </label>
                  <div className="relative">
                    <select
                    value={form.temBercario}
                    onChange={(e) => handleChange("temBercario", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 appearance-none pr-8 bg-white"
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                    </select>
                    <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantos Berçários
                  </label>
                  <input
                    value={form.qtdBercarios}
                    onChange={(e) => handleChange("qtdBercarios", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 4"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volume Total Berçários (m³)
                  </label>
                  <input
                    value={form.volumeBercarios}
                    onChange={(e) => handleChange("volumeBercarios", e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                    placeholder="Ex: 200"
                    type="number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usa Alimentador Automático?
                  </label>
                  <div className="relative">
                    <select
                    value={form.alimentadorAutomatico}
                    onChange={(e) =>
                      handleChange("alimentadorAutomatico", e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-brand-600 focus:border-brand-600 appearance-none pr-8 bg-white"
                  >
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                    </select>
                    <CaretDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading && <CircleNotch size={14} className="animate-spin" />}
              <span>{loading ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
