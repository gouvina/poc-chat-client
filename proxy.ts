import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL

const REFRESH_BUFFER_SECONDS = 30

function isTokenExpiringSoon(token?: string): boolean {
    if (!token) return true

    try {
        const payload = token.split(".")[1]

        if (!payload) return true

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")

        const padded = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        )

        const decoded = JSON.parse(atob(padded))
        const expiresAt = decoded.exp

        if (typeof expiresAt !== "number") return true

        return expiresAt <= Math.floor(Date.now() / 1000) + REFRESH_BUFFER_SECONDS
    } catch {
        return true
    }
}

export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get("access_token")?.value
    const refreshToken = request.cookies.get("refresh_token")?.value

    if (!refreshToken || !isTokenExpiringSoon(accessToken)) {
        return NextResponse.next()
    }

    if (!API_URL) {
        return NextResponse.next()
    }

    let upstream: Response

    try {
        upstream = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                Cookie: `refresh_token=${refreshToken}`,
            },
            cache: "no-store"
        })
    } catch {
        return NextResponse.next()
    }

    if (!upstream.ok) {
        return NextResponse.next()
    }

    const setCookies = upstream.headers.getSetCookie()

    if (setCookies.length === 0) {
        return NextResponse.next()
    }

    for (const setCookie of setCookies) {
        const pair = setCookie.split(";")[0]
        const separator = pair.indexOf("=")

        if (separator === -1) continue

        const name = pair.slice(0, separator).trim()
        const value = pair.slice(separator + 1)

        if (!name) continue

        const maxAgeZero = /(?:^|;)\s*max-age\s*=\s*0(?:;|$)/i
            .test(setCookie)

        if (maxAgeZero || value === "") {
            request.cookies.delete(name)
        } else {
            request.cookies.set(name, value)
        }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("cookie", request.cookies.toString())

    const response = NextResponse.next({
        request: {
            headers: requestHeaders
        }
    })

    for (const setCookie of setCookies) {
        response.headers.append("Set-Cookie", setCookie)
    }

    return response
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|routes/auth/refresh).*)",
    ]
}
