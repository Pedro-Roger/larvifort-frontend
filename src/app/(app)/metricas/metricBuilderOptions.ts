import type { MetricDimension, MetricPeriod, MetricSource, MetricVisualization } from "@/services/metrics";

export const METRIC_BUILDER_SOURCES: MetricSource[] = [
  { id: "orders.count", label: "Pedidos", entity: "orders", measure: "count", aggregation: "count" },
  { id: "orders.revenue", label: "Faturamento", entity: "orders", measure: "revenue", aggregation: "sum" },
  { id: "appointments.visits", label: "Visitas", entity: "appointments", measure: "count", aggregation: "count" },
  { id: "appointments.meetings", label: "Reuniões", entity: "appointments", measure: "count", aggregation: "count" },
  { id: "clients.new", label: "Clientes novos", entity: "clients", measure: "new", aggregation: "count" },
  { id: "clients.existing", label: "Clientes antigos", entity: "clients", measure: "existing", aggregation: "count" },
];

export const METRIC_BUILDER_PERIODS: { id: MetricPeriod; label: string }[] = [
  { id: "DAILY", label: "Diário" },
  { id: "WEEKLY", label: "Semanal" },
  { id: "MONTHLY", label: "Mensal" },
  { id: "YEARLY", label: "Anual" },
];

export const METRIC_BUILDER_VISUALIZATIONS: { id: MetricVisualization; label: string }[] = [
  { id: "chart", label: "Gráfico" },
  { id: "table", label: "Tabela" },
  { id: "card", label: "Indicador" },
];

export const TEMPORAL_DIMENSION: MetricDimension = {
  id: "period",
  label: "Período",
};

export function getMetricSource(id: string) {
  return METRIC_BUILDER_SOURCES.find((source) => source.id === id);
}
