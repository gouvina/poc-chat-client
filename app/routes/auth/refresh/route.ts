import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getReturnTo(request: NextRequest): URL {
    const returnTo = request.nextUrl.searchParams.get("returnTo")
    const fallback = new URL("/", request.url)

    if (
        !returnTo ||
        !returnTo.startsWith("/") ||
        returnTo.startsWith("//") ||
        returnTo.includes("\\")
    ) {
        return fallback
    }

    return new URL(returnTo, request.url)
}


function redirectToExpired(target: URL) {
    target.searchParams.set("auth", "expired")

    const response = NextResponse.redirect(target)

    response.cookies.set("access_token", "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    })

    response.cookies.set("refresh_token", "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    })

    return response
}


export async function GET(request: NextRequest) {
    const target = getReturnTo(request)
    const refreshToken = request.cookies.get("refresh_token")?.value

    let upstream: Response | undefined

    if (API_URL && refreshToken) {
        try {
            upstream = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    Cookie: `refresh_token=${refreshToken}`,
                },
                cache: "no-store",
            })
        } catch (err) {
            return redirectToExpired(target)
        }
    }

    if (!upstream?.ok) {
        return redirectToExpired(target)
    }

    const response = NextResponse.redirect(target)

    for (const cookie of upstream.headers.getSetCookie()) {
        response.headers.append("Set-Cookie", cookie)
    }

    return response
}
