"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Buildings,
  UsersThree,
  X,
  MagnifyingGlass,
  Trash,
  ArrowRight,
  Warning,
  CaretRight,
  CircleNotch,
} from "@phosphor-icons/react";
import Header from "@/components/layout/Header";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  fetchEmpresas,
  fetchGruposComerciais,
  createGrupoComercial,
  createEmpresa,
  deleteGrupoComercial,
  deleteEmpresa,
  empresaStatusLabel,
  EMPRESA_STATUS_CLASSES,
  pickGrupoColor,
  type Empresa,
  type EmpresaStatus,
  type GrupoComercial,
} from "@/services/companies";
import {
  fetchClients,
  updateClient,
  clientInitials,
  type Cliente,
} from "@/services/clients";

export default function EmpresasPage() {
  const [aba, setAba] = useState<"empresas" | "grupos">("grupos");

  // Data state
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [grupos, setGrupos] = useState<GrupoComercial[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  // Grupo detail
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoComercial | null>(null);
  const [modalGrupoOpen, setModalGrupoOpen] = useState(false);
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    type: "grupo" | "empresa";
    id: string;
    name: string;
  } | null>(null);

  // Form state
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [novoGrupoLoading, setNovoGrupoLoading] = useState(false);
  const [novaEmpresaForm, setNovaEmpresaForm] = useState({
    name: "",
    cnpj: "",
    city: "",
    status: "PROSPECT" as EmpresaStatus,
  });
  const [novaEmpresaLoading, setNovaEmpresaLoading] = useState(false);
  const [clienteGrupoSelecionado, setClienteGrupoSelecionado] = useState<Record<string, string>>({});
  const [clienteVinculandoId, setClienteVinculandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(false);
      try {
        const [empresasResult, gruposResult, clientesResult] = await Promise.all([
          fetchEmpresas({ pageSize: 100 }),
          fetchGruposComerciais(),
          fetchClients({ pageSize: 100 }),
        ]);
        if (cancelled) return;
        setEmpresas(empresasResult.items);
        setGrupos(gruposResult);
        setClientes(clientesResult.items);
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

  const startLoad = () => setTryCount((c) => c + 1);

  function abrirGrupo(grupo: GrupoComercial) {
    setGrupoSelecionado(grupo);
    setAba("empresas");
  }

  const empresasDoGrupo = grupoSelecionado
    ? empresas.filter((e) => e.grupoId === grupoSelecionado.id)
    : [];

  const todasEmpresas = grupoSelecionado
    ? empresasDoGrupo
    : empresas;

  const empresasFiltradas = busca
    ? todasEmpresas.filter(
        (e) =>
          e.name.toLowerCase().includes(busca.toLowerCase()) ||
          (e.grupoName || "").toLowerCase().includes(busca.toLowerCase())
      )
    : todasEmpresas;

  const clientesFiltrados = busca
    ? clientes.filter((cliente) => {
        const nome = `${cliente.firstName} ${cliente.lastName}`.toLowerCase();
        const termo = busca.toLowerCase();
        return (
          nome.includes(termo) ||
          (cliente.cpfCnpj || "").toLowerCase().includes(termo) ||
          (cliente.cidade || "").toLowerCase().includes(termo)
        );
      })
    : clientes;

  const empresasPorId = new Map(empresas.map((empresa) => [empresa.id, empresa]));

  async function vincularClienteAoGrupo(cliente: Cliente) {
    const grupoId = clienteGrupoSelecionado[cliente.id];
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return;

    const nomeCliente = `${cliente.firstName} ${cliente.lastName}`.trim() || "Cliente";
    setClienteVinculandoId(cliente.id);
    try {
      const empresa = await createEmpresa({
        name: nomeCliente,
        cnpj: null,
        city: cliente.cidade
          ? `${cliente.cidade}${cliente.uf ? `, ${cliente.uf}` : ""}`
          : null,
        status: "PROSPECT",
        grupoId,
      });
      const clienteAtualizado = await updateClient(cliente.id, {
        firstName: cliente.firstName,
        lastName: cliente.lastName,
        empresaId: empresa.id,
      });
      setEmpresas((atuais) => [...atuais, { ...empresa, grupoName: grupo.name }]);
      setClientes((atuais) =>
        atuais.map((item) =>
          item.id === cliente.id ? clienteAtualizado : item
        )
      );
      setClienteGrupoSelecionado((atual) => {
        const next = { ...atual };
        delete next[cliente.id];
        return next;
      });
    } finally {
      setClienteVinculandoId(null);
    }
  }

  async function criarGrupo() {
    if (!novoGrupoNome.trim()) return;
    setNovoGrupoLoading(true);
    try {
      await createGrupoComercial({
        name: novoGrupoNome.trim(),
        color: pickGrupoColor(novoGrupoNome.trim()),
      });
      setNovoGrupoNome("");
      setModalGrupoOpen(false);
      startLoad();
    } catch {
      // Erro silencioso — poderia ter toast
    } finally {
      setNovoGrupoLoading(false);
    }
  }

  async function confirmarExclusao() {
    if (!deletingItem) return;
    if (deletingItem.type === "grupo") {
      await deleteGrupoComercial(deletingItem.id);
    } else {
      await deleteEmpresa(deletingItem.id);
    }
    if (grupoSelecionado?.id === deletingItem.id) {
      setGrupoSelecionado(null);
      setAba("grupos");
    }
    startLoad();
  }

  async function criarEmpresa() {
    if (!novaEmpresaForm.name.trim() || !grupoSelecionado) return;
    setNovaEmpresaLoading(true);
    try {
      await createEmpresa({
        name: novaEmpresaForm.name.trim(),
        cnpj: novaEmpresaForm.cnpj.trim() || null,
        city: novaEmpresaForm.city.trim() || null,
        status: novaEmpresaForm.status,
        grupoId: grupoSelecionado.id,
      });
      setNovaEmpresaForm({ name: "", cnpj: "", city: "", status: "PROSPECT" });
      setModalEmpresaOpen(false);
      startLoad();
    } catch {
      // Erro silencioso
    } finally {
      setNovaEmpresaLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Empresas" />
        <main className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse"
              >
                <div className="h-2 bg-slate-200 rounded mb-4 -mt-5 -mx-5" />
                <div className="h-11 w-11 rounded-xl bg-slate-200 mb-4" />
                <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Empresas" />
        <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
            <Warning size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-red-700 mb-1">
              Não foi possível carregar as empresas
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
        </main>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="px-8 py-5 flex flex-col gap-4 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Buildings size={20} className="text-sky-600" />
              Empresas
            </h1>

            {/* Tabs */}
            <div className="h-9 p-1 rounded-lg bg-slate-100 flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAba("grupos");
                  setGrupoSelecionado(null);
                }}
                className={`h-7 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  aba === "grupos"
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <UsersThree size={13} />
                Grupos Comerciais
              </button>
              <button
                type="button"
                onClick={() => setAba("empresas")}
                className={`h-7 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  aba === "empresas"
                    ? "bg-white text-sky-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Buildings size={13} />
                Todas as Empresas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {aba === "grupos" ? (
              <button
                type="button"
                onClick={() => setModalGrupoOpen(true)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-sky-500/25 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Novo Grupo
              </button>
            ) : (
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={13}
                />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="h-9 w-64 text-xs pl-8 pr-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-400"
                  placeholder="Buscar empresa..."
                  type="text"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {/* ABA: Grupos Comerciais */}
        {aba === "grupos" && (
          <div>
            {grupoSelecionado ? (
              /* Detalhe do Grupo */
              <div>
                <button
                  type="button"
                  onClick={() => setGrupoSelecionado(null)}
                  className="text-xs text-slate-500 hover:text-sky-600 font-medium flex items-center gap-1 mb-4 transition-colors cursor-pointer"
                >
                  <ArrowRight size={12} className="rotate-180" />
                  Voltar para Grupos
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grupoSelecionado.color} flex items-center justify-center`}
                    >
                      <UsersThree size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {grupoSelecionado.name}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {empresasDoGrupo.length}{" "}
                        {empresasDoGrupo.length === 1 ? "empresa" : "empresas"}{" "}
                        cadastrada{empresasDoGrupo.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingItem({
                          type: "grupo",
                          id: grupoSelecionado.id,
                          name: grupoSelecionado.name,
                        });
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir grupo"
                    >
                      <Trash size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalEmpresaOpen(true)}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-sky-500/25 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      Adicionar Empresa
                    </button>
                  </div>
                </div>

                {empresasDoGrupo.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <Buildings
                      size={32}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-sm text-slate-400 mb-3">
                      Nenhuma empresa neste grupo
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalEmpresaOpen(true)}
                      className="text-xs text-sky-600 font-semibold hover:underline cursor-pointer"
                    >
                      + Cadastrar primeira empresa
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {empresasDoGrupo.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                                {emp.name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {emp.cnpj || "Sem CNPJ"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingItem({
                                type: "empresa",
                                id: emp.id,
                                name: emp.name,
                              });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            {emp.city || "Sem cidade"}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${EMPRESA_STATUS_CLASSES[emp.status]}`}
                          >
                            {empresaStatusLabel(emp.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Grid de Grupos */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {grupos.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => abrirGrupo(g)}
                    className="group cursor-pointer"
                  >
                    <div className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all overflow-hidden">
                      {/* Color Header */}
                      <div
                        className={`h-2 bg-gradient-to-r ${g.color}`}
                      />

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center shadow-sm`}
                          >
                            <UsersThree size={18} className="text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingItem({
                                type: "grupo",
                                id: g.id,
                                name: g.name,
                              });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors mb-1">
                          {g.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {empresas.filter((e) => e.grupoId === g.id).length}{" "}
                          {empresas.filter((e) => e.grupoId === g.id).length ===
                          1
                            ? "empresa"
                            : "empresas"}
                        </p>

                        {/* Mini preview empresas */}
                        {empresas.filter((e) => e.grupoId === g.id).length >
                          0 && (
                          <div className="mt-4 flex -space-x-2">
                            {empresas
                              .filter((e) => e.grupoId === g.id)
                              .slice(0, 4)
                              .map((emp) => (
                                <div
                                  key={emp.id}
                                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center border-2 border-white"
                                  title={emp.name}
                                >
                                  {emp.name.slice(0, 2).toUpperCase()}
                                </div>
                              ))}
                            {empresas.filter((e) => e.grupoId === g.id).length >
                              4 && (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-[9px] font-bold flex items-center justify-center border-2 border-white">
                                +
                                {empresas.filter((e) => e.grupoId === g.id)
                                  .length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botão Novo Grupo */}
                <button
                  type="button"
                  onClick={() => setModalGrupoOpen(true)}
                  className="bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-sky-600 min-h-[200px] cursor-pointer"
                >
                  <Plus size={24} />
                  <span className="text-xs font-semibold">
                    Criar Grupo Comercial
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABA: Todas as Empresas */}
        {aba === "empresas" && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">CNPJ</th>
                    <th className="py-3 px-4">Cidade</th>
                    <th className="py-3 px-4">Grupo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center w-12">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empresasFiltradas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-500"
                      >
                        Nenhuma empresa encontrada.
                      </td>
                    </tr>
                  ) : (
                    empresasFiltradas.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {emp.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {emp.cnpj || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {emp.city || "-"}
                        </td>
                        <td className="py-3 px-4">
                          {emp.grupoName ? (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-semibold border border-sky-200">
                              {emp.grupoName}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${EMPRESA_STATUS_CLASSES[emp.status]}`}
                          >
                            {empresaStatusLabel(emp.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingItem({
                                type: "empresa",
                                id: emp.id,
                                name: emp.name,
                              });
                              setDeleteModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
              </div>
            </div>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Clientes para adicionar ao grupo comercial
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Escolha um grupo e o sistema cria a empresa do cliente já vinculada.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {clientesFiltrados.length} cliente{clientesFiltrados.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Cidade</th>
                      <th className="py-3 px-4">Empresa / Grupo atual</th>
                      <th className="py-3 px-4">Grupo comercial</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    ) : (
                      clientesFiltrados.map((cliente) => {
                        const empresaAtual = cliente.empresaId
                          ? empresasPorId.get(cliente.empresaId)
                          : null;
                        const nomeCliente = `${cliente.firstName} ${cliente.lastName}`.trim();
                        const grupoEscolhido = clienteGrupoSelecionado[cliente.id] || "";
                        return (
                          <tr key={cliente.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center">
                                  {clientInitials(cliente.firstName, cliente.lastName)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {nomeCliente || "Sem nome"}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {cliente.cpfCnpj || cliente.phone || "Sem documento"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {cliente.cidade ? `${cliente.cidade}${cliente.uf ? `, ${cliente.uf}` : ""}` : "-"}
                            </td>
                            <td className="py-3 px-4">
                              {empresaAtual ? (
                                <div>
                                  <p className="font-medium text-slate-700">{empresaAtual.name}</p>
                                  <p className="text-[11px] text-slate-400">
                                    {empresaAtual.grupoName || "Sem grupo"}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400">Sem empresa</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={grupoEscolhido}
                                onChange={(event) =>
                                  setClienteGrupoSelecionado((atual) => ({
                                    ...atual,
                                    [cliente.id]: event.target.value,
                                  }))
                                }
                                disabled={Boolean(empresaAtual?.grupoId)}
                                className="h-8 min-w-[190px] rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-400"
                              >
                                <option value="">Escolha o grupo</option>
                                {grupos.map((grupo) => (
                                  <option key={grupo.id} value={grupo.id}>
                                    {grupo.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => vincularClienteAoGrupo(cliente)}
                                disabled={
                                  !grupoEscolhido ||
                                  Boolean(empresaAtual?.grupoId) ||
                                  clienteVinculandoId === cliente.id
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {clienteVinculandoId === cliente.id ? (
                                  <CircleNotch size={13} className="animate-spin" />
                                ) : (
                                  <Plus size={13} />
                                )}
                                {empresaAtual?.grupoId ? "Vinculado" : "Adicionar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modal: Novo Grupo */}
      {modalGrupoOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
            onClick={() => setModalGrupoOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">
                  Novo Grupo Comercial
                </h3>
                <button
                  type="button"
                  onClick={() => setModalGrupoOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  value={novoGrupoNome}
                  onChange={(e) => setNovoGrupoNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && criarGrupo()}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-slate-200 placeholder:text-slate-400"
                  placeholder="Ex: Agronegócio Nordeste"
                  type="text"
                  autoFocus
                />
              </div>
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalGrupoOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={criarGrupo}
                  disabled={novoGrupoLoading || !novoGrupoNome.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70"
                >
                  {novoGrupoLoading && (
                    <CircleNotch size={14} className="animate-spin" />
                  )}
                  {novoGrupoLoading ? "Criando..." : "Criar Grupo"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Nova Empresa no Grupo */}
      {modalEmpresaOpen && grupoSelecionado && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
            onClick={() => setModalEmpresaOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">
                  Nova Empresa — {grupoSelecionado.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalEmpresaOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    value={novaEmpresaForm.name}
                    onChange={(e) =>
                      setNovaEmpresaForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-slate-200 placeholder:text-slate-400"
                    placeholder="Razão social"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    value={novaEmpresaForm.cnpj}
                    onChange={(e) =>
                      setNovaEmpresaForm((f) => ({
                        ...f,
                        cnpj: e.target.value,
                      }))
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-slate-200 placeholder:text-slate-400"
                    placeholder="00.000.000/0000-00"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade
                    </label>
                    <input
                      value={novaEmpresaForm.city}
                      onChange={(e) =>
                        setNovaEmpresaForm((f) => ({
                          ...f,
                          city: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-slate-200 placeholder:text-slate-400"
                      placeholder="Cidade, UF"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={novaEmpresaForm.status}
                      onChange={(e) =>
                        setNovaEmpresaForm((f) => ({
                          ...f,
                          status: e.target.value as EmpresaStatus,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-sky-500 focus:border-slate-200"
                    >
                      <option value="ATIVA">Ativa</option>
                      <option value="PROSPECT">Prospect</option>
                      <option value="INATIVA">Inativa</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalEmpresaOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={criarEmpresa}
                  disabled={novaEmpresaLoading || !novaEmpresaForm.name.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70"
                >
                  {novaEmpresaLoading && (
                    <CircleNotch size={14} className="animate-spin" />
                  )}
                  {novaEmpresaLoading ? "Cadastrando..." : "Cadastrar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Confirmar Exclusão */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={`Excluir ${deletingItem?.type === "grupo" ? "Grupo" : "Empresa"}`}
        message={`Tem certeza que deseja excluir "${deletingItem?.name}"? ${deletingItem?.type === "grupo" ? "As empresas deste grupo não serão excluídas." : "Esta ação não pode ser desfeita."}`}
        onConfirm={confirmarExclusao}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingItem(null);
        }}
      />
    </>
  );
}
