import {
  getMetricSource as getCatalogMetricSource,
  METRIC_SOURCES,
  type MetricDimension,
  type MetricOperation,
  type MetricPeriod,
  type MetricSource,
  type MetricVisualization,
} from "@/services/metrics";

/** Compatibilidade para os construtores; o catálogo fica centralizado no serviço. */
export const METRIC_BUILDER_SOURCES = METRIC_SOURCES;

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
  return getCatalogMetricSource(id);
}
