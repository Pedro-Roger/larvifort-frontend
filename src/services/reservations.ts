import { apiDelete, apiGet, apiPost } from "./api";

export type StockReservation = { id: string; orderId: string; orderNumber: string | null; productName: string; quantity: number; unit: string; unitName: string; locationName: string; status: string; createdAt: string };
export type StockOption = { unitId: string; unitName: string; locationId: string; locationName: string; available: number };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
const num = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
export function normalizeReservation(raw: unknown): StockReservation { const source = obj(raw); return { id: text(source.id), orderId: text(source.orderId), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), productName: text(source.productName, "Produto"), quantity: num(source.quantity), unit: text(source.unit, "MILHEIRO"), unitName: text(source.unitName, "Unidade"), locationName: text(source.locationName, "Local"), status: text(source.status, "ACTIVE"), createdAt: text(source.createdAt) }; }
export function normalizeReservations(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeReservation); }
export function normalizeStockOptions(raw: unknown): StockOption[] { return list(obj(raw).data ?? raw).map((value) => { const source = obj(value); return { unitId: text(source.unitId), unitName: text(source.unitName, "Unidade"), locationId: text(source.locationId), locationName: text(source.locationName, "Local"), available: num(source.available) }; }); }
export function fetchReservations() { return apiGet<unknown>("/stock/reservations").then(normalizeReservations); }
export function fetchOrderStockOptions(orderId: string) { return apiGet<unknown>(`/orders/${orderId}/stock-options`).then(normalizeStockOptions); }
export function reserveOrderStock(orderId: string, input: { unitId?: string; locationId?: string }) { return apiPost<unknown>(`/orders/${orderId}/reserve-stock`, input); }
export function releaseOrderStock(orderId: string) { return apiPost<unknown>(`/orders/${orderId}/release-stock`, {}); }
export function deleteReservation(id: string) { return apiDelete<void>(`/stock/reservations/${id}`); }
