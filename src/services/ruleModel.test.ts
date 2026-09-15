import assert from "node:assert/strict";
import test from "node:test";
import { toRuleApiInput, normalizeBoardRule } from "./ruleModel.ts";
import { evaluateBoardVisibility } from "./ruleModel.ts";

test("converte regra da modal para o contrato aceito pela API", () => {
  assert.deepEqual(toRuleApiInput("board-1", {
    type: "AUTO_ASSIGN",
    name: "Distribuir novos cards",
    description: "Distribuição do quadro",
    enabled: true,
    config: { columnId: "column-1", assigneeIds: ["user-1"], strategy: "ROUND_ROBIN" },
    boardId: "board-1",
  }), {
    name: "Distribuir novos cards",
    description: "Distribuição do quadro",
    scope: "COLUMN",
    scopeId: "column-1",
    projectId: "board-1",
    columnId: "column-1",
    action: "SET_FIELD",
    conditions: { columnId: "column-1" },
    parameters: { fields: { assigneeId: "user-1" }, ruleType: "AUTO_ASSIGN", config: { columnId: "column-1", assigneeIds: ["user-1"], strategy: "ROUND_ROBIN" } },
    priority: 0,
    active: true,
  });
});

test("normaliza regra persistida para a forma consumida pela modal", () => {
  assert.deepEqual(normalizeBoardRule({
    id: "rule-1",
    name: "Esconder valor",
    description: null,
    scope: "ROLE",
    scopeId: "USER",
    projectId: "board-1",
    columnId: null,
    action: "SET_FIELD",
    conditions: { role: "USER" },
    parameters: { ruleType: "HIDE_VALUE", config: { hideValue: true } },
    priority: 2,
    active: false,
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  }), {
    id: "rule-1",
    boardId: "board-1",
    type: "HIDE_VALUE",
    name: "Esconder valor",
    description: "",
    enabled: false,
    config: { hideValue: true },
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  });
});

test("envia regra de movimentação como ALLOW_MOVE ou DENY_MOVE", () => {
  const apiRule = toRuleApiInput("board-1", {
    type: "DENY_MOVE",
    name: "Usuário não pode concluir",
    description: "",
    enabled: true,
    config: { role: "USER", toColumnId: "done" },
    boardId: "board-1",
  });

  assert.equal(apiRule.action, "DENY_MOVE");
  assert.deepEqual(apiRule.conditions, { role: "USER", toColumnId: "done" });
});

test("envia projeto e usuário alvo como condições selecionáveis", () => {
  const apiRule = toRuleApiInput("board-1", {
    type: "HIDE_CARD",
    name: "Regra por usuário",
    description: "",
    enabled: true,
    config: { projectId: "board-2", userId: "user-2" },
    boardId: "board-1",
  });

  assert.equal(apiRule.projectId, "board-2");
  assert.deepEqual(apiRule.conditions, { userId: "user-2", projectId: "board-2" });
});

test("avalia ocultação de card, cliente, valor e cards parados", () => {
  const task = {
    assigneeId: "user-1",
    status: "EM_ANDAMENTO",
    updatedAt: "2026-09-10T00:00:00.000Z",
  };
  const rules = [
    { type: "HIDE_CLIENT", enabled: true, config: { role: "USER" } },
    { type: "HIDE_VALUE", enabled: true, config: { role: "USER" } },
    { type: "HIDE_STALE", enabled: true, config: { minDays: 3, role: "USER" } },
  ] as never[];

  assert.deepEqual(evaluateBoardVisibility(task, rules, "USER", new Date("2026-09-15T00:00:00.000Z")), {
    hidden: true,
    hideClient: true,
    hideValue: true,
  });
  assert.equal(evaluateBoardVisibility(task, [{ type: "HIDE_CARD", enabled: true, config: { status: "EM_ANDAMENTO" } }] as never[], "ADMIN", new Date("2026-09-15T00:00:00.000Z")).hidden, true);
  assert.deepEqual(evaluateBoardVisibility(task, [
    { type: "HIDE_CLIENT", enabled: true, config: { combination: "ANY" } },
    { type: "HIDE_VALUE", enabled: true, config: { combination: "ANY" } },
  ] as never[], "ADMIN"), { hidden: false, hideClient: true, hideValue: false });
});
