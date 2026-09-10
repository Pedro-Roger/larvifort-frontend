"use client";

import { useState } from "react";
import { X, CircleNotch, WarningCircle, ShieldCheck } from "@phosphor-icons/react";
import {
  createUser,
  type User,
  type UserInput,
  type Role,
  ROLE_VALUES,
  roleLabel,
} from "@/services/users";
import { ApiError } from "@/services/api";

interface NovoUsuarioModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: User) => void;
  teams: { id: string; name: string }[];
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  teamId: string;
};

export default function NovoUsuarioModal({
  open,
  onClose,
  onSuccess,
  teams,
}: NovoUsuarioModalProps) {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "password",
    role: "USER",
    teamId: teams.length > 0 ? teams[0].id : "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>({});

  if (!open) return null;

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (["firstName", "lastName", "email", "password"].includes(field)) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (loading) return;
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "password",
      role: "USER",
      teamId: teams.length > 0 ? teams[0].id : "",
    });
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const errors: { firstName?: string; lastName?: string; email?: string; password?: string } = {};
    if (!form.firstName.trim()) errors.firstName = "Nome é obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "E-mail inválido";
    }
    if (!form.password || form.password.length < 4) {
      errors.password = "Senha deve ter pelo menos 4 caracteres";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    const payload: UserInput = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      teamId: form.teamId || null,
    };

    try {
      const created = await createUser(payload);

      // Enviar e-mail de boas-vindas
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload.email,
            nome: `${payload.firstName} ${payload.lastName}`.trim(),
            usuario: payload.email,
            senhaProvisoria: payload.password,
          }),
        });
      } catch (emailErr) {
        console.error("Erro ao enviar e-mail de boas-vindas", emailErr);
      }

      onSuccess?.(created);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.body &&
            typeof err.body === "object" &&
            "message" in (err.body as Record<string, unknown>)
            ? String((err.body as Record<string, unknown>).message)
            : `Erro ao criar usuário (${err.status})`
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro desconhecido ao criar usuário");
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
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-600" />
              Novo Membro
            </h2>
            <p className="text-xs text-slate-500">Adicionar usuário à equipe</p>
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

          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Nome"
                disabled={loading}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  fieldErrors.firstName ? "border-red-400" : "border-slate-200"
                }`}
              />
              {fieldErrors.firstName && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sobrenome <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Sobrenome"
                disabled={loading}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  fieldErrors.lastName ? "border-red-400" : "border-slate-200"
                }`}
              />
              {fieldErrors.lastName && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail (login) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemplo.com"
              disabled={loading}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                fieldErrors.email ? "border-red-400" : "border-slate-200"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Mínimo 4 caracteres"
              disabled={loading}
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                fieldErrors.password ? "border-red-400" : "border-slate-200"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Perfil e Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perfil de Acesso
              </label>
              <select
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {ROLE_VALUES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time
              </label>
              <select
                value={form.teamId}
                onChange={(e) => handleChange("teamId", e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Sem time</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
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
                "Adicionar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
