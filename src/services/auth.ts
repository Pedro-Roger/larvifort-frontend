import { apiPost, clearAuthToken, getAuthToken, setAuthToken } from "./api";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  role?: string;
  teamName?: string;
  [key: string]: unknown;
};

export type LoginResult = {
  token: string;
  user: AuthUser | null;
};

type RawLoginResponse = {
  token?: unknown;
  accessToken?: unknown;
  access_token?: unknown;
  user?: unknown;
  data?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function extractToken(raw: RawLoginResponse): string | null {
  const direct =
    asString(raw.token) ?? asString(raw.accessToken) ?? asString(raw.access_token);
  if (direct) return direct;

  if (typeof raw.data === "object" && raw.data !== null) {
    const nested = raw.data as RawLoginResponse;
    return (
      asString(nested.token) ??
      asString(nested.accessToken) ??
      asString(nested.access_token)
    );
  }

  return null;
}

function extractUser(raw: RawLoginResponse): AuthUser | null {
  if (typeof raw.user === "object" && raw.user !== null) {
    return raw.user as AuthUser;
  }
  if (typeof raw.data === "object" && raw.data !== null) {
    const nested = raw.data as { user?: unknown };
    if (typeof nested.user === "object" && nested.user !== null) {
      return nested.user as AuthUser;
    }
  }
  return null;
}

/**
 * Autentica o usuário via POST /auth/login (sem Bearer) e persiste o token.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const email = credentials.email.trim();
  const password = credentials.password;

  if (!email || !password) {
    throw new Error("Informe e-mail e senha.");
  }

  const raw = await apiPost<RawLoginResponse>(
    "/auth/login",
    { email, password },
    { auth: false },
  );

  const token = extractToken(raw ?? {});
  if (!token) {
    throw new Error("Resposta de login sem token.");
  }

  setAuthToken(token);
  return { token, user: extractUser(raw ?? {}) };
}

export function logout(): void {
  clearAuthToken();
}

/**
 * Tenta renovar o access token via POST /auth/refresh (sem Bearer).
 * Retorna o novo token persistido, ou null se o backend não suportar
 * (404/401) ou a renovação falhar. Nunca lança — o chamador decide
 * entre retry (token) ou auto-logout (null).
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const raw = await apiPost<RawLoginResponse>(
      "/auth/refresh",
      {},
      { auth: false },
    );
    const token = extractToken(raw ?? {});
    if (!token) {
      return null;
    }
    setAuthToken(token);
    return token;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
