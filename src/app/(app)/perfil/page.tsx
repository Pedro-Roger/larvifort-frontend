"use client";

import { useState } from "react";
import { User, ShieldCheck, EnvelopeSimple, Lock, Eye, EyeClosed, FloppyDisk } from "@phosphor-icons/react";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/services/api";

export default function PerfilPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { toast } = useToast();

  // Form state - initialize directly from user data (no effect needed)
  const [form, setForm] = useState(() => {
    if (user) {
      return {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Key to force form remount when user changes
  const formKey = user ? `${user.id}-${user.updatedAt || ""}` : "no-user";

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Nome é obrigatório";
    if (!form.lastName.trim()) newErrors.lastName = "Sobrenome é obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }
    if (form.newPassword) {
      if (form.newPassword.length < 4) newErrors.newPassword = "Mínimo 4 caracteres";
      if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = "Senhas não conferem";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // TODO: Integrar com API PATCH /profile quando backend estiver disponível
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({ message: "Perfil atualizado com sucesso!", type: "success" });
    } catch (err) {
      if (err instanceof ApiError) {
        toast({ message: `Erro ao salvar (${err.status})`, type: "error" });
      } else {
        toast({ message: "Erro ao salvar perfil", type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header title="Perfil do Usuário" />
        <main className="flex-1 overflow-auto p-8">
          <p className="text-slate-500 text-center py-12">Usuário não autenticado</p>
        </main>
      </>
    );
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      <Header title="Perfil do Usuário" />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header do Perfil */}
          <div className="flex items-center gap-4 p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck size={14} className={user.role === "ADMIN" ? "text-violet-600" : "text-sky-600"} />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                </span>
                {user.teamName && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{user.teamName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form key={formKey} onSubmit={handleSave} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-sky-600" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.firstName ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                    disabled={saving}
                  />
                  {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sobrenome</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.lastName ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                    disabled={saving}
                  />
                  {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                      errors.email ? "border-red-400" : "border-slate-200"
                    } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                    disabled={saving}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Lock size={18} className="text-sky-600" />
                Alterar Senha
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha Atual</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) => handleChange("currentPassword", e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                          errors.newPassword ? "border-red-400" : "border-slate-200"
                        } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                        disabled={saving}
                        placeholder="Deixe em branco para não alterar"
                      />
                    </div>
                    {errors.newPassword && <p className="text-[11px] text-red-500 mt-1">{errors.newPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                          errors.confirmPassword ? "border-red-400" : "border-slate-200"
                        } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                        disabled={saving}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FloppyDisk size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}