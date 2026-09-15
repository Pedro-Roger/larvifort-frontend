import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { normalizeSubtask, type Subtask } from './subtaskModel';
export { normalizeSubtask } from './subtaskModel';
export type { Subtask } from './subtaskModel';

export function fetchSubtasks(taskId: string): Promise<Subtask[]> {
  return apiGet<unknown>(`/tasks/${taskId}/subtasks`).then((raw) =>
    Array.isArray(raw) ? raw.map(normalizeSubtask) : []
  );
}

export function createSubtask(taskId: string, input: { titulo: string; assigneeId?: string | null }): Promise<Subtask> {
  return apiPost<unknown>(`/tasks/${taskId}/subtasks`, input).then(normalizeSubtask);
}

export function updateSubtask(taskId: string, subtaskId: string, input: Partial<Pick<Subtask, 'titulo' | 'status' | 'progresso' | 'assigneeId'>>): Promise<Subtask> {
  return apiPatch<unknown>(`/tasks/${taskId}/subtasks/${subtaskId}`, input).then(normalizeSubtask);
}

export function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  return apiDelete<unknown>(`/tasks/${taskId}/subtasks/${subtaskId}`).then(() => undefined);
}
