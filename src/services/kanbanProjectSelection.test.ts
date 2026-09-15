import assert from "node:assert/strict";
import test from "node:test";
import {
  getKanbanProjectStorageKey,
  readStoredKanbanProjectId,
  resolveInitialKanbanProjectId,
} from "./kanbanProjectSelection.ts";

const projetos = [
  { id: "projeto-a", name: "Projeto A", createdAt: "", updatedAt: "" },
  { id: "projeto-b", name: "Projeto B", createdAt: "", updatedAt: "" },
];

test("restaura o projeto selecionado pelo usuário em vez do primeiro projeto", () => {
  const storage = new Map<string, string>([
    [getKanbanProjectStorageKey("usuario-1"), "projeto-b"],
  ]);

  const storedProjectId = readStoredKanbanProjectId(
    { getItem: (key) => storage.get(key) ?? null },
    "usuario-1",
  );

  assert.equal(resolveInitialKanbanProjectId(projetos, storedProjectId), "projeto-b");
});

test("usa o primeiro projeto quando a seleção persistida não existe mais", () => {
  assert.equal(resolveInitialKanbanProjectId(projetos, "projeto-removido"), "projeto-a");
});
