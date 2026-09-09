"use client";

import { useEffect, useState } from "react";
import {
  MagnifyingGlass,
  ArrowsDownUp,
  Funnel,
  DotsThreeVertical,
  ArrowLeft,
  ArrowRight,
  Warning,
  CaretRight,
} from "@phosphor-icons/react";
import Header from "@/components/layout/Header";
import NovoContatoModal from "@/components/clientes/NovoContatoModal";
import EditarContatoModal from "@/components/clientes/EditarContatoModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  fetchClients,
  deleteClient,
  clientInitials,
  clientAvatarBg,
  clientStatusLabel,
  STATUS_BADGE_CLASSES,
  STATUS_DOT_CLASSES,
  type Cliente,
  type ClienteStatus,
} from "@/services/clients";

function StatusBadge({ status }: { status: ClienteStatus }) {
  const colorClass = STATUS_BADGE_CLASSES[status] || "bg-slate-50 text-slate-700 border-slate-100";
  const dotClass = STATUS_DOT_CLASSES[status] || "bg-slate-400";
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${colorClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {clientStatusLabel(status)}
    </span>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
        <Warning size={32} className="text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-red-700 mb-1">
          Não foi possível carregar os clientes
        </h3>
        <p className="text-xs text-red-600 mb-4">
          Verifique sua conexão ou tente novamente mais tarde.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <CaretRight size={14} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const TAB_FILTERS: { label: string; value: ClienteStatus | "" }[] = [
  { label: "Todos os Contatos", value: "" },
  { label: "Novos", value: "NOVO" },
  { label: "Clientes Ativos", value: "CLIENTE_ATIVO" },
  { label: "Em Negociação", value: "EM_NEGOCIACAO" },
];

export default function ClientesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Data state
  const [clients, setClients] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounceValue(searchInput, 500);

  // Edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState<Cliente | null>(null);
  
  // Action menu state
  const [actionMenuClientId, setActionMenuClientId] = useState<string | null>(null);

  // Close action menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuClientId !== null) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-action-menu]")) {
          setActionMenuClientId(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuClientId]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const filterStatus = TAB_FILTERS[activeTab].value as ClienteStatus | undefined;
        const result = await fetchClients({
          page,
          pageSize,
          status: filterStatus || undefined,
          search: debouncedSearch,
        });
        
        if (cancelled) return;
        
        setClients(result.items);
        setTotal(result.total);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, activeTab, debouncedSearch, tryCount]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  const startLoad = () => {
    setTryCount((c) => c + 1);
  };

  return (
    <>
      <Header
        title="Clientes"
        count={loading ? undefined : total}
        countLabel="cadastrados"
        onAdd={() => setModalOpen(true)}
      />

      {error ? (
        <ErrorState onRetry={startLoad} />
      ) : (
        <main className="flex-1 overflow-auto p-8 flex flex-col gap-5">
          {/* Toolbar */}
          <section className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg">
              {TAB_FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => handleTabChange(i)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    activeTab === i
                      ? "font-semibold bg-white text-slate-800 shadow-xs"
                      : "font-medium text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-2 text-slate-400"
                  size={14}
                />
                <input
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-56 text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-600 focus:border-brand-600 placeholder:text-slate-400"
                  placeholder="Buscar contato..."
                  type="text"
                />
              </div>
              <div className="h-5 w-px bg-slate-200" />
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowsDownUp size={12} />
                <span>Ordenar</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <Funnel size={12} />
                <span>Filtros</span>
              </button>
            </div>
          </section>

          {/* Table */}
          <section className="bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col flex-1 overflow-hidden relative min-h-[300px]">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10 text-center">
                      <input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5" type="checkbox" />
                    </th>
                    <th className="py-3 px-4">Proprietário / Contato</th>
                    <th className="py-3 px-4 text-center">Viveiros</th>
                    <th className="py-3 px-4 text-center">Densidade</th>
                    <th className="py-3 px-4 text-center">Berçário</th>
                    <th className="py-3 px-4 text-center">Produção Média</th>
                    <th className="py-3 px-4 text-center">Alim. Auto</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center w-12">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 relative">
                  {loading && (
                    <tr className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                      <td>
                        <div className="flex justify-center items-center h-full w-full py-8">
                          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {!loading && clients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        Nenhum contato encontrado.
                      </td>
                    </tr>
                  ) : (
                    clients.map((c) => {
                      const name = `${c.firstName} ${c.lastName}`.trim();
                      const initials = clientInitials(c.firstName, c.lastName);
                      const bgClass = clientAvatarBg(name);
                      
                      return (
                        <tr
                          key={c.id || name}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5" type="checkbox" />
                          </td>
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full font-semibold flex items-center justify-center text-xs shrink-0 ${bgClass}`}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors truncate max-w-[180px]" title={name}>
                                {name || "Sem Nome"}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {c.cidade ? `${c.cidade}${c.uf ? `, ${c.uf}` : ""}` : "Local não informado"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-sky-50 px-2 text-[11px] font-bold text-sky-700">
                              {c.qtdViveiros}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-slate-600">
                            {c.densidade ? `${c.densidade} ind/m²` : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {c.temBercario ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                {c.qtdBercarios} <span className="text-slate-400">({c.volumeBercarios}m³)</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Não</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">
                            {c.producaoMedia ? `${c.producaoMedia.toLocaleString("pt-BR")} kg` : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {c.alimentadorAutomatico ? (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-600">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={c.statusLead} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="relative inline-block" data-action-menu>
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenuClientId(
                                    actionMenuClientId === c.id ? null : c.id
                                  );
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <DotsThreeVertical size={18} />
                              </button>
                              {actionMenuClientId === c.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingClient(c);
                                      setEditModalOpen(true);
                                      setActionMenuClientId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingClient(c);
                                      setDeleteModalOpen(true);
                                      setActionMenuClientId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <div>
                Exibindo <span className="font-semibold text-slate-700">{total === 0 ? 0 : (page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)}</span>{" "}
                de <span className="font-semibold text-slate-700">{total}</span> registros
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft size={11} />
                  <span>Anterior</span>
                </button>
                <div className="flex items-center gap-1">
                  <span className="w-7 h-7 flex items-center justify-center rounded-md font-semibold bg-brand-600 text-white shadow-xs">
                    {page}
                  </span>
                  <span className="px-1 text-slate-400">de {totalPages}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Próximo</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      <NovoContatoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setPage(1);
          setTryCount((c) => c + 1);
        }}
      />
      <EditarContatoModal
        open={editModalOpen}
        client={editingClient}
        onClose={() => {
          setEditModalOpen(false);
          setEditingClient(null);
        }}
        onSuccess={() => {
          setTryCount((c) => c + 1);
        }}
      />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir ${deletingClient?.firstName} ${deletingClient?.lastName}? Esta ação não pode ser desfeita.`}
        onConfirm={async () => {
          if (!deletingClient) return;
          await deleteClient(deletingClient.id);
          setTryCount((c) => c + 1);
        }}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingClient(null);
        }}
      />
    </>
  );
}
