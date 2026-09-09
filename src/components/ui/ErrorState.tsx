"use client";

import { WarningCircle, CellSignalSlash, Database, CaretRight } from "@phosphor-icons/react";

type ErrorVariant = "network" | "server" | "generic" | "not-found" | "unauthorized";

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}

const variantConfig = {
  network: {
    icon: CellSignalSlash,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    defaultTitle: "Sem conexão",
    defaultMessage: "Verifique sua internet e tente novamente.",
  },
  server: {
    icon: Database,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    defaultTitle: "Erro no servidor",
    defaultMessage: "Ocorreu um problema inesperado. Tente novamente em alguns instantes.",
  },
  generic: {
    icon: WarningCircle,
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
    defaultTitle: "Algo deu errado",
    defaultMessage: "Não foi possível completar a operação.",
  },
  "not-found": {
    icon: WarningCircle,
    color: "text-sky-600",
    bgColor: "bg-sky-50 border-sky-200",
    defaultTitle: "Não encontrado",
    defaultMessage: "O recurso solicitado não existe ou foi removido.",
  },
  unauthorized: {
    icon: WarningCircle,
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-200",
    defaultTitle: "Acesso negado",
    defaultMessage: "Sua sessão expirou. Faça login novamente.",
  },
};

export function ErrorState({
  variant = "generic",
  title,
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  compact = false,
  className,
}: ErrorStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border p-6 text-center ${config.bgColor} ${className || ""}`}
      role="alert"
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color} bg-opacity-10`}>
          <Icon size={24} weight="fill" />
        </div>
        <div>
          <h3 className={`text-lg font-semibold text-slate-800 ${compact ? "text-base" : ""}`}>
            {title || config.defaultTitle}
          </h3>
          <p className={`text-slate-600 mt-1 ${compact ? "text-sm" : "text-base"}`}>
            {message || config.defaultMessage}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-colors mt-2 ${
              compact
                ? "text-xs px-3 py-1.5"
                : "text-sm"
            } ${config.color.replace("600", "600")} bg-white border border-current hover:bg-opacity-10`}
          >
            <CaretRight size={14} />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm ${className || ""}`}
      role="alert"
    >
      <WarningCircle size={16} weight="fill" className="text-red-500 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FieldErrorProps {
  message: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <p className={`text-[11px] text-red-500 mt-1 flex items-center gap-1 ${className || ""}`}>
      <WarningCircle size={10} weight="fill" />
      {message}
    </p>
  );
}

interface ToastErrorProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ToastError({ message, actionLabel, onAction }: ToastErrorProps) {
  // This would integrate with the useToast hook in actual usage
  // For now, it's a placeholder for the pattern
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-red-600 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}