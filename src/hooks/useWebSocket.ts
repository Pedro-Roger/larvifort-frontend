"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAuthToken } from "@/services/api";

interface UseWebSocketOptions {
  boardId: string;
  enabled?: boolean;
}

interface UseWebSocketReturn {
  connected: boolean;
  on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  off: (event: string) => void;
  emit: (event: string, data: unknown) => void;
}

export function useWebSocket({
  boardId,
  enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !boardId) return;

    const token = getAuthToken();
    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const socketUrl =
      apiBase && !apiBase.startsWith("/")
        ? apiBase.replace(/\/+$/, "")
        : window.location.origin;

    const socket = io(socketUrl, {
      auth: { token },
      query: { boardId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [boardId, enabled]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, []);

  const off = useCallback((event: string) => {
    socketRef.current?.off(event);
  }, []);

  return { connected, emit, on, off };
}