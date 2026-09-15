export type Subtask = {
  id: string;
  titulo: string;
  status: 'BACKLOG' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDO';
  progresso: number;
  parentId: string | null;
  assigneeId: string | null;
};

function objectOf(raw: unknown): Record<string, unknown> {
  return typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
}

export function normalizeSubtask(raw: unknown): Subtask {
  const value = objectOf(raw);
  const status = String(value.status ?? 'BACKLOG') as Subtask['status'];
  return {
    id: String(value.id ?? ''),
    titulo: String(value.titulo ?? value.title ?? ''),
    status,
    progresso: Number(value.progresso ?? value.progress ?? (status === 'CONCLUIDO' ? 100 : 0)),
    parentId: value.parentId == null ? null : String(value.parentId),
    assigneeId: value.assigneeId == null ? null : String(value.assigneeId),
  };
}
