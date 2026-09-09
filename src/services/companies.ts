import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model Empresa + model
// GrupoComercial + enum StatusEmpresa). O backend ainda não entrega /companies
// — este service contrata o shape e normaliza respostas tolerantes a { data }
// aninhado (mesmo padrão do service de clients/dashboard).

export const EMPRESA_STATUSES = ["ATIVA", "PROSPECT", "INATIVA"] as const;

export type EmpresaStatus = (typeof EMPRESA_STATUSES)[number];

export type Empresa = {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  status: EmpresaStatus;
  grupoId: string | null;
  grupoName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmpresaInput = {
  name: string;
  cnpj?: string | null;
  city?: string | null;
  status?: EmpresaStatus;
  grupoId?: string | null;
};

export type GrupoComercial = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type GrupoComercialInput = {
  name: string;
  color?: string;
};

export type GrupoComercialWithEmpresas = GrupoComercial & {
  empresas: Empresa[];
};

export type EmpresasPage = {
  items: Empresa[];
  total: number;
  page: number;
  pageSize: number;
};

export type GruposPage = {
  items: GrupoComercial[];
  total: number;
  page: number;
  pageSize: number;
};

export type FetchEmpresasParams = {
  page?: number;
  pageSize?: number;
  status?: EmpresaStatus;
  search?: string;
  grupoId?: string;
};

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function num(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asStatus(value: unknown): EmpresaStatus {
  const raw =
    typeof value === "string" ? value.toUpperCase().replace(/-/g, "_") : "";
  return EMPRESA_STATUSES.includes(raw as EmpresaStatus)
    ? (raw as EmpresaStatus)
    : "PROSPECT";
}

const GRADIENT_CLASSES = [
  "from-sky-500 to-sky-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
] as const;

export function pickGrupoColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % GRADIENT_CLASSES.length;
  return GRADIENT_CLASSES[index];
}

export function normalizeEmpresa(raw: unknown): Empresa {
  const e = asObject(raw);
  // Tolerar aninhamento { grupo: { name } } ou { grupoName }
  const grupoObj = asObject(e.grupo);
  const grupoName = str(e.grupoName) || str(grupoObj.name) || null;

  return {
    id: str(e.id) ?? "",
    name: str(e.name) ?? "",
    cnpj: str(e.cnpj),
    city: str(e.city),
    status: asStatus(e.status),
    grupoId: str(e.grupoId),
    grupoName,
    createdAt: str(e.createdAt) ?? "",
    updatedAt: str(e.updatedAt) ?? "",
  };
}

export function normalizeGrupoComercial(raw: unknown): GrupoComercial {
  const g = asObject(raw);
  return {
    id: str(g.id) ?? "",
    name: str(g.name) ?? "",
    color: str(g.color) || pickGrupoColor(str(g.name) ?? ""),
    createdAt: str(g.createdAt) ?? "",
    updatedAt: str(g.updatedAt) ?? "",
  };
}

export function normalizeGrupoComercialWithEmpresas(
  raw: unknown
): GrupoComercialWithEmpresas {
  const g = asObject(raw);
  const base = normalizeGrupoComercial(g);
  const empresasRaw = Array.isArray(g.empresas) ? g.empresas : [];
  return {
    ...base,
    empresas: empresasRaw.map(normalizeEmpresa),
  };
}

export function normalizeEmpresasPage(raw: unknown): EmpresasPage {
  const envelope = asObject(raw);
  const source =
    "data" in envelope &&
    typeof envelope.data === "object" &&
    envelope.data !== null
      ? asObject(envelope.data)
      : envelope;

  const itemsRaw = Array.isArray(source.items)
    ? (source.items as unknown[])
    : Array.isArray(source)
      ? (source as unknown[])
      : [];

  const items = itemsRaw.map(normalizeEmpresa);
  const total = num(source.total) || items.length;
  const page = num(source.page) || 1;
  const pageSize = num(source.pageSize) || items.length || 10;

  return { items, total, page, pageSize };
}

export function normalizeGruposPage(raw: unknown): GruposPage {
  const envelope = asObject(raw);
  const source =
    "data" in envelope &&
    typeof envelope.data === "object" &&
    envelope.data !== null
      ? asObject(envelope.data)
      : envelope;

  const itemsRaw = Array.isArray(source.items)
    ? (source.items as unknown[])
    : Array.isArray(source)
      ? (source as unknown[])
      : [];

  const items = itemsRaw.map(normalizeGrupoComercial);
  const total = num(source.total) || items.length;
  const page = num(source.page) || 1;
  const pageSize = num(source.pageSize) || items.length || 10;

  return { items, total, page, pageSize };
}

// ---------- Empresas ----------

export function fetchEmpresas(
  params: FetchEmpresasParams = {}
): Promise<EmpresasPage> {
  const query = new URLSearchParams();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.max(1, Math.floor(params.pageSize ?? 50));
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  if (params.status) query.set("status", params.status);
  if (params.grupoId) query.set("grupoId", params.grupoId);
  if (params.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }
  const qs = query.toString();
  return apiGet<unknown>(`/companies${qs ? `?${qs}` : ""}`).then(
    normalizeEmpresasPage
  );
}

export function createEmpresa(input: EmpresaInput): Promise<Empresa> {
  return apiPost<unknown>("/companies", input).then(normalizeEmpresa);
}

export function updateEmpresa(
  id: string,
  input: EmpresaInput
): Promise<Empresa> {
  return apiPatch<unknown>(`/companies/${id}`, input).then(normalizeEmpresa);
}

export function deleteEmpresa(id: string): Promise<void> {
  return apiDelete<void>(`/companies/${id}`);
}

// ---------- Grupos Comerciais ----------

export function fetchGruposComerciais(): Promise<GrupoComercial[]> {
  return apiGet<unknown>("/companies/groups").then((raw) => {
    const envelope = asObject(raw);
    const source =
      "data" in envelope &&
      typeof envelope.data === "object" &&
      envelope.data !== null
        ? asObject(envelope.data)
        : envelope;
    const itemsRaw = Array.isArray(source.items)
      ? (source.items as unknown[])
      : Array.isArray(source)
        ? (source as unknown[])
        : [];
    return itemsRaw.map(normalizeGrupoComercial);
  });
}

export function createGrupoComercial(
  input: GrupoComercialInput
): Promise<GrupoComercial> {
  return apiPost<unknown>("/companies/groups", input).then(
    normalizeGrupoComercial
  );
}

export function deleteGrupoComercial(id: string): Promise<void> {
  return apiDelete<void>(`/companies/groups/${id}`);
}

// ---------- Helpers de UI ----------

export function empresaStatusLabel(status: EmpresaStatus): string {
  switch (status) {
    case "ATIVA":
      return "Ativa";
    case "PROSPECT":
      return "Prospect";
    case "INATIVA":
      return "Inativa";
  }
}

export const EMPRESA_STATUS_CLASSES: Record<EmpresaStatus, string> = {
  ATIVA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROSPECT: "bg-amber-50 text-amber-700 border-amber-200",
  INATIVA: "bg-slate-100 text-slate-500 border-slate-200",
};
