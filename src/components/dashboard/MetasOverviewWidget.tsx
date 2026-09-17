"use client";

import React from "react";
import Link from "next/link";
import {
  Gear,
} from "@phosphor-icons/react";
import {
  type CommercialGoalsConfig,
  calcGoalsTotals,
} from "@/services/commercialMetas";

interface MetasOverviewWidgetProps {
  goals: CommercialGoalsConfig;
}

export default function MetasOverviewWidget({ goals }: MetasOverviewWidgetProps) {
  const totals = calcGoalsTotals(goals);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("pt-BR").format(val);

  // Status calculation
  const statusConfig =
    totals.pctValor >= 100
      ? { label: "Meta Superada", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : totals.pctValor >= 75
        ? { label: "No Ritmo", bg: "bg-sky-50 text-sky-700 border-sky-200" }
        : { label: "Aceleração Necessária", bg: "bg-amber-50 text-amber-800 border-amber-200" };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Metas Comerciais & Desempenho
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
              {goals.periodo}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento em tempo real da equipe comercial e atingimento de cotas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${statusConfig.bg}`}>
            {statusConfig.label}
          </span>
          <Link
            href="/configurar-metas"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Gear size={14} />
            <span>Ajustar Metas</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
        {/* Card 1: Faturamento R$ */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Meta de Faturamento
            </span>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              {totals.pctValor}% Atingido
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatMoney(totals.totalRealizadoValor)}
            </span>
            <span className="text-xs font-medium text-slate-400">
              de {formatMoney(goals.metaGlobalValor)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${Math.min(totals.pctValor, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Faltam {formatMoney(Math.max(0, goals.metaGlobalValor - totals.totalRealizadoValor))}</span>
            <span className="font-semibold text-emerald-700">
              Projeção: {totals.pctValor >= 90 ? "105%" : "98%"}
            </span>
          </div>
        </div>

        {/* Card 2: Volume Toneladas */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Meta de Expedição (Volume)
            </span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {totals.pctVolume}% Atingido
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatNumber(totals.totalRealizadoVolume)} <span className="text-base font-semibold text-slate-500">Ton</span>
            </span>
            <span className="text-xs font-medium text-slate-400">
              de {formatNumber(goals.metaGlobalVolume)} Ton
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${Math.min(totals.pctVolume, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Faltam {formatNumber(Math.max(0, goals.metaGlobalVolume - totals.totalRealizadoVolume))} Ton</span>
            <span className="font-semibold text-sky-700">
              Ritmo: {Math.round(totals.totalRealizadoVolume / (goals.consultores.length || 1))} Ton / consultor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
