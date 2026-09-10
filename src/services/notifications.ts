import { apiGet, apiPatch, apiPost, apiDelete } from "@/services/api";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  taskAssigned: boolean;
  taskStatusChanged: boolean;
  systemAlerts: boolean;
  soundEnabled: boolean;
}

export type CreateNotificationInput = Omit<
  Notification,
  "id" | "createdAt" | "read" | "archived" | "userId"
> & {
  id?: string;
  read?: boolean;
  archived?: boolean;
  createdAt?: string;
  userId?: string | number;
};

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  browserNotifications: true,
  taskAssigned: true,
  taskStatusChanged: true,
  systemAlerts: true,
  soundEnabled: false,
};

const STORAGE_KEY_PREFIX = "larvifort:notifications";
const PREFS_KEY_PREFIX = "larvifort:notification_preferences";

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}:${userId}` : STORAGE_KEY_PREFIX;
}

function getPrefsKey(userId?: string): string {
  return userId ? `${PREFS_KEY_PREFIX}:${userId}` : PREFS_KEY_PREFIX;
}

export function getStoredNotifications(userId?: string): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(
  notifications: Notification[],
  userId?: string
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(notifications)
    );
  } catch {
    // Ignore storage write errors (e.g. quota)
  }
}

export function getStoredPreferences(userId?: string): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(getPrefsKey(userId));
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveStoredPreferences(
  prefs: NotificationPreferences,
  userId?: string
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getPrefsKey(userId), JSON.stringify(prefs));
  } catch {
    // Ignore storage write errors
  }
}

// API Integration with local storage fallback
export async function fetchNotifications(
  userId?: string
): Promise<Notification[]> {
  try {
    const data = await apiGet<Notification[]>("/notifications");
    if (Array.isArray(data)) {
      saveStoredNotifications(data, userId);
      return data;
    }
  } catch {
    // Endpoint may not exist on backend yet; use stored
  }
  return getStoredNotifications(userId);
}

export async function markNotificationReadApi(id: string): Promise<void> {
  try {
    await apiPatch(`/notifications/${id}`, { read: true });
  } catch {
    // Best-effort API call
  }
}

export async function markNotificationUnreadApi(id: string): Promise<void> {
  try {
    await apiPatch(`/notifications/${id}`, { read: false });
  } catch {
    // Best-effort API call
  }
}

export async function markAllNotificationsReadApi(): Promise<void> {
  try {
    await apiPost("/notifications/mark-all-read");
  } catch {
    // Best-effort API call
  }
}

export async function archiveNotificationApi(
  id: string,
  archived: boolean = true
): Promise<void> {
  try {
    await apiPatch(`/notifications/${id}`, { archived });
  } catch {
    // Best-effort API call
  }
}

export async function deleteNotificationApi(id: string): Promise<void> {
  try {
    await apiDelete(`/notifications/${id}`);
  } catch {
    // Best-effort API call
  }
}

export async function fetchNotificationPreferencesApi(
  userId?: string
): Promise<NotificationPreferences> {
  try {
    const data = await apiGet<NotificationPreferences>(
      "/notifications/preferences"
    );
    if (data) {
      saveStoredPreferences(data, userId);
      return data;
    }
  } catch {
    // Backend may not have endpoint yet
  }
  return getStoredPreferences(userId);
}

export async function updateNotificationPreferencesApi(
  prefs: NotificationPreferences,
  userId?: string
): Promise<void> {
  saveStoredPreferences(prefs, userId);
  try {
    await apiPatch("/notifications/preferences", prefs);
  } catch {
    // Best-effort API call
  }
}
