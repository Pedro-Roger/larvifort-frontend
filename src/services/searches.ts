import { apiGet, apiPost, apiDelete } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model FieldSearch +
// enum Uniformidade). O backend ainda não entrega /searches — este
// service contrata o shape e normaliza respostas tolerantes a { data }
// aninhado.

export const UNIFORMIDADE_VALUES = ["OTIMA", "BOA", "REGULAR", "RUIM"] as const;

export type Uniformidade = (typeof UNIFORMIDADE_VALUES)[number];

export type FieldSearch = {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataPesquisa: string; // ISO date string
  responsavelId: string | null;
  responsavelNome: string | null;
  larvas: string[];
  maioriaLarvifort: boolean;
  parouLarvifort: boolean;
  motivosSaida: string[];
  outroMotivo: string | null;
  uniformidadeBercario: Uniformidade | null;
  uniformidadeCultivo: Uniformidade | null;
  sobrevBercario: number | null;
  sobrevCultivo: number | null;
  resultadosUltimoCiclo: string | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FieldSearchInput = {
  clienteId: string;
  dataPesquisa: string; // YYYY-MM-DD
  responsavelId?: string | null;
  larvas: string[];
  maioriaLarvifort: boolean;
  parouLarvifort: boolean;
  motivosSaida: string[];
  outroMotivo?: string | null;
  uniformidadeBercario?: Uniformidade | null;
  uniformidadeCultivo?: Uniformidade | null;
  sobrevBercario?: number | null;
  sobrevCultivo?: number | null;
  resultadosUltimoCiclo?: string | null;
  observacoes?: string | null;
};

// ---------- Normalization ----------

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function bool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value !== 0;
  return false;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asUniformidade(value: unknown): Uniformidade | null {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  return UNIFORMIDADE_VALUES.includes(raw as Uniformidade)
    ? (raw as Uniformidade)
    : null;
}

export function normalizeFieldSearch(raw: unknown): FieldSearch {
  const s = typeof raw === "object" && raw !== null
    ? (raw as Record<string, unknown>)
    : {};

  const cliente = typeof s.cliente === "object" && s.cliente !== null
    ? (s.cliente as Record<string, unknown>)
    : {};
  const responsavel = typeof s.responsavel === "object" && s.responsavel !== null
    ? (s.responsavel as Record<string, unknown>)
    : {};

  return {
    id: str(s.id) ?? "",
    clienteId: str(s.clienteId) ?? "",
    clienteNome: str(cliente.nome) ?? str(cliente.razaoSocial) ?? "",
    dataPesquisa: str(s.dataPesquisa) ?? "",
    responsavelId: str(s.responsavelId),
    responsavelNome: str(responsavel.nome) ?? str(responsavel.firstName) ?? "",
    larvas: asArray<string>(s.larvas),
    maioriaLarvifort: bool(s.maioriaLarvifort),
    parouLarvifort: bool(s.parouLarvifort),
    motivosSaida: asArray<string>(s.motivosSaida),
    outroMotivo: str(s.outroMotivo),
    uniformidadeBercario: asUniformidade(s.uniformidadeBercario),
    uniformidadeCultivo: asUniformidade(s.uniformidadeCultivo),
    sobrevBercario: num(s.sobrevBercario),
    sobrevCultivo: num(s.sobrevCultivo),
    resultadosUltimoCiclo: str(s.resultadosUltimoCiclo),
    observacoes: str(s.observacoes),
    createdAt: str(s.createdAt) ?? "",
    updatedAt: str(s.updatedAt) ?? "",
  };
}

function normalizeList<T>(raw: unknown, normalizer: (item: unknown) => T): T[] {
  const envelope = typeof raw === "object" && raw !== null
    ? (raw as Record<string, unknown>)
    : {};
  const source =
    "data" in envelope &&
    typeof envelope.data === "object" &&
    envelope.data !== null
      ? (envelope.data as Record<string, unknown>)
      : envelope;

  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source)
      ? source
      : [];

  return items.map(normalizer);
}

// ---------- API calls ----------

export function fetchSearches(params?: {
  clienteId?: string;
  startDate?: string;
  endDate?: string;
  responsavelId?: string;
}): Promise<FieldSearch[]> {
  const query = new URLSearchParams();
  if (params?.clienteId) query.set("clienteId", params.clienteId);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.responsavelId) query.set("responsavelId", params.responsavelId);
  const qs = query.toString();
  return apiGet<unknown>(`/searches${qs ? `?${qs}` : ""}`).then((raw) =>
    normalizeList(raw, normalizeFieldSearch)
  );
}

export function createSearch(input: FieldSearchInput): Promise<FieldSearch> {
  return apiPost<unknown>("/searches", input).then(normalizeFieldSearch);
}

export function deleteSearch(id: string): Promise<void> {
  return apiDelete<unknown>(`/searches/${id}`).then(() => undefined);
}

// ---------- Helpers de UI ----------

const UNIFORMIDADE_LABELS: Record<Uniformidade, string> = {
  OTIMA: "Ótima",
  BOA: "Boa",
  REGULAR: "Regular",
  RUIM: "Ruim",
};

export function uniformidadeLabel(u: Uniformidade | null): string {
  if (!u) return "—";
  return UNIFORMIDADE_LABELS[u] ?? u;
}

export const UNIFORMIDADE_CLASSES: Record<Uniformidade, string> = {
  OTIMA: "bg-emerald-50 text-emerald-700",
  BOA: "bg-sky-50 text-sky-700",
  REGULAR: "bg-amber-50 text-amber-700",
  RUIM: "bg-red-50 text-red-600",
};

export function uniformidadeClass(u: Uniformidade | null): string {
  if (!u) return "bg-slate-50 text-slate-500";
  return UNIFORMIDADE_CLASSES[u] ?? "bg-slate-50 text-slate-500";
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function survivalColor(value: number | null, tipo: "bercario" | "cultivo"): string {
  if (value === null) return "text-slate-500";
  if (tipo === "bercario") {
    return value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-red-500";
  }
  return value >= 80 ? "text-emerald-600" : value >= 65 ? "text-amber-600" : "text-red-500";
}