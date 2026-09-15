import test from "node:test";
import assert from "node:assert/strict";
import { taskBelongsToColumn } from "./kanbanBoard.ts";

test("associa a tarefa à coluna persistida pelo columnId", () => {
  assert.equal(
    taskBelongsToColumn(
      { columnId: "column-backlog", status: "EM_ANDAMENTO" },
      { id: "column-backlog" },
    ),
    true,
  );
  assert.equal(
    taskBelongsToColumn(
      { columnId: "column-other", status: "BACKLOG" },
      { id: "column-backlog" },
    ),
    false,
  );
});

test("mantém compatibilidade com tarefa antiga sem columnId", () => {
  assert.equal(
    taskBelongsToColumn(
      { columnId: null, status: "EM_ANDAMENTO" },
      { id: "column-progress", status: "EM_ANDAMENTO" },
    ),
    true,
  );
});
