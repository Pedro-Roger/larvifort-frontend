import test from "node:test";
import assert from "node:assert/strict";
import { CARD_DRAG_TYPE, COLUMN_DRAG_TYPE, getDragKind } from "./kanbanDragDrop.ts";

test("identifica card e coluna como operações de arraste diferentes", () => {
  assert.equal(getDragKind([CARD_DRAG_TYPE]), "card");
  assert.equal(getDragKind([COLUMN_DRAG_TYPE]), "column");
  assert.equal(getDragKind(["text/plain"]), null);
});
