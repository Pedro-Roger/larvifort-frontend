export type TaskPageQuery = {
  projetoId?: string;
  columnId?: string;
  page?: number;
  limit?: number;
  search?: string;
};

export function buildTaskPageQuery(params: TaskPageQuery): string {
  const query = new URLSearchParams();
  if (params.projetoId) query.set("projetoId", params.projetoId);
  if (params.columnId) query.set("columnId", params.columnId);
  query.set("page", String(Math.max(1, Math.floor(params.page ?? 1))));
  query.set("limit", String(Math.min(100, Math.max(1, Math.floor(params.limit ?? 20)))));
  if (params.search?.trim()) query.set("search", params.search.trim());
  const value = query.toString();
  return value ? `?${value}` : "";
}
