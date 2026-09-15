import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSubtask } from "./subtaskModel.ts";

test("normaliza subtarefa com status e progresso", () => {
  assert.deepEqual(normalizeSubtask({
    id: "sub-1",
    titulo: "Ligar para cliente",
    status: "CONCLUIDO",
    progresso: 100,
    parentId: "task-1",
  }), {
    id: "sub-1",
    titulo: "Ligar para cliente",
    status: "CONCLUIDO",
    progresso: 100,
    parentId: "task-1",
    assigneeId: null,
  });
});
