import { apiGet, apiPatch } from "./api";

export type FiscalSummary = { orderId: string; orderNumber: string | null; clientName: string | null; document: string | null; address: string | null; productName: string | null; quantity: number; total: number; paymentMethod: string | null; salesRep: string | null; status: string };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
const num = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
export function normalizeFiscal(raw: unknown): FiscalSummary { const source = obj(raw); return { orderId: text(source.orderId ?? source.id), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), clientName: source.clientName == null ? null : String(source.clientName), document: source.document == null ? null : String(source.document), address: source.address == null ? null : String(source.address), productName: source.productName == null ? null : String(source.productName), quantity: num(source.quantity), total: num(source.total ?? source.totalAmount), paymentMethod: source.paymentMethod == null ? null : String(source.paymentMethod), salesRep: source.salesRep == null ? null : String(source.salesRep), status: text(source.status, "NAO_SOLICITADO") }; }
export function normalizeFiscalList(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeFiscal); }
export function fetchFiscalSummary(orderId: string) { return apiGet<unknown>(`/orders/${orderId}/fiscal-summary`).then(normalizeFiscal); }
export function fetchFiscalItems() { return apiGet<unknown>("/orders?fiscal=true").then(normalizeFiscalList); }
export function updateFiscalData(orderId: string, input: Record<string, unknown>) { return apiPatch<unknown>(`/orders/${orderId}/fiscal-data`, input).then(normalizeFiscal); }
export function updateFiscalStatus(orderId: string, status: string) { return apiPatch<unknown>(`/orders/${orderId}/fiscal-status`, { status }).then(normalizeFiscal); }
