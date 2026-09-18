import { apiGet, apiPatch, apiPost } from "./api";

export type Driver = { id: string; name: string; phone: string | null; document: string | null; region: string | null; status: string };
export type Vehicle = { id: string; plate: string; type: string | null; status: string };
const obj = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : Array.isArray(obj(value).items) ? obj(value).items as unknown[] : [];
const text = (value: unknown, fallback = "") => value == null ? fallback : String(value);
export function normalizeDriver(raw: unknown): Driver { const source = obj(raw); return { id: text(source.id), name: text(source.name, "Motorista"), phone: source.phone == null ? null : String(source.phone), document: source.document == null ? null : String(source.document), region: source.region == null ? null : String(source.region), status: text(source.status, "AVAILABLE") }; }
export function normalizeVehicle(raw: unknown): Vehicle { const source = obj(raw); return { id: text(source.id), plate: text(source.plate), type: source.type == null ? null : String(source.type), status: text(source.status, "AVAILABLE") }; }
export function normalizeDrivers(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeDriver); }
export function normalizeVehicles(raw: unknown) { return list(obj(raw).data ?? raw).map(normalizeVehicle); }
export function fetchDrivers() { return apiGet<unknown>("/logistics/drivers").then(normalizeDrivers); }
export function fetchVehicles() { return apiGet<unknown>("/logistics/vehicles").then(normalizeVehicles); }
export function createDriver(input: Omit<Driver, "id">) { return apiPost<unknown>("/logistics/drivers", input).then(normalizeDriver); }
export function updateDriver(id: string, input: Omit<Driver, "id">) { return apiPatch<unknown>(`/logistics/drivers/${id}`, input).then(normalizeDriver); }
export function createVehicle(input: Omit<Vehicle, "id">) { return apiPost<unknown>("/logistics/vehicles", input).then(normalizeVehicle); }
export function updateVehicle(id: string, input: Omit<Vehicle, "id">) { return apiPatch<unknown>(`/logistics/vehicles/${id}`, input).then(normalizeVehicle); }
