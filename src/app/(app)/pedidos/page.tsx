"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  CaretLeft,
  CaretRight,
  ChartBar,
  CurrencyCircleDollar,
  DotsThree,
  Eye,
  Faders,
  MagnifyingGlass,
  Package,
  Plus,
  ShoppingCart,
  SpinnerGap,
  PencilSimple,
  Warning,
  X,
} from "@phosphor-icons/react";
import { fetchClients, type Cliente } from "@/services/clients";
import {
  createOrder,
  fetchOrders,
  fetchOrderStats,
  type Order,
  type OrderPhase,
  type OrderStats,
} from "@/services/orders";
import { createTask } from "@/services/tasks";
import { loadOrderSettings } from "@/services/orderSettings";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dateOnly = (value: string | null) => (value ? value.slice(0, 10) : "");

function clientName(client: Cliente) {
  return `${client.firstName} ${client.lastName}`.trim();
}

function addressFor(client: Cliente | null) {
  if (!client) return "";
  return [client.endereco, client.cidade, client.uf].filter(Boolean).join(", ");
}

const PHASE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: { label: "Rascunho", className: "bg-slate-100 text-slate-600" },
  ABERTO: { label: "Em preparo", className: "bg-amber-100 text-amber-700" },
  PENDING: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
  APROVADO: { label: "Confirmado", className: "bg-emerald-100 text-emerald-700" },
  FATURADO: { label: "Em transporte", className: "bg-sky-100 text-sky-700" },
  ENTREGUE: { label: "Entregue", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

function phaseBadge(phase: string) {
  return PHASE_CONFIG[phase] ?? {
    label: phase || "Sem fase",
    className: "bg-slate-100 text-slate-600",
  };
}

function NewOrderModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: Cliente[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const settings = loadOrderSettings();
  const [clientId, setClientId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(settings.defaultUnitPrice);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedClient =
    clients.find((client) => client.id === clientId) ?? null;
  const total = Math.max(0, quantity * unitPrice);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedClient || quantity <= 0 || unitPrice < 0 || saving) return;
    setSaving(true);
    setError("");
    try {
      const order = await createOrder({
        clientId: selectedClient.id,
        companyId: selectedClient.empresaId,
        projectId: settings.projectId || null,
        deliveryDate: deliveryDate ? `${deliveryDate}T12:00:00.000Z` : null,
        deliveryInstructions: address,
        shippingAddress: {
          endereco: address,
          cidade: selectedClient.cidade,
          uf: selectedClient.uf,
          pais: selectedClient.pais,
        },
        notes,
        items: [
          {
            productName: settings.defaultProductName || "Larvas",
            unit: settings.defaultUnit || "MILHEIRO",
            quantity,
            unitPrice,
            notes: notes || null,
          },
        ],
      });

      if (settings.projectId && settings.columnId) {
        await createTask({
          projetoId: settings.projectId,
          columnId: settings.columnId,
          titulo:
            `Pedido ${order.orderNumber ?? ""} · ${clientName(selectedClient)}`.trim(),
          descricao: `Quantidade: ${quantity} ${settings.defaultUnit || "MILHEIRO"}\nEntrega: ${deliveryDate || "sem data"}\nEndereço: ${address || "sem endereço"}\n${notes ? `Observação: ${notes}` : ""}`,
          status: "BACKLOG",
          prioridade: "MEDIA",
          progresso: 0,
          tags: ["pedido"],
          prazo: deliveryDate || null,
          clienteId: selectedClient.id,
          tipo: "PEDIDO",
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderTotal: order.totalAmount,
        });
      }
      onCreated();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível criar o pedido.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Novo pedido</h2>
            <p className="text-sm text-slate-500">
              Selecione cliente, quantidade de larvas e entrega.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">
              Cliente
            </span>
            <select
              value={clientId}
              onChange={(e) => {
                const nextClientId = e.target.value;
                setClientId(nextClientId);
                setAddress(addressFor(clients.find((client) => client.id === nextClientId) ?? null));
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {clientName(client)}
                </option>
              ))}
            </select>
          </label>

          {selectedClient && (
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <strong className="text-slate-900">
                Dados preenchidos do cadastro
              </strong>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <span>
                  {selectedClient.cpfCnpj || "CPF/CNPJ não informado"}
                </span>
                <span>{selectedClient.phone || "Telefone não informado"}</span>
                <span>{selectedClient.cidade || "Cidade não informada"}</span>
              </div>
            </div>
          )}

          <label>
            <span className="text-xs font-semibold text-slate-600">
              Quantidade de larvas
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-slate-600">
              Valor unitário
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-slate-600">
              Data de entrega
            </span>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-slate-600">Total</span>
            <input
              value={money(total)}
              disabled
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">
              Endereço de entrega
            </span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-semibold text-slate-600">
              Observação
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>
          <button
            disabled={saving || !clientId || quantity <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? (
              <SpinnerGap className="animate-spin" size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            Criar pedido
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<OrderPhase | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return null;
      setLoading(true);
      setError(false);
      return Promise.all([
      fetchOrders({ search, phase: phase || undefined, page, limit: 10 }),
      fetchOrderStats().catch(() => null),
      fetchClients({ pageSize: 300 }).catch(() => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 300,
      })),
    ]);
    })
      .then((result) => {
        if (!result) return;
        const [ordersResult, statsResult, clientsResult] = result;
        if (cancelled) return;
        setOrders(ordersResult.items);
        setTotalPages(ordersResult.totalPages);
        setStats(statsResult);
        setClients(clientsResult.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, phase, page, refresh]);

  const today = new Date().toISOString().slice(0, 10);
  const todayDeliveries = orders.filter((order) => dateOnly(order.deliveryDate) === today);

  const summary = useMemo(
    () => [
       {
        label: "Pedidos",
        value: stats?.totalPedidos ?? orders.length,
        icon: ShoppingCart,
      },
      {
        label: "Receita",
        value: money(
          stats?.totalRevenue ??
            orders.reduce((sum, order) => sum + order.totalAmount, 0),
        ),
         icon: CurrencyCircleDollar,
      },
      {
        label: "Ticket médio",
        value: money(stats?.averageTicket ?? 0),
         icon: ChartBar,
      },
      { label: "Cancelados", value: stats?.totalCancelled ?? 0, icon: Warning },
    ],
    [stats, orders],
  );

  return (
    <main className="orders-surface min-h-full bg-[#f5f7fa] p-4 sm:p-6 xl:p-7">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#172033]">
              Pedidos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie pedidos, entrega, cliente, valor e vínculo com o quadro.
            </p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2">
             <label className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:flex">
               <CalendarBlank size={15} />
               <span>01/04/2024 – 30/04/2024</span>
             </label>
             <button onClick={() => setPhase(phase ? "" : "APROVADO")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
               <Faders size={15} /> Filtros
             </button>
             <Link
              href="/kanban"
              title="Abrir o quadro para ver cards e configurar colunas"
               className="hidden"
            >
              <Package size={17} weight="bold" /> Configurar Quadro
            </Link>
             <button
            onClick={() => setModalOpen(true)}
             className="inline-flex items-center gap-2 rounded-lg bg-[#073B82] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0B4FA3]"
          >
            <Plus size={17} weight="bold" /> Novo pedido
          </button>
          </div></div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {summary.map((item) => {
            const Icon = item.icon;
            return (
               <div
                key={item.label}
                 className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                   <span className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </span>
                   <Icon size={18} className="text-[#0B4FA3]" />
                </div>
                 <strong className="ml-auto block text-lg font-bold text-slate-950">
                  {item.value}
                </strong>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido ou cliente..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <button
              onClick={() => setRefresh((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowClockwise size={16} /> Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <SpinnerGap className="animate-spin" /> Carregando pedidos...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-red-600">
              Não foi possível carregar pedidos.
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                   <tr>
                     <th className="px-4 py-3 text-left">#</th>
                     <th className="px-4 py-3 text-left">Cliente</th>
                     <th className="px-4 py-3 text-left">Quantidade</th>
                     <th className="px-4 py-3 text-left">Entrega</th>
                     <th className="px-4 py-3 text-left">Status</th>
                     <th className="px-4 py-3 text-left">Responsável</th>
                     <th className="px-4 py-3 text-right">Valor</th>
                     <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                       <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                        {order.orderNumber ?? "Sem número"}
                      </td>
                       <td className="px-4 py-3 font-medium text-slate-800">
                        {order.clientName ?? "Cliente"}
                      </td>
                       <td className="px-4 py-3 text-slate-600">
                         {order.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("pt-BR")} {order.items[0]?.unit?.toLowerCase() || "un."}
                       </td>
                       <td className="px-4 py-3 text-slate-600">
                        {dateOnly(order.deliveryDate) || "Sem data"}
                      </td>
                       <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${phaseBadge(order.phase).className}`}
                        >
                          {phaseBadge(order.phase).label}
                        </span>
                      </td>
                       <td className="px-4 py-3 text-slate-600">
                         {order.salesRepName || "—"}
                       </td>
                       <td className="px-4 py-3 text-right font-semibold text-slate-900">
                         {money(order.totalAmount)}
                       </td>
                       <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button aria-label="Visualizar pedido" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Eye size={15} /></button><button aria-label="Editar pedido" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><PencilSimple size={15} /></button><button aria-label="Mais ações" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><DotsThree size={16} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
           {!loading && !error && orders.length > 0 && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><span>Mostrando pedidos desta página</span><div className="flex items-center gap-1"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border border-slate-200 p-1 disabled:opacity-40"><CaretLeft size={14} /></button><span className="rounded bg-[#073B82] px-2 py-1 font-semibold text-white">{page}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-slate-200 p-1 disabled:opacity-40"><CaretRight size={14} /></button></div></div>}
         </section>
        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-bold text-slate-900">Resumo do período</h2><div className="mt-3 space-y-1">{summary.map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"><Icon size={18} className="text-[#0B4FA3]" /><span className="text-xs text-slate-500">{item.label}</span><strong className="ml-auto text-sm text-slate-900">{item.value}</strong></div>; })}</div></section>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-900">Entregas de hoje</h2><span className="text-sm font-bold text-slate-700">{todayDeliveries.length}</span></div><div className="mt-3 divide-y divide-slate-100">{todayDeliveries.length ? todayDeliveries.slice(0, 4).map((order) => <div key={order.id} className="py-3"><p className="text-xs font-semibold text-slate-800">{order.clientName || "Cliente"}</p><p className="mt-1 text-[11px] text-slate-500">{order.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("pt-BR")} larvas <span className="float-right text-emerald-600">● {phaseBadge(order.phase).label}</span></p></div>) : <p className="py-5 text-xs text-slate-500">Nenhuma entrega programada para hoje.</p>}</div><button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#073B82]">Ver todas as entregas <ArrowRight size={14} /></button></section>
        </aside></div>
      </div>
      {modalOpen && (
        <NewOrderModal
          clients={clients}
          onClose={() => setModalOpen(false)}
          onCreated={() => setRefresh((value) => value + 1)}
        />
      )}
    </main>
  );
}
