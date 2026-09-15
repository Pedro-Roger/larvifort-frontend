"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Plus,
  Clock,
  MapPin,
  User,
  X,
  Handshake,
  MagnifyingGlass,
  Trash,
  CheckCircle,
  MapPin as MapPinIcon,
} from "@phosphor-icons/react";
import NovoCompromissoModal from "@/components/agenda/NovoCompromissoModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  fetchAppointments,
  deleteAppointment,
  checkinAppointment,
  type Appointment,
  type TipoCompromisso,
  tipoCompromissoLabel,
  tipoCompromissoColor,
  formatAppointmentTime,
  formatAppointmentDate,
} from "@/services/appointments";
import { fetchClients } from "@/services/clients";
import { fetchEmpresas } from "@/services/companies";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AgendaPage() {
  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoCompromisso | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [checkinLoading, setCheckinLoading] = useState<string | null>(null);

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);

  // Load clients and companies for modal dropdowns
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [clientsRes, companiesRes] = await Promise.all([
          fetchClients({ pageSize: 200 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200 })),
          fetchEmpresas({ pageSize: 200 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200 })),
        ]);
        if (cancelled) return;
        setClientes(
          clientsRes.items.map((c) => ({
            id: c.id,
            nome: `${c.firstName} ${c.lastName}`.trim(),
          }))
        );
        setEmpresas(
          companiesRes.items.map((e) => ({
            id: e.id,
            nome: e.name,
          }))
        );
      } catch {
        // Dropdowns will be empty; user can still create appointments without client/company
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load appointments for current month range
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(false);
      try {
        const firstDay = new Date(anoAtual, mesAtual, 1);
        const lastDay = new Date(anoAtual, mesAtual + 1, 0);
        const startDate = firstDay.toISOString().split("T")[0];
        const endDate = lastDay.toISOString().split("T")[0];

        const appointments = await fetchAppointments({ startDate, endDate });
        if (cancelled) return;
        setAllAppointments(appointments);
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
  }, [mesAtual, anoAtual, tryCount]);

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtualReal = hoje.getMonth();
  const anoAtualReal = hoje.getFullYear();

  function anterior() {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(anoAtual - 1); }
    else setMesAtual(mesAtual - 1);
  }

  function proximo() {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(anoAtual + 1); }
    else setMesAtual(mesAtual + 1);
  }

  const startLoad = () => setTryCount((c) => c + 1);

  // Check-in handler with geolocation
  const handleCheckin = async (appointmentId: string) => {
    setCheckinLoading(appointmentId);
    try {
      // Request geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude, accuracy } = position.coords;

      // Call check-in API
      const updated = await checkinAppointment(appointmentId, {
        latitude,
        longitude,
        accuracy,
      });

      // Update local state
      setAllAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? updated : a))
      );
    } catch (err) {
      if (err instanceof Error) {
        alert("Erro ao fazer check-in: " + err.message);
      } else if (err && typeof err === "object" && "code" in err) {
        const geolocationError = err as GeolocationPositionError;
        const messages: Record<number, string> = {
          1: "Permissão de localização negada. Habilite a localização no navegador.",
          2: "Localização indisponível. Tente novamente.",
          3: "Tempo esgotado ao obter localização.",
        };
        alert(messages[geolocationError.code] || "Erro ao obter localização.");
      } else {
        alert("Erro desconhecido ao fazer check-in.");
      }
    } finally {
      setCheckinLoading(null);
    }
  };

  const compromissosPorDia = useMemo(() => {
    const map: Record<number, Appointment[]> = {};
    for (const apt of allAppointments) {
      const date = new Date(apt.data + "T00:00:00");
      if (date.getMonth() === mesAtual && date.getFullYear() === anoAtual) {
        const dia = date.getDate();
        if (!map[dia]) map[dia] = [];
        map[dia].push(apt);
      }
    }
    return map;
  }, [allAppointments, mesAtual, anoAtual]);

  const compromissosFiltrados = useCallback((dia: number) => {
    const lista = compromissosPorDia[dia] || [];
    const termo = busca.trim().toLowerCase();
    return lista.filter((c) => {
      const matchTipo = filtroTipo === "todos" || c.tipo === filtroTipo;
      const matchBusca = !termo ||
        c.titulo.toLowerCase().includes(termo) ||
        (c.clienteNome && c.clienteNome.toLowerCase().includes(termo)) ||
        (c.empresaNome && c.empresaNome.toLowerCase().includes(termo)) ||
        (c.endereco && c.endereco.toLowerCase().includes(termo)) ||
        (c.observacoes && c.observacoes.toLowerCase().includes(termo));
      return matchTipo && matchBusca;
    });
  }, [compromissosPorDia, filtroTipo, busca]);

  const compromissosDoDia = diaSelecionado ? compromissosFiltrados(diaSelecionado) : [];
  const totalMes = Object.values(compromissosPorDia).flat().filter((c) =>
    filtroTipo === "todos" || c.tipo === filtroTipo
  ).length;

  if (loading) {
    return (
      <>
        <header className="px-8 py-5 flex flex-col gap-4 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Agenda
            </h1>
            <div className="h-5 w-32 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <div className="flex gap-6">
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-slate-100" />
              <div className="grid grid-cols-7 p-4 space-y-4">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-24 border border-slate-100 bg-slate-50/30 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="h-5 w-24 bg-slate-200 rounded" />
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="px-8 py-5 bg-white/60 backdrop-blur-xl border-b border-slate-200 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Agenda</h1>
        </header>
        <main className="flex-1 overflow-auto p-8 flex items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
            <X size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-red-700 mb-1">
              Não foi possível carregar a agenda
            </h3>
            <p className="text-xs text-red-600 mb-4">
              Verifique sua conexão ou tente novamente.
            </p>
            <button
              type="button"
              onClick={startLoad}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
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
              Agenda
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-200">
              {totalMes} compromissos este mês
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Plus size={14} />
            Novo Compromisso
          </button>
        </div>

        {/* Filtros de tipo + busca */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFiltroTipo("todos")}
              className={`h-7 px-3 rounded-full text-xs font-semibold transition-all ${
                filtroTipo === "todos"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("REUNIAO")}
              className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filtroTipo === "REUNIAO"
                  ? "bg-violet-100 text-violet-700 border border-violet-300"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <Handshake size={12} />
              Reuniões
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("VISITA")}
              className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filtroTipo === "VISITA"
                  ? "bg-sky-100 text-sky-700 border border-sky-300"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <MapPin size={12} />
              Visitas
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-8 w-full text-xs pl-8 pr-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder:text-slate-400"
              placeholder="Buscar compromisso..."
              type="text"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Month Navigation */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={anterior}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <CaretLeft size={16} />
              </button>
              <h2 className="text-base font-bold text-slate-800">{meses[mesAtual]} {anoAtual}</h2>
              <button
                onClick={proximo}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <CaretRight size={16} />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {diasSemana.map((d) => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: primeiroDia }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/30" />
              ))}
              {Array.from({ length: diasNoMes }).map((_, i) => {
                const dia = i + 1;
                const lista = compromissosFiltrados(dia);
                const isToday = dia === diaAtual && mesAtual === mesAtualReal && anoAtual === anoAtualReal;
                const isSelected = dia === diaSelecionado;

                return (
                  <div
                    key={dia}
                    onClick={() => setDiaSelecionado(dia)}
                    className={`h-24 border-b border-r border-slate-100 p-1.5 cursor-pointer transition-all hover:bg-sky-50/50 ${
                      isSelected ? "bg-sky-50 ring-2 ring-inset ring-sky-400" : isToday ? "bg-sky-50/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? "bg-sky-600 text-white" : isSelected ? "text-sky-700" : "text-slate-600"
                      }`}>
                        {dia}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {lista.slice(0, 3).map((c) => {
                        const color = tipoCompromissoColor(c.tipo);
                        return (
                          <div key={c.id} className="flex items-center gap-1" title={c.titulo}>
                            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${color.text}`} />
                            <span className="text-[9px] text-slate-500 truncate leading-none">{c.titulo.slice(0, 15)}</span>
                          </div>
                        );
                      })}
                      {lista.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-medium">+{lista.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Detalhes do Dia */}
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  {diaSelecionado ? `${diaSelecionado} de ${meses[mesAtual]} de ${anoAtual}` : "Selecione um dia"}
                </h3>
                {diaSelecionado && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {compromissosDoDia.length}{" "}
                    {compromissosDoDia.length === 1 ? "compromisso" : "compromissos"}
                  </p>
                )}
              </div>

              <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {!diaSelecionado && (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Clique em um dia para ver os compromissos
                  </p>
                )}
                {diaSelecionado && compromissosDoDia.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 mb-3">Nenhum compromisso neste dia</p>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="text-xs text-sky-600 font-semibold hover:underline cursor-pointer"
                    >
                      + Agendar compromisso
                    </button>
                  </div>
                )}
                {compromissosDoDia.map((c) => {
                  const color = tipoCompromissoColor(c.tipo);
                  const Icon = c.tipo === "REUNIAO" ? Handshake : MapPin;
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-sky-200 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center shrink-0 ${color.border}`}>
                          <Icon size={14} className={color.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800 truncate">{c.titulo}</p>
                            <div className="flex items-center gap-1">
                              {!c.checkinAt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckin(c.id);
                                  }}
                                  disabled={checkinLoading === c.id}
                                  className="p-1.5 rounded text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer"
                                  title="Fazer check-in (captura localização)"
                                >
                                  {checkinLoading === c.id ? (
                                    <CheckCircle size={14} className="animate-spin" />
                                  ) : (
                                    <MapPinIcon size={14} />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(c);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Excluir compromisso"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </div>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            c.tipo === "REUNIAO" ? "bg-violet-100 text-violet-600" : "bg-sky-100 text-sky-600"
                          }`}>
                            {tipoCompromissoLabel(c.tipo)}
                          </span>
                          {c.checkinAt && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                              Check-in: {formatAppointmentDate(c.checkinAt)} {c.checkinAt.split("T")[1]?.slice(0, 5)}
                            </span>
                          )}
                          {(c.clienteNome || c.empresaNome) && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <User size={11} className="text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-500 truncate">
                                {c.clienteNome || c.empresaNome}
                              </span>
                            </div>
                          )}
                          {c.horario && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock size={11} className="text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-500">{formatAppointmentTime(c.horario)}</span>
                            </div>
                          )}
                          {c.tipo === "VISITA" && c.endereco && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-500 truncate">{c.endereco}</span>
                            </div>
                          )}
                          {c.observacoes && (
                            <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2">{c.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <NovoCompromissoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={diaSelecionado
          ? `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(diaSelecionado).padStart(2, "0")}`
          : undefined}
        clientes={clientes}
        empresas={empresas}
        onSuccess={(newAppointment) => {
          setAllAppointments((prev) => [newAppointment, ...prev]);
        }}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          open={true}
          title="Excluir Compromisso"
          message={`Tem certeza que deseja cancelar o compromisso "${deleteTarget.titulo}"? Esta ação não pode ser desfeita.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            const target = deleteTarget;
            if (!target) return;
            await deleteAppointment(target.id);
            setAllAppointments((prev) => prev.filter((a) => a.id !== target.id));
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}