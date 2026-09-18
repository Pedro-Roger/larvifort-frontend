import { apiGet, apiPost } from "./api";

export type SeparationOrder = { id: string; orderId: string; orderNumber: string | null; productName: string; expectedQuantity: number; separatedQuantity: number; unit: string; deliveryDate: string | null; status: string; assigneeName: string | null; divergenceReason: string | null };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
const num = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
export function normalizeSeparation(raw: unknown): SeparationOrder { const source = obj(raw); return { id: text(source.id), orderId: text(source.orderId), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), productName: text(source.productName, "Produto"), expectedQuantity: num(source.expectedQuantity ?? source.quantity), separatedQuantity: num(source.separatedQuantity), unit: text(source.unit, "MILHEIRO"), deliveryDate: source.deliveryDate == null ? null : String(source.deliveryDate), status: text(source.status, "AGUARDANDO_SEPARACAO"), assigneeName: source.assigneeName == null ? null : String(source.assigneeName), divergenceReason: source.divergenceReason == null ? null : String(source.divergenceReason) }; }
export function normalizeSeparations(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeSeparation); }
export function fetchSeparationOrders() { return apiGet<unknown>("/separation/orders").then(normalizeSeparations); }
export function startSeparation(orderId: string) { return apiPost<unknown>(`/orders/${orderId}/separation/start`, {}).then(normalizeSeparation); }
export function completeSeparation(orderId: string, separatedQuantity: number) { return apiPost<unknown>(`/orders/${orderId}/separation/complete`, { separatedQuantity }).then(normalizeSeparation); }
export function registerDivergence(orderId: string, reason: string) { return apiPost<unknown>(`/orders/${orderId}/separation/divergence`, { reason }).then(normalizeSeparation); }
