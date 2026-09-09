"use client";

import { X, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useToast } from "@/hooks/useToast";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

const toastIcons = {
  success: CheckCircle,
  error: X,
  warning: WarningCircle,
};

const toastClasses = {
  success: "bg-emerald-500 border-emerald-600 text-emerald-50",
  error: "bg-red-500 border-red-600 text-red-50",
  warning: "bg-amber-500 border-amber-600 text-amber-50",
};

export function Toast({ id, message, type }: ToastProps) {
  const { dismiss } = useToast();
  const Icon = toastIcons[type];
  const classes = toastClasses[type];

  return (
    <div
      key={id}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-0 transition-all duration-300 ${classes}`}
      role="alert"
      aria-live="polite"
    >
      <div className="rounded-lg border p-4 flex items-center gap-3 shadow-lg max-w-sm">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white">
          <Icon size={20} weight="fill" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <button
          onClick={() => dismiss(id)}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
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