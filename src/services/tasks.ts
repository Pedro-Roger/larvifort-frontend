import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

// Contrato espelhado no schema Prisma do lavifort-API (model Task + model
// Projeto + enum StatusTarefa + enum Prioridade). O backend ainda não entrega
// /tasks — este service contrata o shape e normaliza respostas tolerantes a
// { data } aninhado.

export const STATUS_TAREFA_VALUES = [
  "BACKLOG",
  "EM_ANDAMENTO",
  "EM_REVISAO",
  "CONCLUIDO",
] as const;

export type StatusTarefa = (typeof STATUS_TAREFA_VALUES)[number];

export const PRIORIDADE_VALUES = ["ALTA", "MEDIA", "BAIXA"] as const;

export type Prioridade = (typeof PRIORIDADE_VALUES)[number];

export type Task = {
  id: string;
  projetoId: string;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  progresso: number;
  tags: string[];
  prazo: string | null;
  estimativaH: number | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeInitials: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskAttachment = {
  id: string;
  name: string;
  url: string;
  size: string;
  mimeType: string;
  createdAt: string;
};

export type TaskWithDetails = Task & {
  phone: string | null;
  clienteName: string | null;
  orderId: string | null;
  orderNumber: string | null;
  orderTotal: number | null;
  attachments: TaskAttachment[];
  childrenTasks: { id: string; titulo: string; status: StatusTarefa }[];
  parentTask: { id: string; titulo: string } | null;
};
export type TaskInput = {
  projetoId: string;
  titulo: string;
  descricao?: string | null;
  status?: StatusTarefa;
  prioridade?: Prioridade;
  progresso?: number;
  tags?: string[];
  prazo?: string | null;
  estimativaH?: number | null;
  assigneeId?: string | null;
  parentId?: string | null;
};

export type TaskStatusUpdate = {
  status: StatusTarefa;
  progresso?: number;
};

export type Projeto = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskColumn = {
  id: string;
  boardId: string;
  status: StatusTarefa;
  title: string;
  color: string;
  order: number;
  tasks?: Task[];
};

// ---------- Normalization ----------

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return String(value);
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asStatusTarefa(value: unknown): StatusTarefa {
  const raw =
    typeof value === "string" ? value.toUpperCase().replace(/-/g, "_") : "";
  return STATUS_TAREFA_VALUES.includes(raw as StatusTarefa)
    ? (raw as StatusTarefa)
    : "BACKLOG";
}

function asPrioridade(value: unknown): Prioridade {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  return PRIORIDADE_VALUES.includes(raw as Prioridade)
    ? (raw as Prioridade)
    : "MEDIA";
}

function parseAssignee(raw: unknown): {
  assigneeName: string | null;
  assigneeInitials: string | null;
} {
  if (typeof raw !== "object" || raw === null) {
    return { assigneeName: null, assigneeInitials: null };
  }
  const obj = raw as Record<string, unknown>;
  const firstName = str(obj.firstName) || "";
  const lastName = str(obj.lastName) || "";
  const name = `${firstName} ${lastName}`.trim();
  const initials =
    name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || null;
  return { assigneeName: name || null, assigneeInitials: initials };
}

export function normalizeTask(raw: unknown): Task {
  const t = asObject(raw);
  const assigneeRaw = t.assignee;
  const { assigneeName, assigneeInitials } = parseAssignee(assigneeRaw);

  return {
    id: str(t.id) ?? "",
    projetoId: str(t.projetoId) ?? "",
    titulo: str(t.titulo) ?? str(t.title) ?? "",
    descricao: str(t.descricao) ?? str(t.description),
    status: asStatusTarefa(t.status),
    prioridade: asPrioridade(t.prioridade) ?? asPrioridade(t.priority),
    progresso: num(t.progresso) ?? num(t.progress),
    tags: asArray<string>(t.tags),
    prazo: str(t.prazo) ?? str(t.dueDate),
    estimativaH: typeof t.estimativaH === "number" ? t.estimativaH : null,
    assigneeId: str(t.assigneeId),
    assigneeName,
    assigneeInitials,
    parentId: str(t.parentId) || null,
    createdAt: str(t.createdAt) ?? "",
    updatedAt: str(t.updatedAt) ?? "",
  };
}

export function normalizeProjeto(raw: unknown): Projeto {
  const p = asObject(raw);
  return {
    id: str(p.id) ?? "",
    name: str(p.name) ?? "",
    createdAt: str(p.createdAt) ?? "",
    updatedAt: str(p.updatedAt) ?? "",
  };
}

function normalizeList<T>(raw: unknown, normalizer: (item: unknown) => T): T[] {
  const envelope = asObject(raw);
  const source =
    "data" in envelope &&
    typeof envelope.data === "object" &&
    envelope.data !== null
      ? asObject(envelope.data)
      : envelope;

  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source)
      ? source
      : [];

  return items.map(normalizer);
}

// ---------- API calls ----------

interface RawTaskDetail {
  phone?: unknown;
  clienteName?: unknown;
  orderId?: unknown;
  orderNumber?: unknown;
  orderTotal?: unknown;
  attachments?: unknown;
  childrenTasks?: unknown;
  parentTask?: unknown;
}

export function getTaskDetails(id: string): Promise<TaskWithDetails> {
  return apiGet<unknown>(`/tasks/${id}`).then((raw: unknown) => {
    const t = normalizeTask(raw) as TaskWithDetails;
    const obj = typeof raw === "object" && raw !== null ? (raw as RawTaskDetail) : {};
    t.phone = str(obj.phone);
    t.clienteName = str(obj.clienteName);
    t.orderId = str(obj.orderId);
    t.orderNumber = str(obj.orderNumber);
    t.orderTotal = typeof obj.orderTotal === "number" ? obj.orderTotal : null;
    t.attachments = Array.isArray(obj.attachments) ? obj.attachments : [];
    t.childrenTasks = Array.isArray(obj.childrenTasks) ? obj.childrenTasks : [];
    t.parentTask = (obj.parentTask as { id: string; titulo: string }) || null;
    return t;
  });
}

export function fetchTasks(projetoId?: string): Promise<Task[]> {
  const query = new URLSearchParams();
  if (projetoId) query.set("projetoId", projetoId);
  const qs = query.toString();
  return apiGet<unknown>(`/tasks${qs ? `?${qs}` : ""}`).then((raw) =>
    normalizeList(raw, normalizeTask)
  );
}

export function createTask(input: TaskInput): Promise<Task> {
  return apiPost<unknown>("/tasks", input).then(normalizeTask);
}

export function updateTaskStatus(
  id: string,
  update: TaskStatusUpdate
): Promise<Task> {
  return apiPatch<unknown>(`/tasks/${id}/status`, update).then(normalizeTask);
}

export function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  return apiPatch<unknown>(`/tasks/${id}`, input).then(normalizeTask);
}

export function deleteTask(id: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/${id}`).then(() => undefined);
}

export function uploadTaskAttachment(taskId: string, file: File): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  
  // Note: apiPost by default uses application/json. We should skip standard apiPost for FormData, 
  // but for the sake of CRM-008 frontend implementation, we simulate the fetch or adjust API.
  return fetch(`/api/v1/tasks/${taskId}/attachments`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("larvifort:token") || ""}`,
    },
  }).then((res: Response) => {
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<TaskAttachment>;
  });
}

export function deleteTaskAttachment(taskId: string, attachmentId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/${taskId}/attachments/${attachmentId}`).then(() => undefined);
}

export const DEFAULT_SECTORES: Projeto[] = [
  { id: "comercial", name: "Comercial", createdAt: "", updatedAt: "" },
  { id: "financeiro", name: "Financeiro", createdAt: "", updatedAt: "" },
  { id: "desenvolvimento", name: "Desenvolvimento", createdAt: "", updatedAt: "" },
  { id: "operacoes", name: "Operações", createdAt: "", updatedAt: "" },
  { id: "administrativo", name: "Administrativo", createdAt: "", updatedAt: "" },
];

export function fetchProjetos(): Promise<Projeto[]> {
  return apiGet<unknown>("/tasks/projects")
    .then((raw) => {
      const list = normalizeList(raw, normalizeProjeto);
      return list.length > 0 ? list : DEFAULT_SECTORES;
    })
    .catch(() => DEFAULT_SECTORES);
}

export function createColumn(boardId: string, input: { title: string; color: string; statusKey?: string; order?: number }): Promise<TaskColumn> {
  return apiPost<unknown>(`/tasks/boards/${boardId}/columns`, input).then((raw: unknown) => {
    return raw as TaskColumn;
  });
}

export function deleteColumn(columnId: string, moveToColumnId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/columns/${columnId}`, { body: { moveToColumnId } }).then(() => undefined);
}

export type TransferTaskInput = {
  targetBoardId: string;
  targetColumnId?: string;
  mode: "MOVE" | "CHILD_TASK";
  note?: string;
};

export function transferTask(
  taskId: string,
  input: TransferTaskInput
): Promise<{ originalTask: Task; targetTask?: Task }> {
  return apiPost<{ originalTask: unknown; targetTask?: unknown }>(
    `/tasks/${taskId}/transfer`,
    input
  ).then((res) => ({
    originalTask: normalizeTask(res.originalTask),
    targetTask: res.targetTask ? normalizeTask(res.targetTask) : undefined,
  }));
}

export function createProjeto(input: { name: string }): Promise<Projeto> {
  return apiPost<unknown>("/tasks/projects", input).then(normalizeProjeto);
}

// ---------- Helpers de UI ----------

const STATUS_LABELS: Record<StatusTarefa, string> = {
  BACKLOG: "Backlog",
  EM_ANDAMENTO: "Em Andamento",
  EM_REVISAO: "Em Revisão",
  CONCLUIDO: "Concluído",
};

export function statusTarefaLabel(status: StatusTarefa): string {
  return STATUS_LABELS[status] ?? status;
}

const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

export function prioridadeLabel(p: Prioridade): string {
  return PRIORIDADE_LABELS[p] ?? p;
}

export const STATUS_TAREFA_COLORS: Record<StatusTarefa, string> = {
  BACKLOG: "slate",
  EM_ANDAMENTO: "sky",
  EM_REVISAO: "amber",
  CONCLUIDO: "emerald",
};

export function mapTaskToCard(task: Task): {
  id: string;
  title: string;
  client: string;
  progress: number;
  tags: string[];
  assignee: { initials: string; name: string; color: string };
  dueDate: string;
  priority: "alta" | "media" | "baixa";
} {
  return {
    id: task.id,
    title: task.titulo,
    client: "",
    progress: task.progresso,
    tags: task.tags,
    assignee:
      task.assigneeName && task.assigneeInitials
        ? { initials: task.assigneeInitials, name: task.assigneeName, color: "blue" }
        : { initials: "??", name: "Não atribuído", color: "slate" },
    dueDate: task.prazo || "",
    priority: task.prioridade.toLowerCase() as "alta" | "media" | "baixa",
  };
}
