export const CARD_DRAG_TYPE = "application/x-larvifort-card";
export const COLUMN_DRAG_TYPE = "application/x-larvifort-column";

export function getDragKind(types: string[]): "card" | "column" | null {
  if (types.includes(CARD_DRAG_TYPE)) return "card";
  if (types.includes(COLUMN_DRAG_TYPE)) return "column";
  return null;
}
