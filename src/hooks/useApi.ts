"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseApiState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: (fetcher: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
};

/**
 * Hook genérico para chamadas à API (services/api.ts).
 * Gerencia loading/error/data sem esconder o ApiError original.
 */
export function useApi<T = unknown>(): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (fetcher: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      const normalized =
        err instanceof Error ? err : new Error("Erro inesperado na requisição");
      if (mountedRef.current) {
        setError(normalized);
        setData(null);
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
}

export default useApi;
