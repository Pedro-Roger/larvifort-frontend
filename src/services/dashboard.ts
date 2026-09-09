import { apiGet } from "./api";

export type TeamMember = {
  name: string;
  initials: string;
  notDone: number;
  done: number;
  timeEstimate: { notDone: string; done: string };
  remaining: string;
  ready: number;
  inProgress: number;
  review: number;
};

export type VisitData = {
  cliente: string;
  visitas: number;
};

export type FrequencyDatum = {
  id: string;
  cliente: string;
  visitas: number;
  pedidos: number;
  ultimaVisita: string;
  ultimoPedido: string;
  ultimoContato: string;
};

export type ClientActivity = {
  id: string;
  cliente: string;
  ultimaVisita: string;
  responsavel: string;
  responsavelInitials: string;
  ultimaCompra: string;
  ultimoWhatsApp: string;
  visitasMes: number;
};

export type SalesGeral = {
  totalClientes: number;
  clientesAtivos: number;
  taxaConversao: number;
  receitaTotal: number;
  ticketMedio: number;
  vendasMes: number;
  metaValor: number;
  metaVolume: number;
};

export type SalesPorPessoa = {
  nome: string;
  initials: string;
  clientes: number;
  vendas: number;
  conversao: number;
  receita: number;
  metaValor: number;
  metaVolume: number;
};

export type GoalDatum = {
  vendedor: string;
  valorAtual: number;
  valorMeta: number;
  volumeAtual: number;
  volumeMeta: number;
};

export type DashboardStats = {
  teamMembers: TeamMember[];
  visitData: VisitData[];
  frequencyData: FrequencyDatum[];
  clientActivity: ClientActivity[];
  salesGeral: SalesGeral;
  salesPorPessoa: SalesPorPessoa[];
  totalTasks: number;
};

export type DashboardCharts = {
  goalData: GoalDatum[];
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
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
    const inProgress = asNumber(member.inProgress, asNumber(member.tarefasEmAndamento));
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
function normalizeStats(raw: unknown): DashboardStats {
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
    frequencyData: asArray<FrequencyDatum>(source.frequencyData),
    visitData: asArray<VisitData>(source.visitData),
    clientActivity: asArray<ClientActivity>(source.clientActivity),
    salesGeral: {
      totalClientes: num(source.totalClientes),
      clientesAtivos: num(source.clientesAtivos),
      taxaConversao: num(source.taxaConversao),
      receitaTotal: num(source.receitaTotal),
      ticketMedio: num(source.ticketMedio),
      vendasMes: num(source.vendasMes),
      metaValor: num(source.metaValor),
      metaVolume: num(source.metaVolume),
    },
    salesPorPessoa: asArray<SalesPorPessoa>(source.salesPorPessoa),
    totalTasks: num(source.totalTasks),
  };
}

function normalizeCharts(raw: unknown): DashboardCharts {
  const source =
    typeof raw === "object" &&
    raw !== null &&
    "data" in raw &&
    (raw as { data: unknown }).data !== null &&
    typeof (raw as { data: unknown }).data === "object"
      ? ((raw as { data: unknown }).data as Record<string, unknown>)
      : ((raw ?? {}) as Record<string, unknown>);

  return {
    goalData: asArray<GoalDatum>(source.goalData),
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const raw = await apiGet<unknown>("/dashboard/stats");
  return normalizeStats(raw);
}

export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const raw = await apiGet<unknown>("/dashboard/charts");
  return normalizeCharts(raw);
}
