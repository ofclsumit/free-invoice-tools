import { NextRequest, NextResponse } from "next/server"
import {
  getAdminSession,
  clearAdminSessionCookie,
  logAdminAction,
} from "@/lib/auth/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    if (session) {
      await logAdminAction({
        action: "Admin logout",
        adminEmail: session.email,
        ipAddress: ip,
        details: "Admin logged out from dashboard",
      })
    }

    const response = NextResponse.json({ success: true })
    clearAdminSessionCookie(response)
    return response
  } catch (err: any) {
    const response = NextResponse.json({ success: true })
    clearAdminSessionCookie(response)
    return response
  }
}
