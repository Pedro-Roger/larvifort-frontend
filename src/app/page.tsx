"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [router, authLoading, isAuthenticated]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const trimmedEmail = email.trim();
    const nextErrors: { email?: string; password?: string } = {};

    if (!trimmedEmail) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      nextErrors.password = "Informe sua senha.";
    } else if (password.length < 4) {
      nextErrors.password = "A senha deve ter ao menos 4 caracteres.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login(trimmedEmail, password);
      router.replace("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-dot-matrix min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <main className="w-full max-w-[490px] flex flex-col items-center">
        {/* Brand Logo */}
        <header className="mb-9 flex items-center justify-center select-none">
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 shadow-sm shadow-sky-500/20 text-white">
              <svg
                className="w-6 h-6 stroke-current"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex items-baseline space-x-1 tracking-tight">
              <span className="text-2xl font-black tracking-wider text-[#0284c7]">
                LARVI
                <span className="text-slate-900">FORT</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 ml-1.5">
                CRM
              </span>
            </div>
          </div>
        </header>

        {/* Login Card */}
        <div className="w-full bg-white rounded-3xl border border-gray-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] p-8 sm:p-12 transition-all">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            Entrar na sua conta
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                className="w-full h-12 px-4 text-base text-gray-900 placeholder:text-gray-400 bg-white rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors duration-150 disabled:opacity-60"
                id="email"
                name="email"
                placeholder="seu@email.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={
                  fieldErrors.email ? "email-error" : undefined
                }
                disabled={loading}
              />
              {fieldErrors.email ? (
                <p id="email-error" className="text-sm text-red-600">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="password"
              >
                Senha
              </label>
              <input
                className="w-full h-12 px-4 text-base tracking-widest text-gray-900 placeholder:text-gray-400 bg-white rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors duration-150 disabled:opacity-60"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                disabled={loading}
              />
              {fieldErrors.password ? (
                <p id="password-error" className="text-sm text-red-600">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {submitError ? (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            ) : null}

            {/* Submit */}
            <div className="pt-2">
              <button
                className="w-full h-12 bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-base rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-sm font-normal text-gray-500">
            © 2026 LarviFort CRM · Todos os direitos reservados
          </p>
        </footer>
      </main>
    </div>
  );
}
