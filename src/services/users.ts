import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model User + model
// Team + enum Role). O backend ainda não entrega /users nem /teams — este
// service contrata o shape e normaliza respostas tolerantes a { data }
// aninhado.

export const ROLE_VALUES = ["ADMIN", "USER"] as const;

export type Role = (typeof ROLE_VALUES)[number];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
  teamId: string | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: Role;
  teamId?: string | null;
};

export type UserUpdate = Partial<UserInput>;

export type Team = {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamInput = {
  name: string;
};

export type TeamUpdate = Partial<TeamInput>;

// ---------- Normalization ----------

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function bool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value !== 0;
  return false;
}

function asRole(value: unknown): Role {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  return ROLE_VALUES.includes(raw as Role) ? (raw as Role) : "USER";
}

export function normalizeUser(raw: unknown): User {
  const u = typeof raw === "object" && raw !== null
    ? (raw as Record<string, unknown>)
    : {};

  const team = typeof u.team === "object" && u.team !== null
    ? (u.team as Record<string, unknown>)
    : {};

  return {
    id: str(u.id) ?? "",
    firstName: str(u.firstName) ?? "",
    lastName: str(u.lastName) ?? "",
    email: str(u.email) ?? "",
    role: asRole(u.role),
    active: bool(u.active),
    teamId: str(u.teamId),
    teamName: str(team.name),
    createdAt: str(u.createdAt) ?? "",
    updatedAt: str(u.updatedAt) ?? "",
  };
}

export function normalizeTeam(raw: unknown): Team {
  const t = typeof raw === "object" && raw !== null
    ? (raw as Record<string, unknown>)
    : {};

  const members = Array.isArray(t.members) ? t.members : [];

  return {
    id: str(t.id) ?? "",
    name: str(t.name) ?? "",
    memberCount: members.length,
    createdAt: str(t.createdAt) ?? "",
    updatedAt: str(t.updatedAt) ?? "",
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

export function fetchUsers(params?: {
  teamId?: string;
  role?: Role;
  search?: string;
  active?: boolean;
}): Promise<User[]> {
  const query = new URLSearchParams();
  if (params?.teamId) query.set("teamId", params.teamId);
  if (params?.role) query.set("role", params.role);
  if (params?.search) query.set("search", params.search);
  if (params?.active !== undefined) query.set("active", String(params.active));
  const qs = query.toString();
  return apiGet<unknown>(`/users${qs ? `?${qs}` : ""}`).then((raw) =>
    normalizeList(raw, normalizeUser)
  );
}

export function fetchTeams(): Promise<Team[]> {
  return apiGet<unknown>("/teams").then((raw) => normalizeList(raw, normalizeTeam));
}

export function createUser(input: UserInput): Promise<User> {
  return apiPost<unknown>("/users", input).then(normalizeUser);
}

export function createTeam(input: TeamInput): Promise<Team> {
  return apiPost<unknown>("/teams", input).then(normalizeTeam);
}

export function updateUser(id: string, input: UserUpdate): Promise<User> {
  return apiPatch<unknown>(`/users/${id}`, input).then(normalizeUser);
}

export function updateTeam(id: string, input: TeamUpdate): Promise<Team> {
  return apiPatch<unknown>(`/teams/${id}`, input).then(normalizeTeam);
}

export function deleteUser(id: string): Promise<void> {
  return apiDelete<unknown>(`/users/${id}`).then(() => undefined);
}

export function deleteTeam(id: string): Promise<void> {
  return apiDelete<unknown>(`/teams/${id}`).then(() => undefined);
}

// ---------- Helpers de UI ----------

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  USER: "Usuário",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export const ROLE_BADGE_CLASSES: Record<Role, string> = {
  ADMIN: "bg-violet-100 text-violet-700",
  USER: "bg-slate-100 text-slate-600",
};

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

export function userAvatarBg(role: Role): string {
  return role === "ADMIN" ? "bg-violet-50" : "bg-sky-50";
}

export function userAvatarTextColor(role: Role): string {
  return role === "ADMIN" ? "text-violet-600" : "text-sky-600";
}