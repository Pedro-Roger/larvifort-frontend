import {
  createMetricAnalysis,
  duplicateMetricAnalysis,
  loadMetricAnalyses,
  removeMetricAnalysis,
  setMetricAnalysisMode,
  setMetricAnalysisPublished,
  updateMetricAnalysis,
} from "./metricAnalyses.ts";
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
} });
Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage, dispatchEvent: () => true } });

const source = { id: "orders.total", label: "Pedidos", entity: "orders", measure: "total", aggregation: "sum" as const };
const dimensions = [{ id: "period", label: "Período" }];

beforeEach(() => storage.clear());

test("serializes a persisted analysis", () => {
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
    assert.deepEqual(loadMetricAnalyses(), [created]);
    assert.equal(JSON.parse(window.localStorage.getItem("larvifort:metric-analyses:v1")!).length, 1);
});

test("duplicates without publishing or sharing identity", () => {
    const original = createMetricAnalysis({ name: "A", mode: "blocks", primarySource: source, filters: [], dimensions, period: "DAILY", visualization: "card", publishedToDashboard: true });
    const copy = duplicateMetricAnalysis(original.id)!;
    assert.notEqual(copy.id, original.id);
    assert.equal(copy.name, "A (cópia)");
    assert.equal(copy.publishedToDashboard, false);
    assert.equal(loadMetricAnalyses().length, 2);
});

test("publishes and removes an analysis", () => {
    const item = createMetricAnalysis({ name: "A", mode: "advanced", primarySource: source, filters: [], dimensions, period: "YEARLY", visualization: "table", publishedToDashboard: false });
    assert.equal(setMetricAnalysisPublished(item.id, true)?.publishedToDashboard, true);
    assert.equal(removeMetricAnalysis(item.id), true);
    assert.deepEqual(loadMetricAnalyses(), []);
    assert.equal(removeMetricAnalysis(item.id), false);
});

test("updates the definition and mode while preserving identity", () => {
    const item = createMetricAnalysis({ name: "A", mode: "guided", primarySource: source, filters: [], dimensions, period: "MONTHLY", visualization: "chart", publishedToDashboard: false });
    const updated = updateMetricAnalysis(item.id, { name: "Pedidos x visitas", visualization: "table" });
    assert.equal(updated?.id, item.id);
    assert.equal(updated?.name, "Pedidos x visitas");
    assert.equal(updated?.visualization, "table");
    assert.equal(updated?.createdAt, item.createdAt);
    assert.equal(setMetricAnalysisMode(item.id, "advanced")?.mode, "advanced");
    assert.equal(loadMetricAnalyses()[0].mode, "advanced");
});
