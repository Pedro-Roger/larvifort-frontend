"use client";

import { ChatCircleDots, ShoppingCart, CalendarCheck, User } from "@phosphor-icons/react";

interface ClientActivity {
  id: string;
  cliente: string;
  ultimaVisita: string;
  responsavel: string;
  responsavelInitials: string;
  ultimaCompra: string;
  ultimoWhatsApp: string;
  visitasMes: number;
}

interface ClientActivityTableProps {
  data: ClientActivity[];
}

function TimeAgo({ date }: { date: string }) {
  const [day, month, year] = date.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  let color = "text-slate-500";
  if (diffDays <= 1) color = "text-emerald-600";
  else if (diffDays <= 7) color = "text-sky-600";
  else if (diffDays <= 30) color = "text-amber-600";
  else color = "text-red-500";

  return <span className={`text-xs font-medium ${color}`}>{date}</span>;
}

export default function ClientActivityTable({ data }: ClientActivityTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Cliente</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-center gap-1">
                  <CalendarCheck size={12} />
                  Última Visita
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-center gap-1">
                  <User size={12} />
                  Responsável
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart size={12} />
                  Última Compra
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-center gap-1">
                  <ChatCircleDots size={12} />
                  Último WhatsApp
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Visitas/Mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{c.cliente}</td>
                <td className="px-4 py-3 text-center">
                  <TimeAgo date={c.ultimaVisita} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-[9px] font-bold text-sky-600">
                      {c.responsavelInitials}
                    </div>
                    <span className="text-xs text-slate-600">{c.responsavel}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <TimeAgo date={c.ultimaCompra} />
                </td>
                <td className="px-4 py-3 text-center">
                  <TimeAgo date={c.ultimoWhatsApp} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center h-6 min-w-[24px] rounded-full px-2 text-xs font-bold ${
                    c.visitasMes >= 6
                      ? "bg-emerald-100 text-emerald-700"
                      : c.visitasMes >= 3
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {c.visitasMes}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}