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
};
export type MetricFilter = {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "in" | "between";
  value: string | number | boolean | string[] | number[];
};
export type MetricVisualization = "chart" | "table" | "card";
export type MetricMode = "guided" | "blocks" | "advanced";
export type MetricDimension = { id: string; label: string };
export type MetricAnalysis = {
  id: string;
  name: string;
  mode: MetricMode;
  primarySource: MetricSource;
  secondarySource?: MetricSource;
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
