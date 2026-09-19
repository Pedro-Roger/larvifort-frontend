import { apiGet, apiPatch, apiPost } from "./api";

export type StockStatus = "ACTIVA" | "INACTIVA";
export type StockLocationType = "BERCARIO" | "ALMACEN" | "OTRO";
export type StockUnit = {
  id: string;
  name: string;
  city: string | null;
  status: StockStatus;
  locations: StockLocation[];
};
export type StockLocation = {
  id: string;
  unitId: string;
  name: string;
  type: StockLocationType;
  capacity: number | null;
  status: StockStatus;
};
export type StockUnitInput = Pick<StockUnit, "name" | "status"> & {
  city?: string;
};
export type StockLocationInput = Omit<StockLocation, "id">;

const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback: string) => value == null ? fallback : String(value);
const numeric = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
const status = (value: unknown): StockStatus => value === "INACTIVA" ? "INACTIVA" : "ACTIVA";
const locationType = (value: unknown): StockLocationType => value === "ALMACEN" || value === "OTRO" ? value : "BERCARIO";

export function normalizeLocation(raw: unknown): StockLocation {
  const source = obj(raw);
  return { id: text(source.id, ""), unitId: text(source.unitId ?? source.stockUnitId, ""), name: text(source.name, "Local"), type: locationType(source.type), capacity: numeric(source.capacity), status: status(source.status) };
}

export function normalizeUnit(raw: unknown): StockUnit {
  const envelope = obj(raw); const source = obj(envelope.data ?? raw);
  return { id: text(source.id, ""), name: text(source.name, "Unidade"), city: source.city == null ? null : String(source.city), status: status(source.status), locations: list(source.locations).map(normalizeLocation) };
}

export function normalizeUnits(raw: unknown): StockUnit[] { return list(obj(raw).data ?? raw).map(normalizeUnit); }
export function normalizeLocations(raw: unknown): StockLocation[] { return list(obj(raw).data ?? raw).map(normalizeLocation); }
export function fetchStockUnits() { return apiGet<unknown>("/stock/units").then(normalizeUnits); }
export function fetchStockLocations(unitId?: string) { return apiGet<unknown>(`/stock/locations${unitId ? `?unitId=${encodeURIComponent(unitId)}` : ""}`).then(normalizeLocations); }
export function createStockUnit(input: StockUnitInput) { return apiPost<unknown>("/stock/units", input).then(normalizeUnit); }
export function updateStockUnit(id: string, input: StockUnitInput) { return apiPatch<unknown>(`/stock/units/${id}`, input).then(normalizeUnit); }
export function createStockLocation(input: StockLocationInput) { return apiPost<unknown>("/stock/locations", input).then(normalizeLocation); }
export function updateStockLocation(id: string, input: StockLocationInput) { return apiPatch<unknown>(`/stock/locations/${id}`, input).then(normalizeLocation); }
