import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import { normalizeList } from "./normalizeList";
import { buildTaskPageQuery, type TaskPageQuery } from "./kanbanPagination";
import {
  normalizeBoardRule,
  toRuleApiInput,
  toRuleApiPatch,
  type BoardRule,
  type BoardRuleInput,
} from "./ruleModel";
export type { BoardRule, BoardRuleInput } from "./ruleModel";
export { normalizeList } from "./normalizeList";

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
  columnId?: string | null;
  titulo: string;
  referenceNumber?: number | null;
  referenceCode?: string | null;
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
  clienteId?: string | null;
  clienteName?: string | null;
  orderId?: string | null;
  orderNumber?: string | null;
  orderTotal?: number | null;
  subtasksCount?: number;
  completedSubtasksCount?: number;
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

export type TaskPage = {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type TaskInput = {
  projetoId: string;
  columnId?: string | null;
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
  clienteId?: string | null;
  tipo?: "GERAL" | "COMPROMISSO" | "PEDIDO" | "ORCAMENTO";
  orderId?: string | null;
  orderNumber?: string | null;
  orderTotal?: number | null;
};

export type TaskStatusUpdate = {
  status: StatusTarefa;
  columnId?: string | null;
  progresso?: number;
};

export type Projeto = {
  id: string;
  name: string;
  taskPrefix?: string | null;
  taskSequence?: number;
  teamId?: string | null;
  responsibleId?: string | null;
  teamName?: string | null;
  responsibleName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskColumn = {
  id: string;
  boardId: string;
  status?: StatusTarefa;
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

  const rawSubtasks = Array.isArray(t.subtasks)
    ? (t.subtasks as unknown[])
    : Array.isArray(t.subtarefas)
    ? (t.subtarefas as unknown[])
    : Array.isArray(t.childTasks)
    ? (t.childTasks as unknown[])
    : [];

  const subtasksCount = rawSubtasks.length;
  const completedSubtasksCount = rawSubtasks.filter((s) => {
    const item = typeof s === "object" && s !== null ? (s as Record<string, unknown>) : {};
    return item.status === "CONCLUIDO" || item.progresso === 100 || item.progress === 100;
  }).length;

  const calculatedProgresso =
    subtasksCount > 0
      ? Math.round((completedSubtasksCount / subtasksCount) * 100)
      : num(t.progresso) ?? num(t.progress);

  return {
    id: str(t.id) ?? "",
    projetoId: str(t.projetoId) ?? "",
    columnId: str(t.columnId),
    titulo: str(t.titulo) ?? str(t.title) ?? "",
    referenceNumber:
      typeof t.referenceNumber === "number" ? t.referenceNumber : null,
    referenceCode: str(t.referenceCode),
    descricao: str(t.descricao) ?? str(t.description),
    status: asStatusTarefa(t.status),
    prioridade: asPrioridade(t.prioridade) ?? asPrioridade(t.priority),
    progresso: calculatedProgresso,
    tags: asArray<string>(t.tags),
    prazo: str(t.prazo) ?? str(t.dueDate),
    estimativaH: typeof t.estimativaH === "number" ? t.estimativaH : null,
    assigneeId: str(t.assigneeId),
    assigneeName,
    assigneeInitials,
    parentId: str(t.parentId) || null,
    clienteId: str(t.clienteId),
    clienteName: str(t.clienteName),
    orderId: str(t.orderId),
    orderNumber: str(t.orderNumber),
    orderTotal: typeof t.orderTotal === "number" ? t.orderTotal : null,
    subtasksCount,
    completedSubtasksCount,
    createdAt: str(t.createdAt) ?? "",
    updatedAt: str(t.updatedAt) ?? "",
  };
}

export function normalizeProjeto(raw: unknown): Projeto {
  const p = asObject(raw);
  const team = asObject(p.team);
  const responsible = asObject(p.responsible);
  const responsibleName =
    `${str(responsible.firstName) ?? ""} ${str(responsible.lastName) ?? ""}`.trim();
  return {
    id: str(p.id) ?? "",
    name: str(p.name) ?? "",
    taskPrefix: str(p.taskPrefix) ?? "TK",
    taskSequence: num(p.taskSequence, -1),
    teamId: str(p.teamId),
    responsibleId: str(p.responsibleId),
    teamName: str(p.teamName) ?? str(team.name),
    responsibleName: str(p.responsibleName) ?? (responsibleName || null),
    createdAt: str(p.createdAt) ?? "",
    updatedAt: str(p.updatedAt) ?? "",
  };
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
    const obj =
      typeof raw === "object" && raw !== null ? (raw as RawTaskDetail) : {};
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
    normalizeList(raw, normalizeTask),
  );
}

export function fetchTasksPage(params: TaskPageQuery): Promise<TaskPage> {
  return apiGet<unknown>(`/tasks${buildTaskPageQuery(params)}`).then((raw) => {
    const envelope =
      typeof raw === "object" && raw !== null
        ? (raw as { data?: unknown; meta?: Partial<TaskPage> })
        : {};
    const items = normalizeList(raw, normalizeTask);
    const meta = envelope.meta ?? {};
    const page = typeof meta.page === "number" ? meta.page : (params.page ?? 1);
    const limit =
      typeof meta.limit === "number" ? meta.limit : (params.limit ?? 20);
    const total = typeof meta.total === "number" ? meta.total : items.length;
    const totalPages =
      typeof meta.totalPages === "number"
        ? meta.totalPages
        : Math.ceil(total / Math.max(1, limit));
    return { items, page, limit, total, totalPages };
  });
}

export function createTask(input: TaskInput): Promise<Task> {
  return apiPost<unknown>("/tasks", input).then(normalizeTask);
}

export function updateTaskStatus(
  id: string,
  update: TaskStatusUpdate,
): Promise<Task> {
  return apiPatch<unknown>(`/tasks/${id}/status`, update).then(normalizeTask);
}

export function updateTask(
  id: string,
  input: Partial<TaskInput>,
): Promise<Task> {
  return apiPatch<unknown>(`/tasks/${id}`, input).then(normalizeTask);
}

export function deleteTask(id: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/${id}`).then(() => undefined);
}

export function uploadTaskAttachment(
  taskId: string,
  file: File,
): Promise<TaskAttachment> {
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

export function deleteTaskAttachment(
  taskId: string,
  attachmentId: string,
): Promise<void> {
  return apiDelete<unknown>(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  ).then(() => undefined);
}

export function fetchProjetos(): Promise<Projeto[]> {
  return apiGet<unknown>("/tasks/projects").then((raw) => {
    return normalizeList(raw, normalizeProjeto);
  });
}

export function createColumn(
  boardId: string,
  input: { title: string; color: string; statusKey?: string; order?: number },
): Promise<TaskColumn> {
  return apiPost<unknown>(`/tasks/boards/${boardId}/columns`, input).then(
    (raw: unknown) => {
      return raw as TaskColumn;
    },
  );
}

export function deleteColumn(
  columnId: string,
  moveToColumnId: string,
): Promise<void> {
  return apiDelete<unknown>(`/tasks/columns/${columnId}`, {
    body: { moveToColumnId },
  }).then(() => undefined);
}

export function fetchColumns(boardId: string): Promise<TaskColumn[]> {
  return apiGet<unknown>(`/tasks/boards/${boardId}/columns`).then((raw) =>
    normalizeList(raw, (item) => item as TaskColumn),
  );
}

export function updateColumn(
  columnId: string,
  input: {
    title?: string;
    color?: string;
    order?: number;
    triggerAction?: string;
  },
): Promise<TaskColumn> {
  return apiPatch<unknown>(`/tasks/columns/${columnId}`, input).then(
    (raw: unknown) => raw as TaskColumn,
  );
}

export function reorderColumns(
  boardId: string,
  columnOrders: { id: string; order: number }[],
): Promise<void> {
  return apiPatch<unknown>(`/tasks/boards/${boardId}/columns/reorder`, {
    columnOrders,
  }).then(() => undefined);
}

// ========== Board Rules ==========

export function fetchBoardRules(boardId: string): Promise<BoardRule[]> {
  return apiGet<unknown>(`/tasks/boards/${boardId}/rules`).then((raw) =>
    normalizeList(raw, normalizeBoardRule),
  );
}

export function createBoardRule(
  boardId: string,
  input: BoardRuleInput,
): Promise<BoardRule> {
  return apiPost<unknown>(
    `/tasks/boards/${boardId}/rules`,
    toRuleApiInput(boardId, input),
  ).then(normalizeBoardRule);
}

export function updateBoardRule(
  ruleId: string,
  input: Partial<BoardRuleInput>,
): Promise<BoardRule> {
  return apiPatch<unknown>(
    `/tasks/rules/${ruleId}`,
    toRuleApiPatch(input),
  ).then(normalizeBoardRule);
}

export function deleteBoardRule(ruleId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/rules/${ruleId}`).then(() => undefined);
}

export function reorderBoardRules(
  boardId: string,
  ruleOrders: { id: string; order: number }[],
): Promise<void> {
  return apiPatch<unknown>(`/tasks/boards/${boardId}/rules/reorder`, {
    ruleOrders,
  }).then(() => undefined);
}

// ========== Board Automations ==========

export type AutomationTrigger =
  | "TASK_CREATED"
  | "TASK_MOVED"
  | "TASK_COMPLETED"
  | "TASK_ASSIGNED"
  | "DUE_DATE_APPROACHING"
  | "COLUMN_WIP_EXCEEDED"
  | "SCHEDULED"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_COMPLETED";

export type AutomationAction =
  | "MOVE_TASK"
  | "ASSIGN_USER"
  | "SET_PRIORITY"
  | "ADD_TAG"
  | "SEND_NOTIFICATION"
  | "CREATE_CHILD_TASK"
  | "UPDATE_FIELD"
  | "WEBHOOK"
  | "CREATE_TASK_FROM_APPOINTMENT";

export type BoardAutomation = {
  id: string;
  boardId: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, unknown>;
  actions: Array<{
    type: AutomationAction;
    config: Record<string, unknown>;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type BoardAutomationInput = Omit<
  BoardAutomation,
  "id" | "createdAt" | "updatedAt"
>;

export function fetchBoardAutomations(
  boardId: string,
): Promise<BoardAutomation[]> {
  return apiGet<unknown>(`/tasks/boards/${boardId}/automations`).then((raw) =>
    normalizeList(raw, (item) => item as BoardAutomation),
  );
}

export function createBoardAutomation(
  boardId: string,
  input: BoardAutomationInput,
): Promise<BoardAutomation> {
  return apiPost<unknown>(`/tasks/boards/${boardId}/automations`, input).then(
    (raw: unknown) => raw as BoardAutomation,
  );
}

export function updateBoardAutomation(
  automationId: string,
  input: Partial<BoardAutomationInput>,
): Promise<BoardAutomation> {
  return apiPatch<unknown>(`/tasks/automations/${automationId}`, input).then(
    (raw: unknown) => raw as BoardAutomation,
  );
}

export function deleteBoardAutomation(automationId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/automations/${automationId}`).then(
    () => undefined,
  );
}

export function reorderBoardAutomations(
  boardId: string,
  automationOrders: { id: string; order: number }[],
): Promise<void> {
  return apiPatch<unknown>(`/tasks/boards/${boardId}/automations/reorder`, {
    automationOrders,
  }).then(() => undefined);
}

export function testBoardAutomation(
  automationId: string,
  testPayload?: Record<string, unknown>,
): Promise<{ success: boolean; logs: string[] }> {
  return apiPost<unknown>(
    `/tasks/automations/${automationId}/test`,
    testPayload || {},
  ).then((raw: unknown) => raw as { success: boolean; logs: string[] });
}

export type TransferTaskInput = {
  targetBoardId: string;
  targetColumnId?: string;
  mode: "MOVE" | "CHILD_TASK";
  note?: string;
};

export function transferTask(
  taskId: string,
  input: TransferTaskInput,
): Promise<{ originalTask: Task; targetTask?: Task }> {
  return apiPost<{ originalTask: unknown; targetTask?: unknown }>(
    `/tasks/${taskId}/transfer`,
    input,
  ).then((res) => ({
    originalTask: normalizeTask(res.originalTask),
    targetTask: res.targetTask ? normalizeTask(res.targetTask) : undefined,
  }));
}

export function createProjeto(input: {
  name: string;
  teamId?: string;
  responsibleId?: string | null;
  taskPrefix?: string;
}): Promise<Projeto> {
  return apiPost<unknown>("/tasks/projects", input).then(normalizeProjeto);
}

export function deleteProjeto(id: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/projects/${id}`).then(() => undefined);
}

// ========== Board Templates (Opt-in) ==========

export type TemplateField = {
  key: string;
  label: string;
  value: string;
  type: "text" | "textarea" | "select" | "number" | "date";
  options?: string[];
  required: boolean;
};

export type BoardTemplate = {
  id: string;
  boardId: string;
  name: string;
  description: string;
  enabled: boolean;
  status: StatusTarefa;
  priority: Prioridade;
  tags: string[];
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
};

export type BoardTemplateInput = Omit<
  BoardTemplate,
  "id" | "createdAt" | "updatedAt"
>;

export function fetchBoardTemplates(boardId: string): Promise<BoardTemplate[]> {
  return apiGet<unknown>(`/tasks/boards/${boardId}/templates`).then((raw) =>
    normalizeList(raw, (item) => item as BoardTemplate),
  );
}

export function createBoardTemplate(
  boardId: string,
  input: BoardTemplateInput,
): Promise<BoardTemplate> {
  return apiPost<unknown>(`/tasks/boards/${boardId}/templates`, input).then(
    (raw: unknown) => raw as BoardTemplate,
  );
}

export function updateBoardTemplate(
  templateId: string,
  input: Partial<BoardTemplateInput>,
): Promise<BoardTemplate> {
  return apiPatch<unknown>(`/tasks/templates/${templateId}`, input).then(
    (raw: unknown) => raw as BoardTemplate,
  );
}

export function deleteBoardTemplate(templateId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/templates/${templateId}`).then(
    () => undefined,
  );
}

export function reorderBoardTemplates(
  boardId: string,
  templateOrders: { id: string; order: number }[],
): Promise<void> {
  return apiPatch<unknown>(`/tasks/boards/${boardId}/templates/reorder`, {
    templateOrders,
  }).then(() => undefined);
}

export function applyBoardTemplate(
  templateId: string,
  boardId: string,
  taskOverrides?: Partial<Task>,
): Promise<Task> {
  return apiPost<unknown>(`/tasks/templates/${templateId}/apply`, {
    ...taskOverrides,
    projetoId: boardId,
  }).then((raw: unknown) => normalizeTask(raw as Task));
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

export function mapTaskToCard(
  task: Task,
  options: { hideClient?: boolean; hideValue?: boolean } = {},
): {
  id: string;
  title: string;
  client: string;
  progress: number;
  subtasksCount?: number;
  completedSubtasksCount?: number;
  tags: string[];
  assignee: { initials: string; name: string; color: string };
  dueDate: string;
  priority: "alta" | "media" | "baixa";
  value?: number | null;
  parentId?: string | null;
} {
  return {
    id: task.id,
    title: task.referenceCode
      ? `${task.referenceCode} · ${task.titulo}`
      : task.titulo,
    client: options.hideClient ? "" : (task.clienteName ?? ""),
    progress: task.progresso,
    subtasksCount: task.subtasksCount,
    completedSubtasksCount: task.completedSubtasksCount,
    tags: task.tags,
    assignee:
      task.assigneeName && task.assigneeInitials
        ? {
            initials: task.assigneeInitials,
            name: task.assigneeName,
            color: "blue",
          }
        : { initials: "??", name: "Não atribuído", color: "slate" },
    dueDate: task.prazo || "",
    priority: task.prioridade.toLowerCase() as "alta" | "media" | "baixa",
    value: options.hideValue ? null : task.orderTotal,
    parentId: task.parentId,
  };
}
