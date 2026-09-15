import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model Appointment +
// enum TipoCompromisso). O backend ainda não entrega /appointments — este
// service contrata o shape e normaliza respostas tolerantes a { data }
// aninhado.

export const TIPO_COMPROMISSO_VALUES = ["REUNIAO", "VISITA"] as const;

export type TipoCompromisso = (typeof TIPO_COMPROMISSO_VALUES)[number];

export type Appointment = {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  data: string; // ISO date string (YYYY-MM-DD)
  horario: string | null; // HH:mm
  endereco: string | null;
  observacoes: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  empresaId: string | null;
  empresaNome: string | null;
  ownerId: string | null;
  projectId: string | null;
  columnId: string | null;
  assigneeId: string | null;
  ownerNome: string | null;
  createdAt: string;
  updatedAt: string;
  // Check-in fields (FASE 7)
  checkinAt: string | null;
  checkinLat: number | null;
  checkinLng: number | null;
  checkinAccuracy: number | null;
};

export type AppointmentInput = {
  tipo: TipoCompromisso;
  titulo: string;
  data: string; // YYYY-MM-DD
  horario?: string | null; // HH:mm
  endereco?: string | null;
  observacoes?: string | null;
  clienteId?: string | null;
  empresaId?: string | null;
  ownerId?: string | null;
  projectId: string;
  columnId?: string | null;
  assigneeId?: string | null;
};

export type AppointmentUpdate = Partial<AppointmentInput>;

// ---------- Normalization ----------

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function asTipoCompromisso(value: unknown): TipoCompromisso {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  return TIPO_COMPROMISSO_VALUES.includes(raw as TipoCompromisso)
    ? (raw as TipoCompromisso)
    : "REUNIAO";
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function normalizeAppointment(raw: unknown): Appointment {
  const a = typeof raw === "object" && raw !== null
    ? (raw as Record<string, unknown>)
    : {};

  const cliente = typeof a.cliente === "object" && a.cliente !== null
    ? (a.cliente as Record<string, unknown>)
    : {};
  const empresa = typeof a.empresa === "object" && a.empresa !== null
    ? (a.empresa as Record<string, unknown>)
    : {};
  const owner = typeof a.owner === "object" && a.owner !== null
    ? (a.owner as Record<string, unknown>)
    : {};

  return {
    id: str(a.id) ?? "",
    tipo: asTipoCompromisso(a.tipo),
    titulo: str(a.titulo) ?? "",
    data: str(a.data) ?? "",
    horario: str(a.horario),
    endereco: str(a.endereco),
    observacoes: str(a.observacoes),
    clienteId: str(a.clienteId),
    clienteNome: str(cliente.nome) ?? str(cliente.razaoSocial) ?? str(cliente.firstName),
    empresaId: str(a.empresaId),
    empresaNome: str(empresa.nome) ?? str(empresa.name),
    ownerId: str(a.ownerId),
    projectId: str(a.projectId),
    columnId: str(a.columnId),
    assigneeId: str(a.assigneeId),
    ownerNome: str(owner.nome) ?? str(owner.name),
    createdAt: str(a.createdAt) ?? "",
    updatedAt: str(a.updatedAt) ?? "",
    checkinAt: str(a.checkinAt),
    checkinLat: num(a.checkinLat),
    checkinLng: num(a.checkinLng),
    checkinAccuracy: num(a.checkinAccuracy),
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

export function fetchAppointments(params?: {
  startDate?: string;
  endDate?: string;
  tipo?: TipoCompromisso;
}): Promise<Appointment[]> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.tipo) query.set("tipo", params.tipo);
  const qs = query.toString();
  return apiGet<unknown>(`/appointments${qs ? `?${qs}` : ""}`).then((raw) =>
    normalizeList(raw, normalizeAppointment)
  );
}

export function createAppointment(input: AppointmentInput): Promise<Appointment> {
  return apiPost<unknown>("/appointments", input).then(normalizeAppointment);
}

export function updateAppointment(
  id: string,
  input: AppointmentUpdate
): Promise<Appointment> {
  return apiPatch<unknown>(`/appointments/${id}`, input).then(normalizeAppointment);
}

export interface CheckinInput {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function checkinAppointment(
  id: string,
  input: CheckinInput
): Promise<Appointment> {
  return apiPatch<unknown>(`/appointments/${id}/checkin`, input).then(normalizeAppointment);
}

export function deleteAppointment(id: string): Promise<void> {
  return apiDelete<unknown>(`/appointments/${id}`).then(() => undefined);
}

// ---------- Helpers de UI ----------

const TIPO_LABELS: Record<TipoCompromisso, string> = {
  REUNIAO: "Reunião",
  VISITA: "Visita ao Cliente",
};

export function tipoCompromissoLabel(tipo: TipoCompromisso): string {
  return TIPO_LABELS[tipo] ?? tipo;
}

export const TIPO_COLORS: Record<TipoCompromisso, { bg: string; text: string; border: string }> = {
  REUNIAO: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-300" },
  VISITA: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-300" },
};

export function tipoCompromissoColor(tipo: TipoCompromisso): {
  bg: string;
  text: string;
  border: string;
} {
  return TIPO_COLORS[tipo] ?? TIPO_COLORS.REUNIAO;
}

export function formatAppointmentDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export function formatAppointmentTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  return `${h}:${m}`;
}
