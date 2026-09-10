import test from "node:test";
import assert from "node:assert/strict";
import { normalizeList } from "./normalizeList.ts";

const normalizeTask = (raw: unknown) => raw as { id: string; status: string };

test("normaliza tarefas quando a API responde com envelope paginado", () => {
  const result = normalizeList(
    { data: [{ id: "task-1", titulo: "Atividade", status: "CONCLUIDO" }] },
    normalizeTask,
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "task-1");
  assert.equal(result[0]?.status, "CONCLUIDO");
});

test("normaliza tarefas quando a API responde com array direto", () => {
  const result = normalizeList(
    [{ id: "task-2", titulo: "Outra atividade", status: "BACKLOG" }],
    normalizeTask,
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "task-2");
});
