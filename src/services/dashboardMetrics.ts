import type { StatusTarefa } from "./tasks";

export type ActivitySummary = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
};

export function summarizeActivities(
  activities: Array<{ status: StatusTarefa }>,
): ActivitySummary {
  const completed = activities.filter((activity) => activity.status === "CONCLUIDO").length;
  const inProgress = activities.filter((activity) => activity.status === "EM_ANDAMENTO").length;
  const pending = activities.filter(
    (activity) => activity.status === "BACKLOG" || activity.status === "EM_REVISAO",
  ).length;
  const total = activities.length;

  return {
    total,
    pending,
    inProgress,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
