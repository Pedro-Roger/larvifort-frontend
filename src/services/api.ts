export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

const TOKEN_STORAGE_KEY = "larvifort:token";
const REFRESH_TOKEN_STORAGE_KEY = "larvifort:refreshToken";

// Cookie espelho (leitura server-side pelo middleware). Nome sem ":" por
// compatibilidade; localStorage continua sendo a fonte de verdade no client.
export const AUTH_COOKIE_NAME = "larvifort_token";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function writeAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie =
      `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // Cookie é best-effort; localStorage é a fonte de verdade.
  }
}

function removeAuthCookie(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Best-effort.
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  writeAuthCookie(token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  removeAuthCookie();
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
}

type UnauthorizedHandler = (status: number, path: string) => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;

export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

function isAuthEndpoint(path: string): boolean {
  const normalized = path.split("?")[0].replace(/\/+$/, "");
  return normalized === "/auth/login" || normalized === "/auth/refresh";
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, auth = true, ...rest } = options;
  const { _retried: retriedFlag, ...init } = rest as ApiOptions & {
    _retried?: boolean;
  };
  const retried = retriedFlag === true;

  const authHeaders: Record<string, string> = {};
  if (auth) {
    const token = getAuthToken();
    if (token) {
      authHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    // Tentativa única de refresh antes do auto-logout (apenas 1x, sem loop
    // em endpoints de auth). Se o backend não suportar /auth/refresh,
    // refreshHandler retorna null e o fluxo cai no unauthorizedHandler.
    if (
      response.status === 401 &&
      auth &&
      !retried &&
      !isAuthEndpoint(path) &&
      refreshHandler
    ) {
      let refreshedToken: string | null = null;
      try {
        refreshedToken = await refreshHandler();
      } catch {
        refreshedToken = null;
      }
      if (refreshedToken) {
        return api<T>(path, {
          ...options,
          _retried: true,
        } as ApiOptions);
      }
    }
    if (response.status === 401 && unauthorizedHandler) {
      try {
        unauthorizedHandler(response.status, path);
      } catch {
        // Nunca quebrar a chamada por falha no handler.
      }
    }
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text().catch(() => null);
    }
    const message =
      typeof errorBody === "object" && errorBody !== null && "message" in errorBody
        ? String((errorBody as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export function apiGet<T>(path: string, options: ApiOptions = {}): Promise<T> {
  return api<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
  return api<T>(path, { ...options, method: "POST", body });
}

export function apiPatch<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
  return api<T>(path, { ...options, method: "PATCH", body });
}

export function apiDelete<T>(path: string, options: ApiOptions = {}): Promise<T> {
  return api<T>(path, { ...options, method: "DELETE" });
}
