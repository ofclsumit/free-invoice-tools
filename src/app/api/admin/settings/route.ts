import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getAdminSession, logAdminAction } from "@/lib/auth/admin-auth"

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let settings = await prisma.adminSetting.findUnique({
      where: { id: "global" },
    })

    if (!settings) {
      settings = await prisma.adminSetting.create({
        data: {
          id: "global",
          trackingActive: true,
          timezone: "Asia/Kolkata",
        },
      })
    }

    const auditLogs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      adminEmail: session.email,
      trackingActive: settings.trackingActive,
      timezone: settings.timezone,
      retentionDays: settings.retentionDays,
      updatedAt: settings.updatedAt,
      auditLogs,
    })
  } catch (err: any) {
    console.error("[Admin Settings GET Error]", err)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { trackingActive, timezone, retentionDays } = body

    const existing = await prisma.adminSetting.findUnique({
      where: { id: "global" },
    })

    const updated = await prisma.adminSetting.upsert({
      where: { id: "global" },
      update: {
        ...(typeof trackingActive === "boolean" ? { trackingActive } : {}),
        ...(typeof timezone === "string" ? { timezone } : {}),
        ...(retentionDays !== undefined ? { retentionDays: retentionDays ? Number(retentionDays) : null } : {}),
      },
      create: {
        id: "global",
        trackingActive: typeof trackingActive === "boolean" ? trackingActive : true,
        timezone: typeof timezone === "string" ? timezone : "Asia/Kolkata",
        retentionDays: retentionDays ? Number(retentionDays) : null,
      },
    })

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    if (existing && typeof trackingActive === "boolean" && existing.trackingActive !== trackingActive) {
      await logAdminAction({
        action: trackingActive ? "Analytics tracking enabled" : "Analytics tracking disabled",
        adminEmail: session.email,
        ipAddress: ip,
        details: `Global killswitch changed from ${existing.trackingActive} to ${trackingActive}`,
      })
    } else {
      await logAdminAction({
        action: "Settings changed",
        adminEmail: session.email,
        ipAddress: ip,
        details: `Updated settings (timezone: ${updated.timezone}, retention: ${updated.retentionDays || "indefinite"})`,
      })
    }

    return NextResponse.json({
      success: true,
      settings: updated,
    })
  } catch (err: any) {
    console.error("[Admin Settings POST Error]", err)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
