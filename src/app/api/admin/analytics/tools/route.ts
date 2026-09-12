import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getAdminSession } from "@/lib/auth/admin-auth"
import { getAllTools } from "@/lib/analytics/tool-registry"

export async function GET(req: NextRequest) {
  // 1. Security Check: Admin Session Verification
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || "all"
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Filter registry if category selected
    const allTools = getAllTools()
    const targetTools =
      category && category !== "all"
        ? allTools.filter((t) => t.category === category)
        : allTools

    // Fetch tool stats in parallel
    const [
      downloadsByTool,
      downloadsTodayByTool,
      downloadsMonthByTool,
      lastDownloadByTool,
      eventsByToolAndType,
    ] = await Promise.all([
      // Total downloads per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: { eventType: "pdf_download" },
        _count: { id: true },
      }),
      // Downloads today per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: {
          eventType: "pdf_download",
          createdAt: { gte: startOfToday },
        },
        _count: { id: true },
      }),
      // Downloads this month per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: {
          eventType: "pdf_download",
          createdAt: { gte: startOfMonth },
        },
        _count: { id: true },
      }),
      // Last download per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: { eventType: "pdf_download" },
        _max: { createdAt: true },
      }),
      // Events breakdown per tool and event_type
      prisma.toolEvent.groupBy({
        by: ["toolId", "eventType"],
        _count: { id: true },
      }),
    ])

    // Build fast lookup maps
    const totalDownloadsMap = new Map(downloadsByTool.map((x) => [x.toolId, x._count.id]))
    const todayDownloadsMap = new Map(downloadsTodayByTool.map((x) => [x.toolId, x._count.id]))
    const monthDownloadsMap = new Map(downloadsMonthByTool.map((x) => [x.toolId, x._count.id]))
    const lastDownloadMap = new Map(
      lastDownloadByTool.map((x) => [x.toolId, x._max.createdAt ? x._max.createdAt.toISOString() : null])
    )

    // Events breakdown map: toolId -> { opens, calculations, previews, downloads, shares }
    const funnelMap = new Map<
      string,
      { opens: number; calculations: number; previews: number; downloads: number; shares: number }
    >()

    for (const item of eventsByToolAndType) {
      if (!funnelMap.has(item.toolId)) {
        funnelMap.set(item.toolId, {
          opens: 0,
          calculations: 0,
          previews: 0,
          downloads: 0,
          shares: 0,
        })
      }
      const entry = funnelMap.get(item.toolId)!
      const count = item._count.id
      if (item.eventType === "tool_open") entry.opens = count
      else if (item.eventType === "calculate") entry.calculations = count
      else if (item.eventType === "preview") entry.previews = count
      else if (item.eventType === "pdf_download") entry.downloads = count
      else if (item.eventType === "share") entry.shares = count
    }

    // Compose Downloads by Tool Table
    const downloadsTable = targetTools.map((tool) => {
      const total = totalDownloadsMap.get(tool.id) || 0
      const today = todayDownloadsMap.get(tool.id) || 0
      const thisMonth = monthDownloadsMap.get(tool.id) || 0
      const last = lastDownloadMap.get(tool.id) || null

      return {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        url: tool.url,
        totalDownloads: total,
        downloadsToday: today,
        downloadsThisMonth: thisMonth,
        lastDownload: last,
      }
    })

    // Sort by Total Downloads descending
    downloadsTable.sort((a, b) => b.totalDownloads - a.totalDownloads)

    // Compose Tool Usage Funnel Table
    const usageTable = targetTools.map((tool) => {
      const counts = funnelMap.get(tool.id) || {
        opens: 0,
        calculations: 0,
        previews: 0,
        downloads: 0,
        shares: 0,
      }

      // Safe conversion ratios
      const openToDownloadRate =
        counts.opens > 0 ? Number(((counts.downloads / counts.opens) * 100).toFixed(1)) : 0
      const previewToDownloadRate =
        counts.previews > 0
          ? Number(((counts.downloads / counts.previews) * 100).toFixed(1))
          : 0

      return {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        opens: counts.opens,
        calculations: counts.calculations,
        previews: counts.previews,
        downloads: counts.downloads,
        shares: counts.shares,
        openToDownloadRate,
        previewToDownloadRate,
      }
    })

    // Sort usage table by opens descending
    usageTable.sort((a, b) => b.opens - a.opens)

    return NextResponse.json({
      downloadsTable,
      usageTable,
    })
  } catch (err: any) {
    console.error("[Admin Tools API Error]", err)
    return NextResponse.json({ error: "Failed to load tools analytics" }, { status: 500 })
  }
}
