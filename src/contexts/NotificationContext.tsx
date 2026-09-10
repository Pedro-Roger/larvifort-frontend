"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  Notification,
  NotificationPreferences,
  CreateNotificationInput,
  fetchNotifications,
  saveStoredNotifications,
  markNotificationReadApi,
  markNotificationUnreadApi,
  markAllNotificationsReadApi,
  archiveNotificationApi,
  deleteNotificationApi,
  fetchNotificationPreferencesApi,
  updateNotificationPreferencesApi,
  getStoredNotifications,
  getStoredPreferences,
} from "@/services/notifications";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  addNotification: (input: CreateNotificationInput) => string;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearArchived: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const NOTIFICATION_EVENT = "larvifort:notification";

function readStoredNotifications(userId?: string): Notification[] {
  return getStoredNotifications(userId);
}

function readStoredPrefs(userId?: string): NotificationPreferences {
  return getStoredPreferences(userId);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id != null ? String(user.id) : undefined;

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    readStoredNotifications(userId)
  );
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    readStoredPrefs(userId)
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [notifs, prefs] = await Promise.all([
        fetchNotifications(userId),
        fetchNotificationPreferencesApi(userId),
      ]);
      if (notifs.length > 0) {
        setNotifications(notifs);
      }
      setPreferences(prefs);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addNotification = useCallback(
    (input: CreateNotificationInput): string => {
      const id = input.id || crypto.randomUUID();
      const newNotification: Notification = {
        id,
        type: input.type || "info",
        title: input.title,
        message: input.message,
        read: input.read ?? false,
        archived: input.archived ?? false,
        createdAt: input.createdAt || new Date().toISOString(),
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        userId: input.userId != null ? String(input.userId) : userId,
        metadata: input.metadata,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev.filter((n) => n.id !== id)];
        saveStoredNotifications(updated, userId);
        return updated;
      });

      return id;
    },
    [userId]
  );

  // Initial data load - async, no synchronous setState
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await loadData();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  // Sync notifications across tabs or external events
  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<CreateNotificationInput>;
      if (customEvent.detail) {
        addNotification(customEvent.detail);
      }
    };

    window.addEventListener(NOTIFICATION_EVENT, handleCustomEvent);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleCustomEvent);
    };
  }, [addNotification]);

  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        saveStoredNotifications(updated, userId);
        return updated;
      });
      await markNotificationReadApi(id);
    },
    [userId]
  );

  const markAsUnread = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, read: false } : n
        );
        saveStoredNotifications(updated, userId);
        return updated;
      });
      await markNotificationUnreadApi(id);
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStoredNotifications(updated, userId);
      return updated;
    });
    await markAllNotificationsReadApi();
  }, [userId]);

  const archive = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, archived: true, read: true } : n
        );
        saveStoredNotifications(updated, userId);
        return updated;
      });
      await archiveNotificationApi(id, true);
    },
    [userId]
  );

  const unarchive = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, archived: false } : n
        );
        saveStoredNotifications(updated, userId);
        return updated;
      });
      await archiveNotificationApi(id, false);
    },
    [userId]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        saveStoredNotifications(updated, userId);
        return updated;
      });
      await deleteNotificationApi(id);
    },
    [userId]
  );

  const clearArchived = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => !n.archived);
      saveStoredNotifications(updated, userId);
      return updated;
    });
  }, [userId]);

  const updatePreferences = useCallback(
    async (partialPrefs: Partial<NotificationPreferences>) => {
      const updated = { ...preferences, ...partialPrefs };
      setPreferences(updated);
      await updateNotificationPreferencesApi(updated, userId);
    },
    [preferences, userId]
  );

  const unreadCount = notifications.filter(
    (n) => !n.read && !n.archived
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        addNotification,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        archive,
        unarchive,
        deleteNotification,
        clearArchived,
        updatePreferences,
        refetch: loadData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

export function notify(input: CreateNotificationInput): string {
  if (typeof window !== "undefined") {
    const id = input.id || crypto.randomUUID();
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT, { detail: { ...input, id } })
    );
    return id;
  }
  return "";
}