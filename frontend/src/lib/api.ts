/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Thrown by `apiFetch` for any non-2xx response. Carries the HTTP status so
 * callers can tell "signed out" (401) apart from any other failure, and the
 * backend's `detail` message when it sent one -- e.g. auth's
 * "access is limited to company accounts".
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Every call goes through `credentials: "include"` -- the session is a
 * cookie the backend's SessionMiddleware sets, not a bearer token this app
 * invents and attaches itself.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    let detail = `${init?.method ?? "GET"} ${path} failed: ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.detail === "string") detail = body.detail;
    } catch {
      // No JSON body (or not JSON) on this error response -- keep the default detail.
    }
    throw new ApiError(response.status, detail);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/** Where the "Sign in with Google" action sends the browser: a full navigation, not a fetch. */
export function loginUrl(): string {
  return `${API_BASE_URL}/auth/login`;
}
