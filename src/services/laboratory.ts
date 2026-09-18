import { apiGet, apiPatch, apiPost } from "./api";

export type LabOrder = { id: string; orderId: string; orderNumber: string | null; productName: string; quantity: number; unit: string; unitName: string; locationName: string; deliveryDate: string | null; status: string; assigneeName: string | null; blockedReason: string | null };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
const num = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
export function normalizeLabOrder(raw: unknown): LabOrder { const source = obj(raw); return { id: text(source.id), orderId: text(source.orderId), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), productName: text(source.productName, "Produto"), quantity: num(source.quantity), unit: text(source.unit, "MILHEIRO"), unitName: text(source.unitName, "Unidade"), locationName: text(source.locationName, "Local"), deliveryDate: source.deliveryDate == null ? null : String(source.deliveryDate), status: text(source.status, "AGUARDANDO_LABORATORIO"), assigneeName: source.assigneeName == null ? null : String(source.assigneeName), blockedReason: source.blockedReason == null ? null : String(source.blockedReason) }; }
export function normalizeLabOrders(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeLabOrder); }
export function fetchLabOrders() { return apiGet<unknown>("/lab/orders").then(normalizeLabOrders); }
export function createLabWorkOrder(orderId: string, input: Record<string, unknown> = {}) { return apiPost<unknown>(`/orders/${orderId}/lab-work-order`, input).then(normalizeLabOrder); }
export function updateLabStatus(id: string, status: string, reason?: string) { return apiPatch<unknown>(`/lab/work-orders/${id}/status`, { status, reason }).then(normalizeLabOrder); }
