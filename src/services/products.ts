import { apiGet, apiPatch, apiPost } from "./api";

export type Product = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  defaultPrice: number | null;
  active: boolean;
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function number(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeProduct(raw: unknown): Product {
  const envelope = object(raw);
  const source = object(envelope.data ?? raw);
  return {
    id: String(source.id ?? ""),
    name: String(source.name ?? source.productName ?? "Produto"),
    code: source.code == null ? null : String(source.code),
    unit: String(source.unit ?? source.measureUnit ?? "MILHEIRO"),
    defaultPrice: number(source.defaultPrice ?? source.price),
    active: source.active !== false && source.status !== "INACTIVE",
  };
}

export function normalizeProducts(raw: unknown): Product[] {
  const envelope = object(raw);
  const data = envelope.data ?? raw;
  const source = object(data);
  const items = Array.isArray(data)
    ? data
    : Array.isArray(source.items)
      ? source.items
      : [];
  return items.map(normalizeProduct);
}

export function fetchProducts() {
  return apiGet<unknown>("/products").then(normalizeProducts);
}

export function createProduct(input: Omit<Product, "id">) {
  return apiPost<unknown>("/products", input).then(normalizeProduct);
}

export function updateProduct(id: string, input: Omit<Product, "id">) {
  return apiPatch<unknown>(`/products/${id}`, input).then(normalizeProduct);
}
