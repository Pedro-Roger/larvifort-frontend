import assert from "node:assert/strict";
import test from "node:test";
import { formatMonthLabel } from "./formatMonthLabel.ts";

test("formata o mês exibido no cabeçalho a partir da data informada", () => {
  assert.equal(formatMonthLabel(new Date("2026-09-15T12:00:00Z")), "Setembro / 2026");
});
