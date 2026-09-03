const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const ACCESS_TOKEN_STORAGE_KEY = "poc-chat-access-token";
export const REFRESH_TOKEN_STORAGE_KEY = "poc-chat-refresh-token";
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

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setStoredTokens(accessToken: string | null, refreshToken: string | null) {
  if (typeof window === "undefined") return;
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

type RefreshResponse = {
  accessToken: string;
};

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token available");
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) {
    notifyAuthSessionExpired();
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const data = (await response.json()) as RefreshResponse;

  setStoredTokens(data.accessToken, refreshToken);

  return data.accessToken;
}

export function notifyAuthSessionExpired() {
  if (typeof window === "undefined") return;
  setStoredTokens(null, null);
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

let refreshPromise: Promise<string> | null = null;

function getNewAccessToken(): Promise<string> {
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

  const makeRequest = async (token?: string) => {
    const requestHeaders = new Headers(headers)

    requestHeaders.set("Content-Type", "application/json")

    if (auth && token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }

    return fetch(`${API_URL}${path}`, {
      headers: requestHeaders,
      ...rest,
    })
  }

  let token = auth ? getStoredAccessToken() : null

  let response = await makeRequest(token ?? undefined)


  if (response.status === 401 && auth) {
    try {
      token = await getNewAccessToken()

      response = await makeRequest(token)
    } catch {
      notifyAuthSessionExpired()
      throw new ApiError(401, "Authentication session expired")
    }
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
