/**
 * Shared API client configuration.
 * All fetch calls to the backend should use this base URL.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

/**
 * Typed fetch wrapper that prepends the API base URL
 * and handles JSON parsing + error status codes.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.detail ??
      (typeof body === "string" ? body : `Request failed (${res.status})`);
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return res.json() as Promise<T>;
}
