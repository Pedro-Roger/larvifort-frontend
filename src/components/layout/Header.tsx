"use client";

import { TrayArrowDown, Plus } from "@phosphor-icons/react";

interface HeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  onAdd?: () => void;
}

export default function Header({ title, count, countLabel, onAdd }: HeaderProps) {
  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
        {count !== undefined && (
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            {count} {countLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all">
          <TrayArrowDown size={14} />
          <span>Importar / Exportar</span>
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/25 transition-all"
          >
            <Plus size={14} />
            <span>Adicionar Contato</span>
          </button>
        )}
      </div>
    </header>
  );
}
