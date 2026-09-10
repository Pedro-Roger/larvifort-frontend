"use client";

import { TrayArrowDown, Plus } from "@phosphor-icons/react";
import NotificationCenter from "@/components/ui/NotificationCenter";

interface HeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export default function Header({
  title,
  count,
  countLabel,
  onAdd,
  addLabel = "Adicionar Contato",
}: HeaderProps) {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur-md shrink-0 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
          {title}
        </h1>
        {count !== undefined && (
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            {count} {countLabel}
          </span>
        )}
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <NotificationCenter variant="header" />
        <button className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 sm:flex-none">
          <TrayArrowDown size={14} />
          <span className="truncate">Importar / Exportar</span>
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-700 sm:flex-none"
          >
            <Plus size={14} />
            <span className="truncate">{addLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}
