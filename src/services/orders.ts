import { apiDelete, apiGet, apiPost, apiPatch } from "./api";
import { normalizeList } from "./normalizeList";

export type OrderPhase =
  | "DRAFT"
  | "ABERTO"
  | "PENDING"
  | "APROVADO"
  | "FATURADO"
  | "ENTREGUE"
  | "CANCELLED";
export type OrderStatus = "ORCAMENTO" | "PEDIDO";

export type OrderItem = {
  id: string;
  productId: string | null;
  productCode: string | null;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes: string | null;
};

export type Order = {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  phase: OrderPhase;
  clientId: string;
  clientName: string | null;
  clientCpfCnpj: string | null;
  companyId: string | null;
  companyName: string | null;
  projectId: string | null;
  salesRepUserId: string | null;
  salesRepName: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  deliveryInstructions: string | null;
  shippingAddress: Record<string, unknown> | null;
  notes: string | null;
  orderDate: string;
  deliveryDate: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderStats = {
  totalOrders: number;
  totalOrcamentos: number;
  totalPedidos: number;
  totalCancelled: number;
  totalRevenue: number;
  averageTicket: number;
  phaseCounts: Record<string, number>;
};

export type CreateOrderInput = {
  clientId: string;
  companyId?: string | null;
  projectId?: string | null;
  status?: OrderStatus;
  phase?: OrderPhase;
  deliveryDate?: string | null;
  deliveryInstructions?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  items: Array<{
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    notes?: string | null;
  }>;
  linkTaskId?: string | null;
};

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function obj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeOrder(raw: unknown): Order {
  const source =
    obj(raw) && "data" in (raw as Record<string, unknown>)
      ? (raw as { data: unknown }).data
      : raw;
  const o = obj(source) ?? {};
  return {
    id: str(o.id) ?? "",
    orderNumber: str(o.orderNumber),
    status: (str(o.status) as OrderStatus) ?? "PEDIDO",
    phase: (str(o.phase) as OrderPhase) ?? "ABERTO",
    clientId: str(o.clientId) ?? "",
    clientName: str(o.clientName),
    clientCpfCnpj: str(o.clientCpfCnpj),
    companyId: str(o.companyId),
    companyName: str(o.companyName),
    projectId: str(o.projectId),
    salesRepUserId: str(o.salesRepUserId),
    salesRepName: str(o.salesRepName),
    subtotal: num(o.subtotal),
    discount: num(o.discount),
    shippingCost: num(o.shippingCost),
    taxAmount: num(o.taxAmount),
    totalAmount: num(o.totalAmount),
    deliveryInstructions: str(o.deliveryInstructions),
    shippingAddress: obj(o.shippingAddress),
    notes: str(o.notes),
    orderDate: str(o.orderDate) ?? "",
    deliveryDate: str(o.deliveryDate),
    items: normalizeList(o.items, (item) => {
      const i = obj(item) ?? {};
      return {
        id: str(i.id) ?? "",
        productId: str(i.productId),
        productCode: str(i.productCode),
        productName: str(i.productName) ?? "Produto",
        unit: str(i.unit) ?? "MILHEIRO",
        quantity: num(i.quantity),
        unitPrice: num(i.unitPrice),
        discount: num(i.discount),
        totalPrice: num(i.totalPrice),
        notes: str(i.notes),
      };
    }),
    createdAt: str(o.createdAt) ?? "",
    updatedAt: str(o.updatedAt) ?? "",
  };
}

export function fetchOrders(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    phase?: OrderPhase;
  } = {},
) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  });
  return apiGet<unknown>(`/orders${qs.size ? `?${qs}` : ""}`).then((raw) => {
    const source = obj(raw);
    return {
      items: normalizeList(
        source?.items ?? source?.data ?? raw,
        normalizeOrder,
      ),
      total: num(source?.total),
      page: num(source?.page) || 1,
      totalPages: num(source?.totalPages) || 1,
    };
  });
}

export function fetchOrderStats() {
  return apiGet<unknown>("/orders/stats").then((raw) => {
    const source = obj(raw) ?? {};
    return {
      totalOrders: num(source.totalOrders),
      totalOrcamentos: num(source.totalOrcamentos),
      totalPedidos: num(source.totalPedidos),
      totalCancelled: num(source.totalCancelled),
      totalRevenue: num(source.totalRevenue),
      averageTicket: num(source.averageTicket),
      phaseCounts: (obj(source.phaseCounts) as Record<string, number>) ?? {},
    } satisfies OrderStats;
  });
}

export function createOrder(input: CreateOrderInput) {
  return apiPost<unknown>("/orders", input).then(normalizeOrder);
}

export function updateOrder(
  id: string,
  input: Partial<CreateOrderInput> & {
    phase?: OrderPhase;
    status?: OrderStatus;
  },
) {
  return apiPatch<unknown>(`/orders/${id}`, input).then(normalizeOrder);
}

export function deleteOrder(id: string) {
  return apiDelete<unknown>(`/orders/${id}`).then(() => undefined);
}
