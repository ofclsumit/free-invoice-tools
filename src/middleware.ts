import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_COOKIE_NAME = "turnivo_admin_session"
const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "smrtx.sumit@gmail.com").toLowerCase().trim()
const SECRET = process.env.NEXTAUTH_SECRET || process.env.ADMIN_SESSION_SECRET || "turnivo_admin_secure_secret_2026_salt"

/**
 * Validates the HMAC-SHA256 admin session token in Edge runtime
 */
async function isValidAdminSession(token?: string): Promise<boolean> {
  if (!token) return false
  try {
    const [payloadB64, signatureB64] = token.split(".")
    if (!payloadB64 || !signatureB64) return false

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    // Base64url decode signature to binary
    const base64Sig = signatureB64.replace(/-/g, "+").replace(/_/g, "/")
    const paddedSig = base64Sig.padEnd(base64Sig.length + ((4 - (base64Sig.length % 4)) % 4), "=")
    const rawSig = atob(paddedSig)
    const sigBytes = new Uint8Array(rawSig.length)
    for (let i = 0; i < rawSig.length; i++) {
      sigBytes[i] = rawSig.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payloadB64))
    if (!isValid) return false

    // Base64url decode payload
    const base64Payload = payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - (base64Payload.length % 4)) % 4), "=")
    const payload = JSON.parse(atob(paddedPayload))

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return false
    if ((payload.email || "").toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) return false

    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin routes protection
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const isAuthed = await isValidAdminSession(sessionCookie)

    // Unauthenticated user trying to access any admin page (except /admin/login)
    if (!isAuthed && pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Authenticated admin trying to view login page
    if (isAuthed && pathname === "/admin/login") {
      const dashboardUrl = new URL("/admin/dashboard", req.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Route /admin redirect to /admin/dashboard
    if (pathname === "/admin") {
      const dashboardUrl = new URL("/admin/dashboard", req.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|ads\\.txt|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
    "/admin/:path*",
  ],
}
