import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/profile", "/user-details"]

export async function proxy (req: NextRequest) {
    const { nextUrl } = req
    const sessionCookie = getSessionCookie(req)

    const res = NextResponse.next()

    const isLoggedIn = !!sessionCookie
    const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname)
    const isOnAuthRoute = nextUrl.pathname.startsWith("/auth") && nextUrl.pathname !== "/auth/callback"

    console.log("middleware:", req.nextUrl.pathname)// middleware debugging

    if (isOnProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (isOnAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/callback", req.url))
    }

    return res;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
    ]
}