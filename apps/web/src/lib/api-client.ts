import { authStorage } from "@/lib/auth-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** kirim Authorization header dari token tersimpan */
  auth?: boolean;
  /** kirim X-Workspace-Id header dari workspace aktif */
  workspaceScoped?: boolean;
  /** override workspace id (default: pakai dari storage) */
  workspaceId?: string;
  signal?: AbortSignal;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const stored = authStorage.read();
    if (!stored?.refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string };
      if (!data.accessToken) return null;
      authStorage.updateAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();
  return refreshPromise;
}

async function rawFetch<T>(
  path: string,
  opts: RequestOptions,
  accessTokenOverride?: string,
): Promise<T> {
  const isFormData = opts.body instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.auth) {
    const token = accessTokenOverride ?? authStorage.read()?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (opts.workspaceScoped) {
    const wsId = opts.workspaceId ?? authStorage.read()?.workspaceId;
    if (wsId) headers["X-Workspace-Id"] = wsId;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body
      ? isFormData
        ? (opts.body as FormData)
        : JSON.stringify(opts.body)
      : undefined,
    signal: opts.signal,
    credentials: "omit",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data: unknown = text ? safeParse(text) : null;

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const m = (data as { message?: unknown }).message;
  if (Array.isArray(m)) return m.filter((x) => typeof x === "string").join(", ");
  if (typeof m === "string") return m;
  return undefined;
}

export const apiClient = {
  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    try {
      return await rawFetch<T>(path, opts);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        opts.auth &&
        !path.startsWith("/auth/refresh") &&
        !path.startsWith("/auth/login") &&
        !path.startsWith("/auth/register")
      ) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return rawFetch<T>(path, opts, newToken);
        }
        authStorage.clear();
      }
      throw error;
    }
  },

  get<T>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...opts, method: "GET" });
  },

  post<T>(
    path: string,
    body?: unknown,
    opts: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...opts, method: "POST", body });
  },

  patch<T>(
    path: string,
    body?: unknown,
    opts: Omit<RequestOptions, "method" | "body"> = {},
  ) {
    return this.request<T>(path, { ...opts, method: "PATCH", body });
  },

  delete<T>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) {
    return this.request<T>(path, { ...opts, method: "DELETE" });
  },
};
