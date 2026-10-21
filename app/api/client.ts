const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AUTH_SESSION_EXPIRED_EVENT = "poc-chat-auth-session-expired";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export function notifyAuthSessionExpired() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

async function refreshAccessToken(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    notifyAuthSessionExpired();
    throw new ApiError(401, "Refresh token expired or invalid");
  }
}

let refreshPromise: Promise<void> | null = null

function getNewAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options?: ApiFetchOptions,
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (e.g. http://localhost:3001).",
    );
  }

  const { auth = true, headers, ...rest } = options ?? {};

  const makeRequest = async () => {
    const requestHeaders = new Headers(headers)

    if (rest.body && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json")
    }

    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      credentials: "include"
    })
  }

  let response = await makeRequest()


  if (response.status === 401 && auth) {
    try {
      await getNewAccessToken()
    } catch {
      throw new ApiError(401, "Authentication session expired")
    }

    response = await makeRequest()
  }

  if (response.status === 401) {
    notifyAuthSessionExpired()
    throw new ApiError(401, "Authentication session expired")
  }

  if (!response.ok) {
    let message = `HTTP error ${response.status}`

    try {
      const body = (await response.json()) as {
        message?: string | string[]
      }

      if (typeof body.message === "string") {
        message = body.message
      } else if (Array.isArray(body.message)) {
        message = body.message.join(", ")
      }
    } catch {
      // ignore non-json error bodies
    }

    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
