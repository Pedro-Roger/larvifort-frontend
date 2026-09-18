export type AppointmentSettings = { projectId: string; columnId: string };
const STORAGE_KEY = "larvifort:appointment-settings:v1";
export const defaultAppointmentSettings: AppointmentSettings = { projectId: "", columnId: "" };
export function loadAppointmentSettings(): AppointmentSettings {
  if (typeof window === "undefined") return defaultAppointmentSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppointmentSettings;
    const parsed = JSON.parse(raw) as Partial<AppointmentSettings>;
    return { projectId: typeof parsed.projectId === "string" ? parsed.projectId : "", columnId: typeof parsed.columnId === "string" ? parsed.columnId : "" };
  } catch { return defaultAppointmentSettings; }
}
export function saveAppointmentSettings(settings: AppointmentSettings): AppointmentSettings {
  const normalized = { projectId: settings.projectId, columnId: settings.columnId };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
