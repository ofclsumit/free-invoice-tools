/**
 * TURNIVO — ADMIN AUTHENTICATION & AUTHORIZATION ENGINE
 * 
 * Strict server-side authentication for admin dashboard access.
 * Authorized admin email: smrtx.sumit@gmail.com
 * Never exposes passwords to client or API responses.
 */

import crypto from "crypto"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { supabase, supabaseAuth, supabaseAdmin } from "@/lib/supabase/client"

export const AUTHORIZED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "smrtx.sumit@gmail.com").toLowerCase().trim()
export const ADMIN_COOKIE_NAME = "turnivo_admin_session"
const SECRET = process.env.NEXTAUTH_SECRET || process.env.ADMIN_SESSION_SECRET || "turnivo_admin_secure_secret_2026_salt"

interface AdminTokenPayload {
  email: string
  role: "admin"
  iat: number
  exp: number
}

/**
 * Creates a cryptographically signed session token
 */
export function signAdminToken(email: string): string {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 7 // 7 days expiration
  const payload: AdminTokenPayload = {
    email: email.toLowerCase(),
    role: "admin",
    iat,
    exp,
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64url")

  return `${payloadB64}.${signature}`
}

/**
 * Verifies the signed admin session token
 */
export function verifyAdminToken(token?: string | null): AdminTokenPayload | null {
  if (!token) return null

  try {
    const [payloadB64, signature] = token.split(".")
    if (!payloadB64 || !signature) return null

    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(payloadB64)
      .digest("base64url")

    // Timing-safe comparison to prevent side-channel attacks
    const sigA = Buffer.from(signature)
    const sigB = Buffer.from(expectedSignature)
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null
    }

    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    )

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    // Verify authorized email strictly
    if (payload.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Verifies email and password using Supabase Auth or secure server environment variable
 */
export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; email?: string }> {
  const normalizedEmail = (emailInput || "").toLowerCase().trim()

  // Strict authorization gate: Only the authorized email can even attempt admin login
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return { success: false }
  }

  if (!passwordInput) {
    return { success: false }
  }

  // 1. Primary verification: Supabase Auth if available
  if (supabaseAuth) {
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: normalizedEmail,
        password: passwordInput,
      })

      if (!error && data?.user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
        return { success: true, email: normalizedEmail }
      }

      if (error) {
        console.warn("[Admin Auth] Supabase signInWithPassword error:", error.message)
      }
    } catch (err: any) {
      console.warn("[Admin Auth] Supabase connection error:", err?.message || err)
    }
  }

  // 2. Server-side environment secret verification
  const envPassword = process.env.ADMIN_PASSWORD
  if (envPassword) {
    const bufA = Buffer.from(passwordInput)
    const bufB = Buffer.from(envPassword)

    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return { success: true, email: normalizedEmail }
    }
  }

  return { success: false }
}

/**
 * Server-side session check helper for Route Handlers and Server Components
 */
export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
    return verifyAdminToken(token)
  } catch {
    return null
  }
}

/**
 * Sets the admin session cookie on a NextResponse
 */
export function setAdminSessionCookie(response: NextResponse, email: string): void {
  const token = signAdminToken(email)
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Clears the admin session cookie on a NextResponse
 */
export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

/**
 * Records an entry into the Admin Audit Log
 */
export async function logAdminAction({
  action,
  adminEmail,
  details,
  ipAddress,
}: {
  action: string
  adminEmail: string
  details?: string
  ipAddress?: string
}): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        action,
        adminEmail,
        details,
        ipAddress,
      },
    })
  } catch (err) {
    console.error("[Admin Audit Log Error]", err)
  }
}
