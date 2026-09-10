import assert from "node:assert/strict";
import test from "node:test";
import { summarizeActivities } from "./dashboardMetrics.ts";

test("summarizes activity totals by status", () => {
  const summary = summarizeActivities([
    { status: "BACKLOG" },
    { status: "EM_ANDAMENTO" },
    { status: "EM_REVISAO" },
    { status: "CONCLUIDO" },
    { status: "CONCLUIDO" },
  ]);

  assert.deepEqual(summary, {
    total: 5,
    pending: 2,
    inProgress: 1,
    completed: 2,
    completionRate: 40,
  });
});
