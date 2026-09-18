import type { MetricDimension, MetricOperation, MetricPeriod, MetricSource, MetricVisualization } from "@/services/metrics";

export const METRIC_BUILDER_SOURCES: MetricSource[] = [
  { id: "orders.count", label: "Pedidos", entity: "orders", measure: "count", aggregation: "count" },
  { id: "orders.revenue", label: "Faturamento", entity: "orders", measure: "revenue", aggregation: "sum" },
  { id: "appointments.visits", label: "Visitas", entity: "appointments", measure: "count", aggregation: "count" },
  { id: "appointments.meetings", label: "Reuniões", entity: "appointments", measure: "count", aggregation: "count" },
  { id: "clients.new", label: "Clientes novos", entity: "clients", measure: "new", aggregation: "count" },
  { id: "clients.existing", label: "Clientes antigos", entity: "clients", measure: "existing", aggregation: "count" },
  { id: "stock.on_hand", label: "Estoque", entity: "stock", measure: "on_hand", aggregation: "sum" },
  { id: "reservations.active", label: "Reservas", entity: "reservations", measure: "active", aggregation: "count" },
  { id: "laboratory.analyses", label: "Laboratório", entity: "laboratory", measure: "analyses", aggregation: "count" },
  { id: "separation.orders", label: "Separação", entity: "separation", measure: "orders", aggregation: "count" },
  { id: "deliveries.completed", label: "Entregas", entity: "deliveries", measure: "completed", aggregation: "count" },
  { id: "after-sales.followups", label: "Pós-venda", entity: "after-sales", measure: "followups", aggregation: "count" },
];

export const METRIC_BUILDER_OPERATIONS: Record<MetricOperation, string> = {
  difference: "Diferença",
  percentage: "Percentual",
  ratio: "Razão",
  sum: "Soma",
  average: "Média",
};

export const BINARY_METRIC_OPERATIONS: MetricOperation[] = ["difference", "percentage", "ratio"];

export function isBinaryMetricOperation(operation: MetricOperation) {
  return BINARY_METRIC_OPERATIONS.includes(operation);
}

export function buildMetricExpression(operation: MetricOperation, sources: MetricSource[]) {
  if (!sources.length) return "Selecione ao menos uma fonte.";
  const labels = sources.map((source) => source.label);
  if (operation === "difference") return labels.length >= 2 ? `${labels[0]} − ${labels[1]}` : "A diferença precisa de duas fontes.";
  if (operation === "percentage") return labels.length >= 2 ? `(${labels[0]} ÷ ${labels[1]}) × 100` : "O percentual precisa de duas fontes.";
  if (operation === "ratio") return labels.length >= 2 ? `${labels[0]} ÷ ${labels[1]}` : "A razão precisa de duas fontes.";
  return `${METRIC_BUILDER_OPERATIONS[operation]} de ${labels.join(", ")}`;
}

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
