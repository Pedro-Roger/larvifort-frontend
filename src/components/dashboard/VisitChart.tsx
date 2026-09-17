"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface VisitChartProps {
  data: { cliente: string; visitas: number }[];
}

const COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#f43f5e"];

export default function VisitChart({ data }: VisitChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
                fontSize: "12px",
              }}
              formatter={(value) => [`${value} visitas`, "Visitas"]}
            />
            <Bar dataKey="visitas" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}