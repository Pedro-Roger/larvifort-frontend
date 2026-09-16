"use client";

import React, { useState } from "react";
import {
  X,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Check,
  ArrowsCounterClockwise,
  Target,
  ChartLineUp,
  UsersThree,
  MapPin,
  Clock,
  Sparkle,
  Plus,
} from "@phosphor-icons/react";
import {
  type DashboardLayoutItem,
  saveDashboardLayout,
  resetDashboardLayout,
} from "@/services/dashboardCustomization";
import Link from "next/link";

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutItems: DashboardLayoutItem[];
  onUpdateLayout: (items: DashboardLayoutItem[]) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  metas: Target,
  vendas: ChartLineUp,
  equipe: UsersThree,
  clientes: MapPin,
  atividades: Clock,
  metricas: Sparkle,
};

export default function DashboardCustomizerModal({
  isOpen,
  onClose,
  layoutItems,
  onUpdateLayout,
}: DashboardCustomizerModalProps) {
  const [items, setItems] = useState<DashboardLayoutItem[]>(layoutItems);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, enabled: !it.enabled } : it
    );
    setItems(updated);
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setItems(copy);
  };

  const handleEnableAll = () => {
    setItems(items.map((it) => ({ ...it, enabled: true })));
  };

  const handleResetDefault = () => {
    const defaults = resetDashboardLayout();
    setItems(defaults);
    onUpdateLayout(defaults);
  };

  const handleSaveAndClose = () => {
    saveDashboardLayout(items);
    onUpdateLayout(items);
    onClose();
  };

  const enabledCount = items.filter((it) => it.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-label="Personalizar Dashboard"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-400/30">
              <SlidersHorizontal size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Personalizar Layout do Dashboard
              </h2>
              <p className="text-xs text-slate-300">
                Escolha o que você quer ver na tela e a ordem dos blocos ({enabledCount} de {items.length} ativos)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnableAll}
              className="rounded-lg px-2.5 py-1 font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
            >
              Ativar Todos
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ArrowsCounterClockwise size={13} />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          <Link
            href="/metricas"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline"
          >
            <Plus size={13} weight="bold" />
            <span>Criar nova Métrica</span>
          </Link>
        </div>

        {/* Body List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {items.map((item, idx) => {
            const IconComp = CATEGORY_ICONS[item.category] || Sparkle;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                  item.enabled
                    ? "border-slate-200 bg-white shadow-xs"
                    : "border-slate-100 bg-slate-50/60 opacity-60"
                }`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      item.enabled
                        ? "bg-brand-50 text-brand-600 border border-brand-200"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    <IconComp size={18} weight={item.enabled ? "bold" : "regular"} />
                  </button>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleToggle(item.id)}>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right: Reorder & Toggle */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(item.id, "up")}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Subir posição"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(item.id, "down")}
                      disabled={idx === items.length - 1}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Descer posição"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.enabled ? "bg-brand-600" : "bg-slate-200"
                    }`}
                    role="switch"
                    aria-checked={item.enabled}
                    title={item.enabled ? "Ocultar do dashboard" : "Mostrar no dashboard"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        item.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
          <span className="text-xs text-slate-500">
            As alterações são salvas automaticamente no seu navegador.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-all cursor-pointer"
            >
              <Check size={16} weight="bold" />
              <span>Aplicar Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
