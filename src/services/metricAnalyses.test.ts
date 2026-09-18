import {
  createMetricAnalysis,
  duplicateMetricAnalysis,
  loadMetricAnalyses,
  removeMetricAnalysis,
  setMetricAnalysisMode,
  setMetricAnalysisPublished,
  updateMetricAnalysis,
} from "./metricAnalyses";

const source = { id: "orders.total", label: "Pedidos", entity: "orders", measure: "total", aggregation: "sum" as const };
const dimensions = [{ id: "period", label: "Período" }];

describe("metricAnalyses", () => {
  beforeEach(() => window.localStorage.clear());

  it("serializes a persisted analysis", () => {
    const created = createMetricAnalysis({
      name: "Pedidos x visitas",
      mode: "guided",
      primarySource: source,
      filters: [],
      dimensions,
      period: "MONTHLY",
      visualization: "chart",
      publishedToDashboard: false,
    });
    expect(loadMetricAnalyses()).toEqual([created]);
    expect(JSON.parse(window.localStorage.getItem("larvifort:metric-analyses:v1")!)).toHaveLength(1);
  });

  it("duplicates without publishing or sharing identity", () => {
    const original = createMetricAnalysis({ name: "A", mode: "blocks", primarySource: source, filters: [], dimensions, period: "DAILY", visualization: "card", publishedToDashboard: true });
    const copy = duplicateMetricAnalysis(original.id)!;
    expect(copy.id).not.toBe(original.id);
    expect(copy.name).toBe("A (cópia)");
    expect(copy.publishedToDashboard).toBe(false);
    expect(loadMetricAnalyses()).toHaveLength(2);
  });

  it("publishes and removes an analysis", () => {
    const item = createMetricAnalysis({ name: "A", mode: "advanced", primarySource: source, filters: [], dimensions, period: "YEARLY", visualization: "table", publishedToDashboard: false });
    expect(setMetricAnalysisPublished(item.id, true)?.publishedToDashboard).toBe(true);
    expect(removeMetricAnalysis(item.id)).toBe(true);
    expect(loadMetricAnalyses()).toEqual([]);
    expect(removeMetricAnalysis(item.id)).toBe(false);
  });

  it("updates the definition and mode while preserving identity", () => {
    const item = createMetricAnalysis({ name: "A", mode: "guided", primarySource: source, filters: [], dimensions, period: "MONTHLY", visualization: "chart", publishedToDashboard: false });
    const updated = updateMetricAnalysis(item.id, { name: "Pedidos x visitas", visualization: "table" });
    expect(updated?.id).toBe(item.id);
    expect(updated?.name).toBe("Pedidos x visitas");
    expect(updated?.visualization).toBe("table");
    expect(updated?.createdAt).toBe(item.createdAt);
    expect(setMetricAnalysisMode(item.id, "advanced")?.mode).toBe("advanced");
    expect(loadMetricAnalyses()[0].mode).toBe("advanced");
  });
});
