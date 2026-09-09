"use client";

import { TrendUp, TrendDown, ArrowRight, Target, CurrencyDollar, Users } from "@phosphor-icons/react";

interface SalesRateProps {
  geral: {
    totalClientes: number;
    clientesAtivos: number;
    taxaConversao: number;
    receitaTotal: number;
    ticketMedio: number;
    vendasMes: number;
    metaValor: number;
    metaVolume: number;
  };
  porPessoa: {
    nome: string;
    initials: string;
    clientes: number;
    vendas: number;
    conversao: number;
    receita: number;
    metaValor: number;
    metaVolume: number;
  }[];
}

function ProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 5,
  color = "#0ea5e9",
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ - pct * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

export default function SalesRate({ geral, porPessoa }: SalesRateProps) {
  const geralPctValor = geral.metaValor > 0 ? Math.round((geral.receitaTotal / geral.metaValor) * 100) : 0;
  const geralPctVolume = geral.metaVolume > 0 ? Math.round((geral.vendasMes / geral.metaVolume) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <Target size={16} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Taxa de Vendas</h3>
            <p className="text-xs text-slate-500">Base de clientes por pessoa e geral</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-sky-500" />
              <span className="text-xs font-medium text-slate-500">Clientes Ativos</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{geral.clientesAtivos}</p>
            <p className="text-xs text-slate-400 mt-1">de {geral.totalClientes} totais</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{geral.taxaConversao}%</p>
            <p className="text-xs text-slate-400 mt-1">{geral.vendasMes} vendas no mês</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollar size={14} className="text-violet-500" />
              <span className="text-xs font-medium text-slate-500">Ticket Médio</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              R$ {geral.ticketMedio.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-slate-400 mt-1">por cliente ativo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Meta de Valor</span>
              <span className="text-xs text-slate-500">
                R$ {geral.receitaTotal.toLocaleString("pt-BR")} / R$ {geral.metaValor.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{ width: `${Math.min(geralPctValor, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span className={`font-semibold ${geralPctValor >= 100 ? "text-emerald-600" : geralPctValor >= 70 ? "text-amber-600" : "text-red-500"}`}>
                {geralPctValor}%
              </span>
              <span>100%</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600">Meta de Volume</span>
              <span className="text-xs text-slate-500">
                {geral.vendasMes} / {geral.metaVolume} vendas
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all"
                style={{ width: `${Math.min(geralPctVolume, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span className={`font-semibold ${geralPctVolume >= 100 ? "text-emerald-600" : geralPctVolume >= 70 ? "text-amber-600" : "text-red-500"}`}>
                {geralPctVolume}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600">Vendedor</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Clientes</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Vendas</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Conversão</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600">Receita</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Meta Valor</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600">Meta Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porPessoa.map((p, i) => {
                const pctValor = p.metaValor > 0 ? Math.round((p.receita / p.metaValor) * 100) : 0;
                const pctVolume = p.metaVolume > 0 ? Math.round((p.vendas / p.metaVolume) * 100) : 0;
                const colorValor =
                  pctValor >= 100 ? "#22c55e" : pctValor >= 70 ? "#f59e0b" : "#ef4444";
                const colorVolume =
                  pctVolume >= 100 ? "#22c55e" : pctVolume >= 70 ? "#f59e0b" : "#ef4444";

                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-[11px] font-bold text-sky-600">
                          {p.initials}
                        </div>
                        <span className="font-medium text-slate-800">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{p.clientes}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">{p.vendas}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        p.conversao >= 30 ? "text-emerald-600" : p.conversao >= 15 ? "text-amber-600" : "text-red-500"
                      }`}>
                        {p.conversao >= 30 ? <TrendUp size={12} /> : p.conversao >= 15 ? <ArrowRight size={12} /> : <TrendDown size={12} />}
                        {p.conversao}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      R$ {p.receita.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <ProgressRing value={p.receita} max={p.metaValor} color={colorValor} />
                        <span className="text-[11px] text-slate-500">
                          R$ {p.receita.toLocaleString("pt-BR")} / R$ {p.metaValor.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <ProgressRing value={p.vendas} max={p.metaVolume} color={colorVolume} />
                        <span className="text-[11px] text-slate-500">
                          {p.vendas} / {p.metaVolume}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                <td className="px-4 py-3 text-slate-800">Geral</td>
                <td className="px-4 py-3 text-center text-slate-700">{porPessoa.reduce((a, p) => a + p.clientes, 0)}</td>
                <td className="px-4 py-3 text-center text-slate-800">{porPessoa.reduce((a, p) => a + p.vendas, 0)}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-bold text-slate-700">
                    {porPessoa.reduce((a, p) => a + p.clientes, 0) > 0
                      ? Math.round(
                          (porPessoa.reduce((a, p) => a + p.vendas, 0) /
                            porPessoa.reduce((a, p) => a + p.clientes, 0)) *
                            100
                        )
                      : 0}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-800">
                  R$ {porPessoa.reduce((a, p) => a + p.receita, 0).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <ProgressRing
                      value={porPessoa.reduce((a, p) => a + p.receita, 0)}
                      max={porPessoa.reduce((a, p) => a + p.metaValor, 0)}
                      color={geralPctValor >= 100 ? "#22c55e" : geralPctValor >= 70 ? "#f59e0b" : "#ef4444"}
                    />
                    <span className="text-[11px] text-slate-500">{geralPctValor}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <ProgressRing
                      value={porPessoa.reduce((a, p) => a + p.vendas, 0)}
                      max={porPessoa.reduce((a, p) => a + p.metaVolume, 0)}
                      color={geralPctVolume >= 100 ? "#22c55e" : geralPctVolume >= 70 ? "#f59e0b" : "#ef4444"}
                    />
                    <span className="text-[11px] text-slate-500">{geralPctVolume}%</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}