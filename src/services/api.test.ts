import test from "node:test";
import assert from "node:assert/strict";
import { buildApiRequestInit } from "./api.ts";

test("não reutiliza cache em chamadas dinâmicas da API", () => {
  assert.equal(buildApiRequestInit({ method: "GET" }).cache, "no-store");
});
