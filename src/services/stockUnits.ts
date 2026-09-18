import { apiGet, apiPatch, apiPost } from "./api";

export type StockUnit = { id: string; name: string; code: string | null; status: string; locations: StockLocation[] };
export type StockLocation = { id: string; unitId: string; name: string; type: string; capacity: number | null; status: string };

const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback: string) => value == null ? fallback : String(value);
const numeric = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };

export function normalizeLocation(raw: unknown): StockLocation {
  const source = obj(raw);
  return { id: text(source.id, ""), unitId: text(source.unitId ?? source.stockUnitId, ""), name: text(source.name, "Local"), type: text(source.type, "BERCARIO"), capacity: numeric(source.capacity), status: text(source.status, "ACTIVE") };
}

export function normalizeUnit(raw: unknown): StockUnit {
  const envelope = obj(raw); const source = obj(envelope.data ?? raw);
  return { id: text(source.id, ""), name: text(source.name, "Unidade"), code: source.code == null ? null : String(source.code), status: text(source.status, "ACTIVE"), locations: list(source.locations).map(normalizeLocation) };
}

export function normalizeUnits(raw: unknown): StockUnit[] { return list(obj(raw).data ?? raw).map(normalizeUnit); }
export function normalizeLocations(raw: unknown): StockLocation[] { return list(obj(raw).data ?? raw).map(normalizeLocation); }
export function fetchStockUnits() { return apiGet<unknown>("/stock/units").then(normalizeUnits); }
export function fetchStockLocations(unitId?: string) { return apiGet<unknown>(`/stock/locations${unitId ? `?unitId=${encodeURIComponent(unitId)}` : ""}`).then(normalizeLocations); }
export function createStockUnit(input: Pick<StockUnit, "name" | "code" | "status">) { return apiPost<unknown>("/stock/units", input).then(normalizeUnit); }
export function updateStockUnit(id: string, input: Pick<StockUnit, "name" | "code" | "status">) { return apiPatch<unknown>(`/stock/units/${id}`, input).then(normalizeUnit); }
export function createStockLocation(input: Omit<StockLocation, "id">) { return apiPost<unknown>("/stock/locations", input).then(normalizeLocation); }
export function updateStockLocation(id: string, input: Omit<StockLocation, "id">) { return apiPatch<unknown>(`/stock/locations/${id}`, input).then(normalizeLocation); }
