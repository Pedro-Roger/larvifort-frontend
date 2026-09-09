"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CalendarCheck, ShoppingCart, Phone } from "@phosphor-icons/react";

interface FrequencyData {
  id: string;
  cliente: string;
  visitas: number;
  pedidos: number;
  ultimaVisita: string;
  ultimoPedido: string;
  ultimoContato: string;
}

interface FrequencySectionProps {
  chartData: { cliente: string; visitas: number }[];
  tableData: FrequencyData[];
}

const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
];

function TimeAgo({ date }: { date: string }) {
  const [day, month, year] = date.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  let color = "text-slate-500";
  let label = `${diffDays}d atrás`;

  if (diffDays === 0) {
    color = "text-emerald-600";
    label = "Hoje";
  } else if (diffDays === 1) {
    color = "text-emerald-600";
    label = "Ontem";
  } else if (diffDays <= 3) {
    color = "text-sky-600";
  } else if (diffDays <= 7) {
    color = "text-amber-600";
  } else {
    color = "text-red-500";
  }

  return (
    <div className="flex flex-col items-end">
      <span className={`text-xs font-medium ${color}`}>{date}</span>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}

export default function FrequencySection({
  chartData,
  tableData,
}: FrequencySectionProps) {
  const totalVisitas = tableData.reduce((a, b) => a + b.visitas, 0);
  const totalPedidos = tableData.reduce((a, b) => a + b.pedidos, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="cliente"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value) => [
                  `${value} visitas`,
                  "Visitas",
                ]}
              />
              <Bar dataKey="visitas" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              <strong className="text-slate-700">{tableData.length}</strong>{" "}
              clientes
            </span>
            <span>
              <strong className="text-slate-700">{totalVisitas}</strong> visitas
            </span>
            <span>
              <strong className="text-slate-700">{totalPedidos}</strong> pedidos
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">
                  Frequência
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">
                  Empresa
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarCheck size={12} />
                    Visitas
                  </div>
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingCart size={12} />
                    Pedidos
                  </div>
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                  Última Visita
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                  Último Pedido
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-end gap-1">
                    <Phone size={12} />
                    Último Contato
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => {
                const freq =
                  row.visitas >= 8
                    ? "Alta"
                    : row.visitas >= 4
                    ? "Média"
                    : "Baixa";
                const freqColor =
                  row.visitas >= 8
                    ? "bg-emerald-100 text-emerald-700"
                    : row.visitas >= 4
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-500";
                const freqBar =
                  row.visitas >= 8
                    ? "bg-emerald-500"
                    : row.visitas >= 4
                    ? "bg-sky-500"
                    : "bg-slate-400";
                const barWidth = Math.min((row.visitas / 12) * 100, 100);

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${freqColor}`}
                        >
                          {freq}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${freqBar}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {row.cliente}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-sky-50 px-2 text-xs font-bold text-sky-700">
                        {row.visitas}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-violet-50 px-2 text-xs font-bold text-violet-700">
                        {row.pedidos}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <TimeAgo date={row.ultimaVisita} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <TimeAgo date={row.ultimoPedido} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <TimeAgo date={row.ultimoContato} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}