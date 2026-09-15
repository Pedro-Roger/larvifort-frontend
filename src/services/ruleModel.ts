export type BoardRuleType =
  | "AUTO_TRANSITION"
  | "WIP_LIMIT"
  | "AUTO_ASSIGN"
  | "NOTIFICATION"
  | "CUSTOM"
  | "HIDE_CARD"
  | "HIDE_CLIENT"
  | "HIDE_VALUE"
  | "HIDE_STALE";

export type BoardRule = {
  id: string;
  boardId: string;
  type: BoardRuleType;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type BoardRuleInput = Omit<BoardRule, "id" | "createdAt" | "updatedAt">;

type ApiRule = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  scope?: unknown;
  scopeId?: unknown;
  projectId?: unknown;
  columnId?: unknown;
  action?: unknown;
  conditions?: unknown;
  parameters?: unknown;
  priority?: unknown;
  active?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export function toRuleApiInput(boardId: string, input: BoardRuleInput) {
  const config = input.config;
  const columnId = asString(config.columnId) || undefined;
  const assigneeIds = Array.isArray(config.assigneeIds) ? config.assigneeIds : [];
  const firstAssignee = typeof assigneeIds[0] === "string" ? assigneeIds[0] : undefined;

  return {
    name: input.name,
    description: input.description || undefined,
    scope: columnId ? "COLUMN" : "ROLE",
    scopeId: columnId || "USER",
    projectId: boardId,
    columnId: columnId || undefined,
    action: input.type === "NOTIFICATION" ? "TRIGGER_AUTOMATION" : "SET_FIELD",
    conditions: columnId ? { columnId } : {},
    parameters: {
      ruleType: input.type,
      config,
      fields: input.type === "AUTO_ASSIGN" && firstAssignee
        ? { assigneeId: firstAssignee }
        : input.type === "AUTO_TRANSITION" && asString(config.targetColumnId)
          ? { columnId: asString(config.targetColumnId) }
          : {},
      ...(input.type === "NOTIFICATION" && asString(config.automationId)
        ? { automationId: asString(config.automationId) }
        : {}),
    },
    priority: 0,
    active: input.enabled,
  };
}

export function toRuleApiPatch(input: Partial<BoardRuleInput>) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description || undefined;
  if (input.enabled !== undefined) patch.active = input.enabled;
  if (input.config !== undefined) {
    patch.parameters = {
      ruleType: input.type ?? "CUSTOM",
      config: input.config,
    };
  }
  return patch;
}

export function normalizeBoardRule(raw: unknown): BoardRule {
  const value = asObject(raw) as ApiRule;
  const parameters = asObject(value.parameters);
  const config = asObject(parameters.config);
  const action = asString(value.action);
  const storedType = asString(parameters.ruleType);
  const supportedTypes = ["AUTO_TRANSITION", "WIP_LIMIT", "AUTO_ASSIGN", "NOTIFICATION", "CUSTOM", "HIDE_CARD", "HIDE_CLIENT", "HIDE_VALUE", "HIDE_STALE"];
  const type: BoardRuleType = supportedTypes.includes(storedType)
    ? storedType as BoardRuleType
    : action === "TRIGGER_AUTOMATION" ? "NOTIFICATION" : "CUSTOM";

  return {
    id: asString(value.id),
    boardId: asString(value.projectId),
    type,
    name: asString(value.name),
    description: asString(value.description),
    enabled: value.active !== false,
    config,
    createdAt: asString(value.createdAt),
    updatedAt: asString(value.updatedAt),
  };
}

type VisibilityTask = {
  assigneeId: string | null;
  status: string;
  updatedAt: string;
};

export function evaluateBoardVisibility(
  task: VisibilityTask,
  rules: BoardRule[],
  userRole: "ADMIN" | "USER",
  now = new Date(),
): { hidden: boolean; hideClient: boolean; hideValue: boolean } {
  const result = { hidden: false, hideClient: false, hideValue: false };
  const daysStopped = Math.max(0, Math.floor((now.getTime() - new Date(task.updatedAt).getTime()) / 86_400_000));

  const matchingRules = rules.filter((rule) => {
    if (!rule.enabled) return false;
    const config = rule.config;
    if (config.role && config.role !== userRole) return false;
    if (config.assigneeId && config.assigneeId !== task.assigneeId) return false;
    if (config.status && config.status !== task.status) return false;
    return true;
  });
  const combination = matchingRules.find((rule) => rule.config.combination)?.config.combination;
  const applicableRules = combination === "ANY" ? matchingRules.slice(0, 1) : matchingRules;

  for (const rule of applicableRules) {
    const config = rule.config;

    if (rule.type === "HIDE_CARD") result.hidden = true;
    if (rule.type === "HIDE_CLIENT") result.hideClient = true;
    if (rule.type === "HIDE_VALUE") result.hideValue = true;
    if (rule.type === "HIDE_STALE") {
      const minDays = typeof config.minDays === "number" ? config.minDays : Number(config.minDays);
      if (Number.isFinite(minDays) && daysStopped >= Math.max(0, minDays)) result.hidden = true;
    }
  }

  return result;
}
