import { apiGet, apiPost } from "./api";
export type MetricType =
  "ACTIVITIES" | "VISITS" | "SALES" | "PROSPECTING" | "RETURN";
export type MetricPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type MetricTeam = {
  id: string;
  name: string;
  members: { id: string; name: string }[];
};
export type MetricGoalInput = {
  name: string;
  teamId: string;
  userIds: string[];
  type: MetricType;
  period: MetricPeriod;
  target: number;
  startDate: string;
  endDate: string;
};
export type MetricGoal = MetricGoalInput & {
  id: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
};
export type MetricSource = {
  id: string;
  label: string;
  entity: string;
  measure: string;
  aggregation?: "count" | "sum" | "average" | "rate";
  /** Rota já disponível na API que alimenta esta fonte. */
  dataPath?: string;
  /** Campos que podem restringir dados desta fonte. */
  filterFields?: MetricSourceFilterField[];
};
export type MetricSourceFilterField = {
  id: string;
  label: string;
};
export type MetricSourceFilterOption = MetricSourceFilterField & {
  sourceId: string;
  sourceLabel: string;
};
export type MetricFilter = {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "in" | "between";
  value: string | number | boolean | string[] | number[];
};
export type MetricVisualization = "chart" | "table" | "card";
export type MetricMode = "guided" | "blocks" | "advanced";
export type MetricOperation = "difference" | "percentage" | "ratio" | "sum" | "average";
export type MetricDimension = { id: string; label: string };
export type MetricResult =
  | { status: "pending" }
  | { status: "ready"; value: number; label?: string }
  | { status: "unavailable"; reason?: string };
export type MetricAnalysis = {
  id: string;
  name: string;
  mode: MetricMode;
  primarySource: MetricSource;
  secondarySource?: MetricSource;
  sources?: MetricSource[];
  filters: MetricFilter[];
  dimensions: MetricDimension[];
  period: MetricPeriod;
  visualization: MetricVisualization;
  goal?: { target: number; label?: string };
  publishedToDashboard: boolean;
  dashboardPosition?: number;
  createdAt: string;
  updatedAt: string;
  definition?: string;
  operation?: MetricOperation;
  result?: MetricResult;
};
export type MetricAnalysisResult = {
  series: { label: string; value: number; quantity: number }[];
  comparison: {
    label: string;
    clients: number;
    visits: number;
    orders: number;
    frequency: number;
  }[];
  distribution: { label: string; value: number }[];
  frequency: { label: string; value: number }[];
  summary: { value: number; quantity: number; clients: number; visits: number };
  definitions?: string[];
};
export const METRIC_TYPES: {
  id: MetricType;
  label: string;
  description: string;
}[] = [
  {
    id: "ACTIVITIES",
    label: "Atividades",
    description: "Tarefas concluídas pelo time",
  },
  {
    id: "VISITS",
    label: "Visitas",
    description: "Visitas agendadas a clientes",
  },
  {
    id: "SALES",
    label: "Vendas",
    description: "Valor dos pedidos não cancelados",
  },
  {
    id: "PROSPECTING",
    label: "Prospecção",
    description: "Clientes novos ou sem contato vinculados",
  },
  {
    id: "RETURN",
    label: "Retorno de Cliente",
    description: "Clientes que voltaram a comprar",
  },
];
export const METRIC_PERIODS: { id: MetricPeriod; label: string }[] = [
  { id: "DAILY", label: "Diário" },
  { id: "WEEKLY", label: "Semanal" },
  { id: "MONTHLY", label: "Mensal" },
  { id: "YEARLY", label: "Anual" },
];

const commercialFilters: MetricSourceFilterField[] = [
  { id: "status", label: "Status" },
  { id: "client", label: "Cliente" },
  { id: "responsible", label: "Responsável" },
];

/**
 * Fonte única para os três construtores. Cada item aponta para uma rota real
 * do CRM e declara os filtros que seus dados aceitam.
 */
export const METRIC_SOURCES: MetricSource[] = [
  { id: "orders.count", label: "Pedidos", entity: "orders", measure: "count", aggregation: "count", dataPath: "/orders", filterFields: commercialFilters },
  { id: "orders.revenue", label: "Faturamento", entity: "orders", measure: "revenue", aggregation: "sum", dataPath: "/orders", filterFields: commercialFilters },
  { id: "appointments.visits", label: "Visitas", entity: "appointments", measure: "count", aggregation: "count", dataPath: "/appointments", filterFields: commercialFilters },
  { id: "appointments.meetings", label: "Reuniões", entity: "appointments", measure: "count", aggregation: "count", dataPath: "/appointments", filterFields: commercialFilters },
  { id: "clients.new", label: "Clientes novos", entity: "clients", measure: "new", aggregation: "count", dataPath: "/clients", filterFields: [{ id: "segment", label: "Segmento" }, { id: "responsible", label: "Responsável" }] },
  { id: "clients.existing", label: "Clientes antigos", entity: "clients", measure: "existing", aggregation: "count", dataPath: "/clients", filterFields: [{ id: "segment", label: "Segmento" }, { id: "responsible", label: "Responsável" }] },
  { id: "stock.on_hand", label: "Estoque", entity: "stock", measure: "on_hand", aggregation: "sum", dataPath: "/metrics/operations/stock", filterFields: [{ id: "unit", label: "Unidade" }, { id: "location", label: "Berçário ou local" }, { id: "product", label: "Produto" }] },
  { id: "reservations.active", label: "Reservas", entity: "reservations", measure: "active", aggregation: "count", dataPath: "/stock/reservations", filterFields: [{ id: "status", label: "Status" }, { id: "unit", label: "Unidade" }, { id: "product", label: "Produto" }] },
  { id: "laboratory.analyses", label: "Laboratório", entity: "laboratory", measure: "analyses", aggregation: "count", dataPath: "/lab/orders", filterFields: [{ id: "status", label: "Status" }, { id: "unit", label: "Unidade" }, { id: "product", label: "Produto" }] },
  { id: "separation.orders", label: "Separação", entity: "separation", measure: "orders", aggregation: "count", dataPath: "/metrics/operations/funnel", filterFields: [{ id: "status", label: "Status" }, { id: "unit", label: "Unidade" }, { id: "responsible", label: "Responsável" }] },
  { id: "deliveries.completed", label: "Entregas", entity: "deliveries", measure: "completed", aggregation: "count", dataPath: "/metrics/operations/logistics", filterFields: [{ id: "status", label: "Status" }, { id: "driver", label: "Motorista" }, { id: "unit", label: "Unidade" }] },
  { id: "after-sales.followups", label: "Pós-venda", entity: "after-sales", measure: "followups", aggregation: "count", dataPath: "/metrics/operations/post-sales", filterFields: [{ id: "status", label: "Status" }, { id: "client", label: "Cliente" }, { id: "responsible", label: "Responsável" }] },
];

export function getMetricSource(id: string): MetricSource | undefined {
  return METRIC_SOURCES.find((source) => source.id === id);
}

/** Gera filtros apenas para as mesmas fontes escolhidas na análise. */
export function getMetricSourceFilters(
  sources: MetricSource[],
): MetricSourceFilterOption[] {
  return sources.flatMap((source) =>
    (source.filterFields ?? []).map((field) => ({
      ...field,
      id: `${source.id}.${field.id}`,
      sourceId: source.id,
      sourceLabel: source.label,
    })),
  );
}

export function fetchMetricsOptions() {
  return apiGet<{ teams: MetricTeam[] }>("/metrics/options");
}
export function fetchMetricGoals() {
  return apiGet<MetricGoal[]>("/metrics/goals");
}
export function createMetricGoal(input: MetricGoalInput) {
  return apiPost<MetricGoal>("/metrics/goals", input);
}
export function fetchMetricAnalysis(
  input: Omit<MetricGoalInput, "name" | "target">,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    ...input,
    userIds: input.userIds.join(","),
  });
  if (!input.userIds.length) params.delete("userIds");
  return apiGet<MetricAnalysisResult>(`/metrics/analysis?${params}`, { signal });
}
export function defaultMetricDates() {
  const today = new Date();
  const date = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  return {
    startDate: date(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: date(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}
