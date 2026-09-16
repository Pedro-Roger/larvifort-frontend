export type OrderSettings = {
  projectId: string;
  columnId: string;
  allowFromTask: boolean;
  defaultProductName: string;
  defaultUnit: string;
  defaultUnitPrice: number;
};

const STORAGE_KEY = "larvifort:order-settings:v1";
export const ORDER_SETTINGS_EVENT = "larvifort:order-settings-changed";

export const defaultOrderSettings: OrderSettings = {
  projectId: "",
  columnId: "",
  allowFromTask: true,
  defaultProductName: "Larvas",
  defaultUnit: "MILHEIRO",
  defaultUnitPrice: 0,
};

function validNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function loadOrderSettings(): OrderSettings {
  if (typeof window === "undefined") return defaultOrderSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOrderSettings;
    const parsed = JSON.parse(raw) as Partial<OrderSettings>;
    return {
      projectId: typeof parsed.projectId === "string" ? parsed.projectId : "",
      columnId: typeof parsed.columnId === "string" ? parsed.columnId : "",
      allowFromTask:
        typeof parsed.allowFromTask === "boolean" ? parsed.allowFromTask : true,
      defaultProductName:
        typeof parsed.defaultProductName === "string" &&
        parsed.defaultProductName.trim()
          ? parsed.defaultProductName
          : "Larvas",
      defaultUnit:
        typeof parsed.defaultUnit === "string" && parsed.defaultUnit.trim()
          ? parsed.defaultUnit
          : "MILHEIRO",
      defaultUnitPrice: validNumber(parsed.defaultUnitPrice),
    };
  } catch {
    return defaultOrderSettings;
  }
}

export function saveOrderSettings(settings: OrderSettings): OrderSettings {
  const normalized: OrderSettings = {
    projectId: settings.projectId,
    columnId: settings.columnId,
    allowFromTask: settings.allowFromTask,
    defaultProductName: settings.defaultProductName.trim() || "Larvas",
    defaultUnit: settings.defaultUnit.trim() || "MILHEIRO",
    defaultUnitPrice: validNumber(settings.defaultUnitPrice),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent(ORDER_SETTINGS_EVENT, { detail: normalized }),
  );
  return normalized;
}
