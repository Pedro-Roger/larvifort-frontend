import type { Projeto } from "./tasks";

const STORAGE_PREFIX = "larvifort:kanban:project";

export function getKanbanProjectStorageKey(userIdentity: string | number): string {
  return `${STORAGE_PREFIX}:${String(userIdentity)}`;
}

export function readStoredKanbanProjectId(
  storage: Pick<Storage, "getItem">,
  userIdentity: string | number,
): string | null {
  return storage.getItem(getKanbanProjectStorageKey(userIdentity));
}

export function resolveInitialKanbanProjectId(
  projetos: Projeto[],
  storedProjectId: string | null,
): string {
  if (storedProjectId && projetos.some((projeto) => projeto.id === storedProjectId)) {
    return storedProjectId;
  }

  return projetos[0]?.id ?? "";
}
