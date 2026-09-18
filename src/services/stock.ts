import { apiGet, apiPost } from "./api";

export type StockAvailability = { id: string; productName: string; unit: string; unitName: string; locationName: string; available: number; reserved: number; blocked: number; updatedAt: string };
export type StockMovementInput = { productId: string; unitId: string; locationId: string; type: "ENTRADA" | "SAIDA" | "BLOQUEIO" | "AJUSTE"; quantity: number; reason: string };

const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
const num = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };

export function normalizeAvailability(raw: unknown): StockAvailability {
  const source = obj(raw);
  const product = obj(source.product);
  const location = obj(source.location);
  return { id: text(source.id), productName: text(source.productName ?? product.name, "Produto"), unit: text(source.unit ?? source.measureUnit, "MILHEIRO"), unitName: text(source.unitName ?? source.stockUnitName, "Unidade"), locationName: text(source.locationName ?? location.name, "Local"), available: num(source.available ?? source.availableQuantity), reserved: num(source.reserved ?? source.reservedQuantity), blocked: num(source.blocked ?? source.blockedQuantity), updatedAt: text(source.updatedAt) };
}
export function normalizeAvailabilityList(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeAvailability); }
export function fetchStockAvailability(params: { productId?: string; unitId?: string; locationId?: string } = {}) { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value && query.set(key, value)); return apiGet<unknown>(`/stock/availability${query.size ? `?${query}` : ""}`).then(normalizeAvailabilityList); }
export function createStockMovement(input: StockMovementInput) { return apiPost<unknown>("/stock/movements", input); }
