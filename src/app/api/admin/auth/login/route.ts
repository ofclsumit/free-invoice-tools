import { NextRequest, NextResponse } from "next/server"
import {
  verifyAdminCredentials,
  setAdminSessionCookie,
  logAdminAction,
} from "@/lib/auth/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      )
    }

    const verification = await verifyAdminCredentials(email, password)

    if (!verification.success || !verification.email) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      )
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    // Log admin login to audit log in background (non-blocking)
    logAdminAction({
      action: "Admin login",
      adminEmail: verification.email,
      ipAddress: ip,
      details: "Admin successfully signed in to dashboard",
    }).catch(() => {})

    const response = NextResponse.json({
      success: true,
      email: verification.email,
    })

    setAdminSessionCookie(response, verification.email)
    return response
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 }
    )
  }
}
