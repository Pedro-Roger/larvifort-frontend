import type { MetricAnalysis, MetricMode } from "./metrics";

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

export function loadMetricAnalyses(): MetricAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(METRIC_ANALYSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MetricAnalysis[]) : [];
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
  write(current.filter((item) => item.id !== id));
  return true;
}

export function setMetricAnalysisPublished(id: string, published: boolean): MetricAnalysis | null {
  return updateMetricAnalysis(id, { publishedToDashboard: published });
}

export function setMetricAnalysisMode(id: string, mode: MetricMode): MetricAnalysis | null {
  return updateMetricAnalysis(id, { mode });
}

