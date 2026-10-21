import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ApiError } from "./client"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch<T>(
    path: string,
    returnTo = "/"
): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (e.g. http://localhost:3001).",
        )
    }

    const cookieStore = await cookies()

    const accessToken = cookieStore.get("access_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    const cookieHeader = [
        accessToken && `access_token=${accessToken}`,
        refreshToken && `refresh_token=${refreshToken}`
    ]
        .filter(Boolean)
        .join("; ")

    const response = await fetch(`${API_URL}${path}`, {
        headers: cookieHeader
            ? { Cookie: cookieHeader }
            : undefined,
        cache: "no-store"
    })

    if (response.status === 401) {
        const refreshUrl = new URL(
            "/routes/auth/refresh",
            "http://localhost"
        )

        refreshUrl.searchParams.set("returnTo", returnTo)

        redirect(`${refreshUrl.pathname}${refreshUrl.search}`)
    }

    if (!response.ok) {
        throw new ApiError(response.status, `API request failed: ${response.status}`)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}
