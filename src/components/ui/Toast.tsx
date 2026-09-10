"use client";

import { X, CheckCircle, WarningCircle, Info, XCircle } from "@phosphor-icons/react";
import { useToast, ToastType } from "@/hooks/useToast";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
}

const toastIcons = {
  info: Info,
  success: CheckCircle,
  warning: WarningCircle,
  error: XCircle,
};

const toastClasses = {
  info: "bg-sky-600 border-sky-700 text-sky-50 shadow-sky-900/20",
  success: "bg-emerald-600 border-emerald-700 text-emerald-50 shadow-emerald-900/20",
  warning: "bg-amber-600 border-amber-700 text-amber-50 shadow-amber-900/20",
  error: "bg-rose-600 border-rose-700 text-rose-50 shadow-rose-900/20",
};

export function Toast({ id, message, type }: ToastProps) {
  const { dismiss } = useToast();
  const Icon = toastIcons[type] || Info;
  const classes = toastClasses[type] || toastClasses.info;

  return (
    <div
      key={id}
      className={`flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 transition-all duration-300 rounded-xl border p-4 shadow-xl max-w-sm ${classes}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
        <Icon size={20} weight="fill" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white break-words">{message}</p>
      </div>
      <button
        onClick={() => dismiss(id)}
        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
        aria-label="Fechar"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
