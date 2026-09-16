import type { DashboardStats, SalesPorPessoa, TeamMember } from "./dashboard";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatDateLabel(value: unknown, fallback = "Sem registro"): string {
  const text = asOptionalString(value);
  if (!text) return fallback;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
  }).format(date);
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeTeamMembers(value: unknown): TeamMember[] {
  return asArray<Record<string, unknown>>(value).map((member) => {
    const name = asString(member.name, asString(member.userName, "Sem nome"));
    const notDone = asNumber(
      member.notDone,
      asNumber(member.tarefasAbertas) + asNumber(member.tarefasEmAndamento),
    );
    const done = asNumber(member.done);
    const inProgress = asNumber(
      member.inProgress,
      asNumber(member.tarefasEmAndamento),
    );
    const ready = asNumber(member.ready, Math.max(0, notDone - inProgress));
    const review = asNumber(member.review);
    const timeEstimate =
      typeof member.timeEstimate === "object" && member.timeEstimate !== null
        ? (member.timeEstimate as { notDone?: unknown; done?: unknown })
        : {};

    return {
      name,
      initials: asString(member.initials, initialsFor(name)),
      notDone,
      done,
      timeEstimate: {
        notDone: asString(timeEstimate.notDone, "0h"),
        done: asString(timeEstimate.done, "0h"),
      },
      remaining: asString(member.remaining, "0h"),
      ready,
      inProgress,
      review,
    };
  });
}

/**
 * Normaliza uma resposta bruta de /dashboard/stats em DashboardStats.
 * Aceita o payload direto ou aninhado em { data } (mesma tolerância do
 * service de auth). Campos ausentes viram arrays/listas default em vez
 * de derrubar a tela — o backend ainda não está entregando esse endpoint.
 */
export function normalizeDashboardStats(raw: unknown): DashboardStats {
  const source =
    typeof raw === "object" &&
    raw !== null &&
    "data" in raw &&
    (raw as { data: unknown }).data !== null &&
    typeof (raw as { data: unknown }).data === "object"
      ? ((raw as { data: unknown }).data as Record<string, unknown>)
      : ((raw ?? {}) as Record<string, unknown>);

  const num = (v: unknown, fallback = 0): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;

  return {
    teamMembers: normalizeTeamMembers(source.teamMembers),
    frequencyData: asArray<Record<string, unknown>>(source.frequencyData).map(
      (item, index) => ({
        id: asString(item.id, `${asString(item.cliente, "cliente")}-${index}`),
        cliente: asString(item.cliente, "Cliente sem nome"),
        visitas: num(item.visitas),
        pedidos: num(item.pedidos),
        ultimaVisita: formatDateLabel(item.ultimaVisita),
        ultimoPedido: formatDateLabel(item.ultimoPedido),
        ultimoContato: formatDateLabel(item.ultimoContato),
      }),
    ),
    visitData: asArray<Record<string, unknown>>(source.visitData).map(
      (item) => ({
        cliente: asString(item.cliente, "Cliente sem nome"),
        visitas: num(item.visitas),
      }),
    ),
    clientActivity: asArray<Record<string, unknown>>(source.clientActivity).map(
      (item, index) => ({
        id: asString(item.id, `${asString(item.cliente, "cliente")}-${index}`),
        cliente: asString(item.cliente, "Cliente sem nome"),
        ultimaVisita: formatDateLabel(item.ultimaVisita),
        responsavel: asString(item.responsavel, "Sem responsável"),
        responsavelInitials: asString(
          item.responsavelInitials,
          initialsFor(asString(item.responsavel, "Sem responsável")),
        ),
        ultimaCompra: formatDateLabel(item.ultimaCompra),
        ultimoWhatsApp: formatDateLabel(item.ultimoWhatsApp),
        visitasMes: num(item.visitasMes),
      }),
    ),
    salesGeral: {
      totalClientes: num(source.totalClientes),
      clientesAtivos: num(source.clientesAtivos),
      taxaConversao: num(source.taxaConversao),
      receitaTotal: num(source.receitaTotal),
      ticketMedio: num(source.ticketMedio),
      vendasMes: num(source.vendasMes),
      metaValor: num(source.metaValor),
      metaVolume: num(source.metaVolume),
      visitas: num(source.visitas),
      clientesRetornando: num(source.clientesRetornando),
    },
    salesPorPessoa: asArray<SalesPorPessoa>(source.salesPorPessoa),
    totalTasks: num(source.totalTasks),
  };
}
