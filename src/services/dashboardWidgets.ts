import type { MetricPeriod, MetricType } from "./metrics";

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
  const id = [
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
