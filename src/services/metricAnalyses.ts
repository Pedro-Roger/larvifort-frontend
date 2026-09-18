import { addMetricAnalysisDashboardWidget, removeMetricAnalysisWidget } from "./dashboardWidgets.ts";
import type { MetricAnalysis, MetricFilter, MetricMode, MetricSource } from "./metrics.ts";

export const METRIC_ANALYSES_STORAGE_KEY = "larvifort:metric-analyses:v1";
export const METRIC_ANALYSES_EVENT = "larvifort:metric-analyses-changed";

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(METRIC_ANALYSES_EVENT));
  }
}

function write(items: MetricAnalysis[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(METRIC_ANALYSES_STORAGE_KEY, JSON.stringify(items));
  emitChange();
}

function isMetricSource(value: unknown): value is MetricSource {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && item.id.length > 0 &&
    typeof item.label === "string" && item.label.length > 0 &&
    typeof item.entity === "string" && item.entity.length > 0 &&
    typeof item.measure === "string" && item.measure.length > 0 &&
    (item.aggregation === undefined || ["count", "sum", "average", "rate"].includes(item.aggregation as string));
}

function isMetricFilter(value: unknown): value is MetricFilter {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const filterValue = item.value;
  const validValue = typeof filterValue === "string" || typeof filterValue === "boolean" ||
    (typeof filterValue === "number" && Number.isFinite(filterValue)) ||
    (Array.isArray(filterValue) && filterValue.length > 0 && filterValue.every((entry) =>
      typeof entry === "string" || (typeof entry === "number" && Number.isFinite(entry))));
  return typeof item.field === "string" && item.field.length > 0 &&
    ["equals", "not_equals", "contains", "in", "between"].includes(item.operator as string) && validValue;
}

function isIsoDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isMetricAnalysis(value: unknown): value is MetricAnalysis {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.name === "string" &&
    (item.mode === "guided" || item.mode === "blocks" || item.mode === "advanced") &&
    isMetricSource(item.primarySource) &&
    (item.secondarySource === undefined || isMetricSource(item.secondarySource)) &&
    (!Object.hasOwn(item, "sources") || (Array.isArray(item.sources) && item.sources.length > 0 && item.sources.every(isMetricSource) && new Set(item.sources.map((source) => source.id)).size === item.sources.length)) &&
    Array.isArray(item.filters) && item.filters.every(isMetricFilter) &&
    Array.isArray(item.dimensions) && item.dimensions.every((dimension) => {
      if (!dimension || typeof dimension !== "object") return false;
      const entry = dimension as Record<string, unknown>;
      return typeof entry.id === "string" && typeof entry.label === "string";
    }) && ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(item.period as string) &&
    ["chart", "table", "card"].includes(item.visualization as string) && typeof item.publishedToDashboard === "boolean" &&
    (item.dashboardPosition === undefined || (Number.isInteger(item.dashboardPosition) && (item.dashboardPosition as number) >= 0)) &&
    (item.definition === undefined || typeof item.definition === "string") &&
    (item.operation === undefined || ["difference", "percentage", "ratio", "sum", "average"].includes(item.operation as string)) &&
    (item.goal === undefined || (typeof item.goal === "object" && item.goal !== null && Number.isFinite((item.goal as { target?: unknown }).target) && ((item.goal as { target: number }).target > 0))) &&
    (item.result === undefined || (typeof item.result === "object" && item.result !== null && ["pending", "ready", "unavailable"].includes((item.result as { status?: unknown }).status as string) &&
      ((item.result as { status?: unknown }).status !== "ready" || Number.isFinite((item.result as { value?: unknown }).value)))) &&
    isIsoDate(item.createdAt) && isIsoDate(item.updatedAt);
}

export function loadMetricAnalyses(): MetricAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(METRIC_ANALYSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isMetricAnalysis) : [];
  } catch {
    return [];
  }
}

export function createMetricAnalysis(
  input: Omit<MetricAnalysis, "id" | "createdAt" | "updatedAt">,
): MetricAnalysis {
  const now = new Date().toISOString();
  const analysis: MetricAnalysis = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  write([...loadMetricAnalyses(), analysis]);
  return analysis;
}

export function updateMetricAnalysis(
  id: string,
  changes: Partial<Omit<MetricAnalysis, "id" | "createdAt">>,
): MetricAnalysis | null {
  const current = loadMetricAnalyses();
  const found = current.find((item) => item.id === id);
  if (!found) return null;
  const updated = { ...found, ...changes, updatedAt: new Date().toISOString() };
  write(current.map((item) => (item.id === id ? updated : item)));
  if (updated.publishedToDashboard && !Object.hasOwn(changes, "dashboardPosition")) {
    addMetricAnalysisDashboardWidget(updated);
  }
  return updated;
}

export function duplicateMetricAnalysis(id: string): MetricAnalysis | null {
  const found = loadMetricAnalyses().find((item) => item.id === id);
  if (!found) return null;
  return createMetricAnalysis({
    ...found,
    name: `${found.name} (cópia)`,
    publishedToDashboard: false,
    dashboardPosition: undefined,
  });
}

export function removeMetricAnalysis(id: string): boolean {
  const current = loadMetricAnalyses();
  if (!current.some((item) => item.id === id)) return false;
  removeMetricAnalysisWidget(id);
  write(current.filter((item) => item.id !== id));
  return true;
}

export function setMetricAnalysisPublished(id: string, published: boolean): MetricAnalysis | null {
  const analysis = loadMetricAnalyses().find((item) => item.id === id);
  if (!analysis) return null;
  if (!published) {
    removeMetricAnalysisWidget(id);
    return updateMetricAnalysis(id, { publishedToDashboard: false, dashboardPosition: undefined });
  }
  const widgets = addMetricAnalysisDashboardWidget(analysis);
  const dashboardPosition = widgets.findIndex((widget) => widget.analysisId === id);
  return updateMetricAnalysis(id, { publishedToDashboard: true, dashboardPosition: dashboardPosition >= 0 ? dashboardPosition : undefined });
}

export function setMetricAnalysisMode(id: string, mode: MetricMode): MetricAnalysis | null {
  return updateMetricAnalysis(id, { mode });
}
