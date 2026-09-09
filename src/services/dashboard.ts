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
    teamMembers: asArray<TeamMember>(source.teamMembers),
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