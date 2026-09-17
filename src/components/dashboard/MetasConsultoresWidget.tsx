"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
} from "@phosphor-icons/react";
import { type CommercialGoalsConfig } from "@/services/commercialMetas";

interface MetasConsultoresWidgetProps {
  goals: CommercialGoalsConfig;
}

export default function MetasConsultoresWidget({ goals }: MetasConsultoresWidgetProps) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("pt-BR").format(val);

  const sortedConsultores = [...goals.consultores].sort((a, b) => {
    const pctA = a.valor > 0 ? ((a.realizadoValor || 0) / a.valor) * 100 : 0;
    const pctB = b.valor > 0 ? ((b.realizadoValor || 0) / b.valor) * 100 : 0;
    return pctB - pctA;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Metas & Desempenho por Consultor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atingimento individual de cotas de faturamento e volume expedido
          </p>
        </div>

        <Link
          href="/configurar-metas"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
        >
          <span>Distribuir Cotas</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-1">Consultor</th>
              <th className="pb-3">Região / Contas</th>
              <th className="pb-3">Realizado (R$)</th>
              <th className="pb-3">Cota (R$)</th>
              <th className="pb-3 w-40">Atingimento (%)</th>
              <th className="pb-3 pr-1 text-right">Volume (Ton)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedConsultores.map((consultor) => {
              const metaVal = consultor.valor || 1;
              const realVal = consultor.realizadoValor || 0;
              const pct = Math.round((realVal / metaVal) * 100);

              const metaVol = consultor.volume || 1;
              const realVol = consultor.realizadoVolume || 0;
              const pctVol = Math.round((realVol / metaVol) * 100);

              return (
                <tr key={consultor.nome} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                        {consultor.iniciais}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {consultor.nome}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {consultor.vendas ? `${consultor.vendas} vendas realizadas` : "Consultor Técnico"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <p className="font-medium text-slate-700">{consultor.regiao}</p>
                    <p className="text-[10px] text-slate-400">{consultor.contas} clientes ativos</p>
                  </td>

                  <td className="py-3.5 font-bold text-slate-900">
                    {formatMoney(realVal)}
                  </td>

                  <td className="py-3.5 text-slate-500 font-medium">
                    {formatMoney(consultor.valor)}
                  </td>

                  <td className="py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-bold ${
                            pct >= 100
                              ? "text-emerald-600"
                              : pct >= 75
                              ? "text-sky-600"
                              : "text-amber-600"
                          }`}
                        >
                          {pct}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {pct >= 100 ? "Superada" : `Falta ${formatMoney(Math.max(0, consultor.valor - realVal))}`}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100
                              ? "bg-emerald-500"
                              : pct >= 75
                              ? "bg-sky-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 pr-1 text-right">
                    <p className="font-bold text-slate-800">
                      {formatNumber(realVol)} / {formatNumber(consultor.volume)} Ton
                    </p>
                    <p className="text-[10px] text-slate-400">{pctVol}% da meta física</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
