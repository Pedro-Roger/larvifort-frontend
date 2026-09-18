import { apiGet, apiPatch, apiPost } from "./api";

export type PostSale = { id: string; orderId: string; orderNumber: string | null; clientName: string | null; responsibleName: string | null; status: string; productCondition: string | null; problem: string | null; nextAction: string | null; dueDate: string | null };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
export function normalizePostSale(raw: unknown): PostSale { const source = obj(raw); return { id: text(source.id), orderId: text(source.orderId), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), clientName: source.clientName == null ? null : String(source.clientName), responsibleName: source.responsibleName == null ? null : String(source.responsibleName), status: text(source.status, "AGUARDANDO_CONTATO"), productCondition: source.productCondition == null ? null : String(source.productCondition), problem: source.problem == null ? null : String(source.problem), nextAction: source.nextAction == null ? null : String(source.nextAction), dueDate: source.dueDate == null ? null : String(source.dueDate) }; }
export function normalizePostSales(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizePostSale); }
export function fetchPostSales() { return apiGet<unknown>("/post-sales").then(normalizePostSales); }
export function createPostSale(orderId: string, input: Record<string, unknown> = {}) { return apiPost<unknown>(`/orders/${orderId}/post-sale`, input).then(normalizePostSale); }
export function updatePostSale(id: string, input: Record<string, unknown>) { return apiPatch<unknown>(`/post-sales/${id}`, input).then(normalizePostSale); }
export function completePostSale(id: string, input: Record<string, unknown> = {}) { return apiPost<unknown>(`/post-sales/${id}/complete`, input).then(normalizePostSale); }
