import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getToolById } from "@/lib/analytics/tool-registry"

const ALLOWED_EVENT_TYPES = new Set([
  "tool_open",
  "calculate",
  "preview",
  "pdf_download",
  "share",
])

/**
 * Maps incoming country header codes to coarse categories
 */
function resolveCoarseCountry(req: NextRequest): string {
  const code = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    ""
  )
    .toUpperCase()
    .trim()

  if (code === "IN") return "India"
  if (code === "US") return "United States"
  if (code) return "Other"
  return "India" // Default coarse target for Turnivo
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const {
      toolId,
      eventType,
      downloadType = "pdf",
      deviceType,
      sessionId,
      metadata,
    } = body

    // 1. Validate Event Type
    if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
    }

    // 2. Validate Tool ID against Central Tool Registry
    const tool = getToolById(toolId)
    if (!tool) {
      return NextResponse.json({ error: "Unknown tool ID" }, { status: 400 })
    }

    // 3. Global Analytics Killswitch Check
    try {
      const settings = await prisma.adminSetting.findUnique({
        where: { id: "global" },
      })
      if (settings && !settings.trackingActive) {
        return NextResponse.json({ status: "disabled" })
      }
    } catch {
      // If table/row not yet queried, continue
    }

    // 4. Resolve Coarse Country & Device Type
    const country = resolveCoarseCountry(req)
    const normalizedDevice =
      deviceType === "Mobile" || deviceType === "Tablet" || deviceType === "Desktop"
        ? deviceType
        : "Desktop"

    // 5. Ingest into database
    await prisma.toolEvent.create({
      data: {
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        eventType,
        downloadType: downloadType || "pdf",
        country,
        deviceType: normalizedDevice,
        sessionId: typeof sessionId === "string" ? sessionId.slice(0, 80) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[Analytics Track Error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
