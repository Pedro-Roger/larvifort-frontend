import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model Cliente + enum
// StatusLead). O backend ainda não entrega /clients — este service contrata o
// shape e normaliza respostas tolerantes a { data } aninhado (mesmo padrão do
// service de dashboard/auth).

export const CLIENT_STATUSES = [
  "NOVO",
  "SEM_CONTATO",
  "EM_NEGOCIACAO",
  "CLIENTE_ATIVO",
] as const;

export type ClienteStatus = (typeof CLIENT_STATUSES)[number];

export type Cliente = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  cpfCnpj: string | null;
  statusLead: ClienteStatus;
  origem: string | null;
  pais: string | null;
  cidade: string | null;
  uf: string | null;
  endereco: string | null;
  observacoes: string | null;
  empresaId: string | null;
  laminaAgua: number;
  qtdViveiros: number;
  densidade: number;
  producaoMedia: number;
  temBercario: boolean;
  qtdBercarios: number;
  volumeBercarios: number;
  alimentadorAutomatico: boolean;
  createdAt: string;
  updatedAt: string;
};

// Payload de criação/edição — campos obrigatórios mínimos + opcionais do modal.
export type ClienteInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  cpfCnpj?: string | null;
  statusLead?: ClienteStatus;
  origem?: string | null;
  pais?: string | null;
  cidade?: string | null;
  uf?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  laminaAgua?: number | null;
  qtdViveiros?: number | null;
  densidade?: number | null;
  producaoMedia?: number | null;
  temBercario?: boolean;
  qtdBercarios?: number | null;
  volumeBercarios?: number | null;
  alimentadorAutomatico?: boolean;
};

export type ClientsPage = {
  items: Cliente[];
  total: number;
  page: number;
  pageSize: number;
};

export type FetchClientsParams = {
  page?: number;
  pageSize?: number;
  status?: ClienteStatus;
  search?: string;
};

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function bool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  return false;
}

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asStatus(value: unknown): ClienteStatus {
  const raw =
    typeof value === "string" ? value.toUpperCase().replace(/-/g, "_") : "";
  return CLIENT_STATUSES.includes(raw as ClienteStatus)
    ? (raw as ClienteStatus)
    : "NOVO";
}

export function normalizeClient(raw: unknown): Cliente {
  const c = asObject(raw);
  return {
    id: str(c.id) ?? "",
    firstName: str(c.firstName) ?? "",
    lastName: str(c.lastName) ?? "",
    email: str(c.email),
    phone: str(c.phone),
    birthdate: str(c.birthdate),
    cpfCnpj: str(c.cpfCnpj),
    statusLead: asStatus(c.statusLead),
    origem: str(c.origem),
    pais: str(c.pais),
    cidade: str(c.cidade),
    uf: str(c.uf),
    endereco: str(c.endereco),
    observacoes: str(c.observacoes),
    empresaId: str(c.empresaId),
    laminaAgua: num(c.laminaAgua),
    qtdViveiros: num(c.qtdViveiros),
    densidade: num(c.densidade),
    producaoMedia: num(c.producaoMedia),
    temBercario: bool(c.temBercario),
    qtdBercarios: num(c.qtdBercarios),
    volumeBercarios: num(c.volumeBercarios),
    alimentadorAutomatico: bool(c.alimentadorAutomatico),
    createdAt: str(c.createdAt) ?? "",
    updatedAt: str(c.updatedAt) ?? "",
  };
}

/**
 * Normaliza uma resposta bruta de GET /clients em ClientsPage. Aceita payload
 * direto ({ items, total, page, pageSize }) ou aninhado em { data }. Quando o
 * backend entregar a lista embrulhada (ex.: { data: [...] }), `total` cai para
 * items.length — o frontend nunca quebra por shape desconhecido.
 */
export function normalizeClientsPage(raw: unknown): ClientsPage {
  const envelope = asObject(raw);
  const source =
    "data" in envelope && typeof envelope.data === "object" && envelope.data !== null
      ? asObject(envelope.data)
      : envelope;

  const itemsRaw = Array.isArray(source.items)
    ? (source.items as unknown[])
    : Array.isArray(source)
      ? (source as unknown[])
      : [];

  const items = itemsRaw.map(normalizeClient);
  const total = num(source.total) || items.length;
  const page = num(source.page) || 1;
  const pageSize = num(source.pageSize) || items.length || 10;

  return { items, total, page, pageSize };
}

export function fetchClients(params: FetchClientsParams = {}): Promise<ClientsPage> {
  const query = new URLSearchParams();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.max(1, Math.floor(params.pageSize ?? 10));
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }
  const qs = query.toString();
  return apiGet<unknown>(`/clients${qs ? `?${qs}` : ""}`).then(normalizeClientsPage);
}

export function createClient(input: ClienteInput): Promise<Cliente> {
  return apiPost<unknown>("/clients", input).then(normalizeClient);
}

export function updateClient(id: string, input: ClienteInput): Promise<Cliente> {
  return apiPatch<unknown>(`/clients/${id}`, input).then(normalizeClient);
}

export function deleteClient(id: string): Promise<void> {
  return apiDelete<void>(`/clients/${id}`);
}

// ---------- Helpers de UI (exibição na tabela/lista) ----------

export function clientStatusLabel(status: ClienteStatus): string {
  switch (status) {
    case "NOVO":
      return "Novo";
    case "SEM_CONTATO":
      return "Sem Contato";
    case "EM_NEGOCIACAO":
      return "Em Negociação";
    case "CLIENTE_ATIVO":
      return "Cliente Ativo";
  }
}

export function clientInitials(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  const initials = `${a}${b}`.toUpperCase();
  return initials.length > 0 ? initials : "?";
}

const AVATAR_BG_CLASSES = [
  "bg-slate-200 text-slate-600",
  "bg-indigo-100 text-indigo-600",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-700",
] as const;

export function clientAvatarBg(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_BG_CLASSES.length;
  return AVATAR_BG_CLASSES[index];
}

export const STATUS_BADGE_CLASSES: Record<ClienteStatus, string> = {
  NOVO: "bg-purple-50 text-purple-700 border-purple-100",
  SEM_CONTATO: "bg-amber-50 text-amber-700 border-amber-100",
  EM_NEGOCIACAO: "bg-blue-50 text-blue-700 border-blue-100",
  CLIENTE_ATIVO: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export const STATUS_DOT_CLASSES: Record<ClienteStatus, string> = {
  NOVO: "bg-purple-600",
  SEM_CONTATO: "bg-amber-500",
  EM_NEGOCIACAO: "bg-blue-600",
  CLIENTE_ATIVO: "bg-emerald-600",
};