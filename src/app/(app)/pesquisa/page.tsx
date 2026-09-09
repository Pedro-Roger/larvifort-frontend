"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  MagnifyingGlass,
  Eye,
  Trash,
  CheckCircle,
  XCircle,
  X,
  CaretRight,
  Warning,
} from "@phosphor-icons/react";
import NovaPesquisaModal from "@/components/pesquisa/NovaPesquisaModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  fetchSearches,
  deleteSearch,
  type FieldSearch,
  uniformidadeLabel,
  uniformidadeClass,
  formatDateBR,
  survivalColor,
} from "@/services/searches";

export default function PesquisaPage() {
  const [allSearches, setAllSearches] = useState<FieldSearch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "larvifort" | "nao_larvifort">("todas");
  const [pesquisaDetalhe, setPesquisaDetalhe] = useState<FieldSearch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; cliente: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  const [clientes] = useState<{ id: string; nome: string }[]>([
    { id: "1", nome: "Distribuidora Central" },
    { id: "2", nome: "Restaurante Sabor" },
    { id: "3", nome: "Fazenda São João" },
    { id: "4", nome: "Padaria Pão Quente" },
    { id: "5", nome: "Hotel Vista Mar" },
    { id: "6", nome: "Indústria Alfa" },
    { id: "7", nome: "Supermercado Bom Preço" },
    { id: "8", nome: "Clínica Saúde+" },
  ]);
  const [responsaveis] = useState<{ id: string; nome: string }[]>([
    { id: "1", nome: "Fernando Lima" },
    { id: "2", nome: "Ana Souza" },
    { id: "3", nome: "Marcos Oliveira" },
    { id: "4", nome: "Juliana Costa" },
    { id: "5", nome: "Pedro Almeida" },
    { id: "6", nome: "Luciana Rocha" },
  ]);

  const startLoad = () => setTryCount((c) => c + 1);

  // Load searches
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(false);
      try {
        const searches = await fetchSearches();
        if (cancelled) return;
        setAllSearches(searches);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [tryCount]);

  const filtered = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return allSearches.filter((p) => {
      const matchBusca = !termo ||
        p.clienteNome.toLowerCase().includes(termo) ||
        (p.responsavelNome && p.responsavelNome.toLowerCase().includes(termo));
      if (filtro === "larvifort") return matchBusca && p.larvas.includes("Larvifort");
      if (filtro === "nao_larvifort") return matchBusca && !p.larvas.includes("Larvifort");
      return matchBusca;
    });
  }, [allSearches, busca, filtro]);

  const totalLarvifort = allSearches.filter((p) => p.larvas.includes("Larvifort")).length;
  const totalNaoLarvifort = allSearches.filter((p) => !p.larvas.includes("Larvifort")).length;

  const handleSave = async (newSearch: FieldSearch) => {
    setAllSearches((prev) => [newSearch, ...prev]);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSearch(id);
      setAllSearches((prev) => prev.filter((p) => p.id !== id));
    } catch {
      startLoad();
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await handleDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <>
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pesquisa de Campo</h1>
            <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded-full animate-pulse" />
        </header>
        <div className="px-6 py-6 space-y-5">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="relative flex-1 max-w-sm">
              <div className="w-full rounded-full border border-slate-200 bg-white h-8" />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-0.5">
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Cliente</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Data</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Responsável</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Larvas</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Larvifort?</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Sobrev. Berçário</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Sobrev. Cultivo</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Uniformidade</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-3 w-20 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-3 w-24 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-24 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-5 bg-slate-200 rounded-full mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-28 bg-slate-200 rounded mx-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-16 bg-slate-200 rounded mx-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pesquisa de Campo</h1>
        </header>
        <div className="px-6 py-6 flex items-center justify-center min-h-[300px]">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
            <Warning size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-red-700 mb-1">
              Não foi possível carregar as pesquisas
            </h3>
            <p className="text-xs text-red-600 mb-4">
              Verifique sua conexão ou tente novamente.
            </p>
            <button
              type="button"
              onClick={startLoad}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              <CaretRight size={14} />
              Tentar novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pesquisa de Campo</h1>
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            {allSearches.length} pesquisas
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 transition-colors cursor-pointer"
        >
          <Plus size={16} weight="bold" />
          Nova Pesquisa
        </button>
      </header>

      <div className="px-6 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente ou responsável..."
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setFiltro("todas")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filtro === "todas" ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Todas ({allSearches.length})
            </button>
            <button
              onClick={() => setFiltro("larvifort")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filtro === "larvifort" ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Larvifort ({totalLarvifort})
            </button>
            <button
              onClick={() => setFiltro("nao_larvifort")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filtro === "nao_larvifort" ? "bg-red-100 text-red-700" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Outras ({totalNaoLarvifort})
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Cliente</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Data</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Responsável</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Larvas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Larvifort?</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Sobrev. Berçário</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Sobrev. Cultivo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Uniformidade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isLarvifort = p.larvas.includes("Larvifort");

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.clienteNome}</td>
                      <td className="px-4 py-3 text-center text-slate-600 text-xs">{formatDateBR(p.dataPesquisa)}</td>
                      <td className="px-4 py-3 text-center text-slate-600 text-xs">{p.responsavelNome || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {p.larvas.map((l) => (
                            <span
                              key={l}
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                l === "Larvifort"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLarvifort ? (
                          <CheckCircle size={18} weight="fill" className="text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle size={18} weight="fill" className="text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${survivalColor(p.sobrevBercario, "bercario")}`}>
                          {p.sobrevBercario !== null ? `${p.sobrevBercario}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${survivalColor(p.sobrevCultivo, "cultivo")}`}>
                          {p.sobrevCultivo !== null ? `${p.sobrevCultivo}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${uniformidadeClass(p.uniformidadeBercario)}`}>
                            B: {uniformidadeLabel(p.uniformidadeBercario)}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${uniformidadeClass(p.uniformidadeCultivo)}`}>
                            C: {uniformidadeLabel(p.uniformidadeCultivo)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPesquisaDetalhe(p)}
                            className="rounded p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Ver detalhes"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: p.id, cliente: p.clienteNome })}
                            className="rounded p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              Nenhuma pesquisa encontrada.
            </div>
          )}
        </div>
      </div>

      <NovaPesquisaModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSave}
        clientes={clientes}
        responsaveis={responsaveis}
      />

      {pesquisaDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPesquisaDetalhe(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800">{pesquisaDetalhe.clienteNome}</h2>
              <button onClick={() => setPesquisaDetalhe(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500">Data</span>
                  <p className="font-medium text-slate-800">{formatDateBR(pesquisaDetalhe.dataPesquisa)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Responsável</span>
                  <p className="font-medium text-slate-800">{pesquisaDetalhe.responsavelNome || "—"}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Larvas em uso</span>
                <div className="flex gap-1 mt-1">
                  {pesquisaDetalhe.larvas.map((l) => (
                    <span key={l} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      l === "Larvifort" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {pesquisaDetalhe.maioriaLarvifort && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Maioria Larvifort</span>
                  <p className="font-medium text-slate-800 mt-1">Sim</p>
                </div>
              )}

              {pesquisaDetalhe.parouLarvifort && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Motivos da saída</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pesquisaDetalhe.motivosSaida.map((m) => (
                      <span key={m} className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                  {pesquisaDetalhe.outroMotivo && (
                    <p className="text-xs text-slate-500 mt-1">Outro: {pesquisaDetalhe.outroMotivo}</p>
                  )}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Avaliação</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-500">Berçário</p>
                    <p className="font-bold text-slate-800">
                      Sobrev: {pesquisaDetalhe.sobrevBercario !== null ? `${pesquisaDetalhe.sobrevBercario}%` : "—"} · Uniform: {uniformidadeLabel(pesquisaDetalhe.uniformidadeBercario)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[10px] text-slate-500">Cultivo</p>
                    <p className="font-bold text-slate-800">
                      Sobrev: {pesquisaDetalhe.sobrevCultivo !== null ? `${pesquisaDetalhe.sobrevCultivo}%` : "—"} · Uniform: {uniformidadeLabel(pesquisaDetalhe.uniformidadeCultivo)}
                    </p>
                  </div>
                </div>
              </div>

              {pesquisaDetalhe.resultadosUltimoCiclo && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Resultados do último ciclo</span>
                  <p className="mt-1 text-slate-700">{pesquisaDetalhe.resultadosUltimoCiclo}</p>
                </div>
              )}

              {pesquisaDetalhe.observacoes && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Observações</span>
                  <p className="mt-1 text-slate-700">{pesquisaDetalhe.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Excluir pesquisa"
          message={`Tem certeza que deseja excluir a pesquisa do cliente "${deleteTarget.cliente}"?`}
        />
      )}
    </>
  );
}