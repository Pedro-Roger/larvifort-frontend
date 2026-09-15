import assert from "node:assert/strict";
import test from "node:test";
import { toRuleApiInput, normalizeBoardRule } from "./ruleModel.ts";

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
    type: "CUSTOM",
    name: "Esconder valor",
    description: "",
    enabled: false,
    config: { hideValue: true },
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  });
});
