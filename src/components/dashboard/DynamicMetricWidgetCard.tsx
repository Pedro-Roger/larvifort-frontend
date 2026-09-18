"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Trash,
  ArrowsClockwise,
  ChartBar,
  Table as TableIcon,
  SquaresFour,
} from "@phosphor-icons/react";
import {
  fetchMetricAnalysis,
  type MetricAnalysis,
  type MetricAnalysisResult,
} from "@/services/metrics";
import type { DashboardMetricWidget } from "@/services/dashboardWidgets";
import { loadMetricAnalyses, METRIC_ANALYSES_EVENT } from "@/services/metricAnalyses";

interface DynamicMetricWidgetCardProps {
  widget: DashboardMetricWidget;
  index: number;
  total: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}

const numberFormat = (val: number) =>
  val.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const moneyFormat = (val: number) =>
  val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

function analysisResultText(analysis: MetricAnalysis) {
  if (analysis.result?.status === "ready") {
    return `${analysis.result.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${analysis.result.label ? ` ${analysis.result.label}` : ""}`;
  }
  if (analysis.result?.status === "unavailable") {
    return analysis.result.reason ?? "Resultado indisponível";
  }
  return "Aguardando cálculo";
}

export default function DynamicMetricWidgetCard({
  widget,
  index,
  total,
  onMove,
  onRemove,
}: DynamicMetricWidgetCardProps) {
  const [data, setData] = useState<MetricAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [, setAnalysisVersion] = useState(0);
  const [, startTransition] = useTransition();
  const savedAnalysis: MetricAnalysis | null = widget.analysisId
    ? loadMetricAnalyses().find((analysis) => analysis.id === widget.analysisId) ?? null
    : null;

  useEffect(() => {
    if (!widget.analysisId) return;
    const refresh = () => setAnalysisVersion((version) => version + 1);
    window.addEventListener(METRIC_ANALYSES_EVENT, refresh);
    return () => window.removeEventListener(METRIC_ANALYSES_EVENT, refresh);
  }, [widget.analysisId]);

  useEffect(() => {
    if (widget.analysisId) return;
    const controller = new AbortController();

    fetchMetricAnalysis(
      {
        teamId: widget.teamId,
        userIds: widget.userIds,
        type: widget.type,
        period: widget.period,
        startDate: widget.startDate,
        endDate: widget.endDate,
      },
      controller.signal
    )
      .then((res) => {
        if (!controller.signal.aborted) {
          startTransition(() => {
            setData(res);
            setLoading(false);
            setError("");
          });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          startTransition(() => {
            setError(
              err instanceof Error ? err.message : "Não foi possível carregar a análise."
            );
            setLoading(false);
          });
        }
      });

    return () => controller.abort();
  }, [widget, retry]);

  const currency = widget.type === "SALES" && widget.axis === "value";
  const formatValue = (val: number) => (currency ? moneyFormat(val) : numberFormat(val));
  const widgetTitle = savedAnalysis?.name ?? (widget.title || widget.typeLabel);

  const chartSeries =
    widget.group === "period"
      ? data?.series ?? []
      : (data?.comparison ?? []).map((item) => ({
          label: item.label,
          value: item.orders,
          quantity: item.orders,
        }));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              {widget.mode === "charts" ? (
                <>
                  <ChartBar size={12} weight="bold" /> Gráfico
                </>
              ) : widget.mode === "table" ? (
                <>
                  <TableIcon size={12} weight="bold" /> Tabela
                </>
              ) : (
                <>
                  <SquaresFour size={12} weight="bold" /> Indicadores
                </>
              )}
            </span>
            <span className="text-xs text-slate-400">• {widget.periodLabel}</span>
          </div>

          <h3 className="mt-1.5 truncate text-base font-bold text-slate-900 tracking-tight">
            {widgetTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {widget.teamName} · {widget.startDate} até {widget.endDate}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRetry((r) => r + 1);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Recarregar dados"
          >
            <ArrowsClockwise size={15} />
          </button>
          <button
            type="button"
            onClick={() => onMove(widget.id, "up")}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Mover para cima"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            onClick={() => onMove(widget.id, "down")}
            disabled={index === total - 1}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Mover para baixo"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(widget.id)}
            className="rounded-lg p-1.5 text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
            title="Remover widget"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>

      {/* Card Body with Real Dynamic Data */}
      <div className="pt-4 flex-1 min-h-[220px]">
        {widget.analysisId ? (
          savedAnalysis ? (
            <div className="h-48 flex flex-col justify-center gap-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{savedAnalysis.definition ?? savedAnalysis.sources?.map((source) => source.label).join(", ") ?? savedAnalysis.primarySource.label}</p>
              <p>{savedAnalysis.filters.length ? `${savedAnalysis.filters.length} filtro(s) aplicado(s)` : "Sem filtros aplicados"}</p>
              <p className="text-xs text-slate-500">Resultado: {analysisResultText(savedAnalysis)}</p>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-slate-500">A análise publicada não está mais disponível.</div>
          )
        ) : loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            Carregando dados da métrica...
          </div>
        ) : error ? (
          <div className="h-48 flex flex-col items-center justify-center text-xs text-red-500 gap-2">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRetry((r) => r + 1);
              }}
              className="text-brand-600 font-bold underline cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : widget.mode === "charts" ? (
          /* REAL INTERACTIVE CHART */
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartSeries}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip
                  formatter={(val) => [formatValue(Number(val)), widget.typeLabel]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey={widget.group === "people" ? "quantity" : widget.axis}
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : widget.mode === "table" ? (
          /* REAL DATA TABLE */
          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Período / Membro</th>
                  <th className="pb-2 text-right">Quantidade</th>
                  <th className="pb-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.series ?? []).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-800 font-medium">{row.label}</td>
                    <td className="py-2 text-right text-slate-600">{numberFormat(row.quantity)}</td>
                    <td className="py-2 text-right text-slate-900 font-bold">{moneyFormat(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* REAL KPI CARDS */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatValue(data?.summary.value || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Quantidade</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {numberFormat(data?.summary.quantity || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Clientes</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {numberFormat(data?.summary.clients || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Visitas</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {numberFormat(data?.summary.visits || 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
