import { apiGet } from "./api";
import { normalizeDashboardStats } from "./dashboardNormalize";

export { normalizeDashboardStats } from "./dashboardNormalize";

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
  visitas: number;
  clientesRetornando: number;
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
  return normalizeDashboardStats(raw);
}

export async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const raw = await apiGet<unknown>("/dashboard/charts");
  return normalizeCharts(raw);
}
