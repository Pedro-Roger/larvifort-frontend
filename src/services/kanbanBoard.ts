import type { StatusTarefa, TaskColumn } from "./tasks";

type TaskColumnIdentity = Pick<TaskColumn, "id"> & {
  status?: StatusTarefa;
};

type TaskIdentity = {
  columnId?: string | null;
  status: StatusTarefa;
};

export function taskBelongsToColumn(
  task: TaskIdentity,
  column: TaskColumnIdentity,
): boolean {
  if (task.columnId) return task.columnId === column.id;
  return column.status !== undefined && task.status === column.status;
}
