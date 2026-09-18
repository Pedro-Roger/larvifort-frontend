import { apiGet, apiPatch, apiPost } from "./api";

export type Delivery = { id: string; orderId: string; orderNumber: string | null; clientName: string | null; driverName: string | null; vehiclePlate: string | null; route: string | null; estimatedAt: string | null; status: string; problem: string | null };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
export function normalizeDelivery(raw: unknown): Delivery { const source = obj(raw); return { id: text(source.id), orderId: text(source.orderId), orderNumber: source.orderNumber == null ? null : String(source.orderNumber), clientName: source.clientName == null ? null : String(source.clientName), driverName: source.driverName == null ? null : String(source.driverName), vehiclePlate: source.vehiclePlate == null ? null : String(source.vehiclePlate), route: source.route == null ? null : String(source.route), estimatedAt: source.estimatedAt == null ? null : String(source.estimatedAt), status: text(source.status, "AGUARDANDO_MOTORISTA"), problem: source.problem == null ? null : String(source.problem) }; }
export function normalizeDeliveries(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeDelivery); }
export function fetchDeliveries() { return apiGet<unknown>("/deliveries").then(normalizeDeliveries); }
export function createDelivery(orderId: string, input: Record<string, unknown> = {}) { return apiPost<unknown>(`/orders/${orderId}/delivery`, input).then(normalizeDelivery); }
export function assignDriver(id: string, input: { driverId: string; vehicleId?: string }) { return apiPatch<unknown>(`/deliveries/${id}/assign-driver`, input).then(normalizeDelivery); }
export function updateDeliveryStatus(id: string, status: string, problem?: string) { return apiPatch<unknown>(`/deliveries/${id}/status`, { status, problem }).then(normalizeDelivery); }
export function addDeliveryProof(id: string, input: Record<string, unknown>) { return apiPost<unknown>(`/deliveries/${id}/proof`, input).then(normalizeDelivery); }
