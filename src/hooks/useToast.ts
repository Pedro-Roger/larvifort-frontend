"use client";

import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const TOAST_LIMIT = 3;

const queue: Toast[] = [];
let activeTimeouts: NodeJS.Timeout[] = [];

const addToQueue = (toast: Toast) => {
  queue.push(toast);
  if (queue.length > TOAST_LIMIT) {
    queue.splice(0, 1);
  }
  removeOldestTimeout();
  scheduleRemove(toast.id);
};

const removeOldestTimeout = () => {
  if (activeTimeouts.length > 0) {
    const oldestId = activeTimeouts[0];
    clearTimeout(oldestId);
    activeTimeouts = activeTimeouts.filter((id) => id !== oldestId);
  }
};

const scheduleRemove = (id: string) => {
  const delay = 4000;
  const timeout = setTimeout(() => {
    const idx = queue.findIndex((t) => t.id === id);
    if (idx >= 0) queue.splice(idx, 1);
    activeTimeouts = activeTimeouts.filter((tid) => tid !== timeout);
    removeOldestTimeout();
  }, delay);
  activeTimeouts.push(timeout);
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let cancelled = false;

    const sync = () => {
      if (!cancelled) {
        setToasts([...queue]);
      }
    };

    // Initial sync
    sync();

    // Poll for queue changes (simple approach for external queue)
    const interval = setInterval(sync, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
      activeTimeouts.forEach((id) => clearTimeout(id));
    };
  }, []);

  const toast = (props: Omit<Toast, "id"> & { id?: string }) => {
    const id = props.id || Math.random().toString(36).substr(2, 9);
    addToQueue({ ...props, id });
    return id;
  };

  const dismiss = (id: string) => {
    const idx = queue.findIndex((t) => t.id === id);
    if (idx >= 0) queue.splice(idx, 1);
  };

  return { toasts, toast, dismiss };
};