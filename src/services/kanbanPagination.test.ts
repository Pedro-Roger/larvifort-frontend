import test from "node:test";
import assert from "node:assert/strict";
import { buildTaskPageQuery } from "./kanbanPagination.ts";

test("monta a consulta paginada de tarefas por coluna", () => {
  assert.equal(
    buildTaskPageQuery({
      projetoId: "board-1",
      columnId: "column-1",
      page: 2,
      limit: 20,
      search: "mobile",
    }),
    "?projetoId=board-1&columnId=column-1&page=2&limit=20&search=mobile",
  );
});
