import type { MetricAnalysis, MetricPeriod, MetricType } from "./metrics";

export type DashboardWidgetMode = "charts" | "table" | "cards";
export type DashboardWidgetAxis = "value" | "quantity";
export type DashboardWidgetGroup = "period" | "people";

export type DashboardMetricWidget = {
  id: string;
  title: string;
  teamId: string;
  teamName: string;
  userIds: string[];
  type: MetricType;
  typeLabel: string;
  period: MetricPeriod;
  periodLabel: string;
  startDate: string;
  endDate: string;
  target: number;
  mode: DashboardWidgetMode;
  axis: DashboardWidgetAxis;
  group: DashboardWidgetGroup;
  addedAt: string;
  analysisId?: string;
};

export const DASHBOARD_WIDGETS_EVENT = "larvifort:dashboard-widgets-changed";
const STORAGE_KEY = "larvifort:dashboard-widgets:v1";
const MAX_WIDGETS = 12;

function isWidget(value: unknown): value is DashboardMetricWidget {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DashboardMetricWidget>;
  return Boolean(
    item.id &&
      item.title &&
      item.teamId &&
      item.type &&
      item.period &&
      item.mode &&
      item.startDate &&
      item.endDate,
  );
}

export function loadDashboardWidgets(): DashboardMetricWidget[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isWidget) : [];
  } catch {
    return [];
  }
}

function saveDashboardWidgets(widgets: DashboardMetricWidget[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(widgets.slice(0, MAX_WIDGETS)),
  );
  window.dispatchEvent(new Event(DASHBOARD_WIDGETS_EVENT));
}

export function addDashboardWidget(
  input: Omit<DashboardMetricWidget, "id" | "addedAt">,
): DashboardMetricWidget[] {
  if (typeof window === "undefined") return [];
  const id = input.analysisId ? `analysis:${input.analysisId}` : [
    input.teamId,
    input.type,
    input.period,
    input.mode,
    input.axis,
    input.group,
    input.startDate,
    input.endDate,
    input.userIds.join("-"),
  ].join(":");
  const widget: DashboardMetricWidget = {
    ...input,
    id,
    addedAt: new Date().toISOString(),
  };
  const widgets = [widget, ...loadDashboardWidgets().filter((item) => item.id !== id)];
  saveDashboardWidgets(widgets);
  return widgets;
}

function dateRangeFor(period: MetricPeriod) {
  const today = new Date();
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const start = new Date(today);
  if (period === "WEEKLY") start.setDate(today.getDate() - 6);
  if (period === "MONTHLY") start.setDate(1);
  if (period === "YEARLY") start.setMonth(0, 1);
  return { startDate: format(start), endDate: format(today) };
}

function metricTypeForAnalysis(analysis: MetricAnalysis): MetricType {
  switch (analysis.primarySource.id) {
    case "orders.revenue": return "SALES";
    case "appointments.visits": return "VISITS";
    case "clients.new": return "PROSPECTING";
    case "clients.existing": return "RETURN";
    default: return "ACTIVITIES";
  }
}

export function addMetricAnalysisDashboardWidget(analysis: MetricAnalysis): DashboardMetricWidget[] {
  const { startDate, endDate } = dateRangeFor(analysis.period);
  return addDashboardWidget({
    analysisId: analysis.id,
    title: analysis.name,
    teamId: "all",
    teamName: "Todas as equipes",
    userIds: [],
    type: metricTypeForAnalysis(analysis),
    typeLabel: analysis.primarySource.label,
    period: analysis.period,
    periodLabel: { DAILY: "Diário", WEEKLY: "Semanal", MONTHLY: "Mensal", YEARLY: "Anual" }[analysis.period],
    startDate,
    endDate,
    target: analysis.goal?.target ?? 0,
    mode: analysis.visualization === "chart" ? "charts" : analysis.visualization === "table" ? "table" : "cards",
    axis: "value",
    group: "period",
  });
}

export function removeMetricAnalysisWidget(analysisId: string): DashboardMetricWidget[] {
  if (typeof window === "undefined") return [];
  const widgets = loadDashboardWidgets().filter((widget) => widget.analysisId !== analysisId);
  saveDashboardWidgets(widgets);
  return widgets;
}

export function moveDashboardWidget(
  id: string,
  direction: "up" | "down",
): DashboardMetricWidget[] {
  if (typeof window === "undefined") return [];
  const widgets = loadDashboardWidgets();
  const index = widgets.findIndex((item) => item.id === id);
  if (index === -1) return widgets;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= widgets.length) return widgets;

  const reordered = [...widgets];
  const [widget] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, widget);
  saveDashboardWidgets(reordered);
  return reordered;
}

export function removeDashboardWidget(id: string): DashboardMetricWidget[] {
  if (typeof window === "undefined") return [];
  const widgets = loadDashboardWidgets().filter((item) => item.id !== id);
  saveDashboardWidgets(widgets);
  return widgets;
}

export function clearDashboardWidgets() {
  if (typeof window === "undefined") return;
  saveDashboardWidgets([]);
}
