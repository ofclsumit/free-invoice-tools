import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma/client"
import { getAdminSession, logAdminAction } from "@/lib/auth/admin-auth"
import { getAllTools } from "@/lib/analytics/tool-registry"

export async function GET(req: NextRequest) {
  // 1. Security Check: Admin Session Verification
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get("scope") || "all" // "current" or "all"
    const range = searchParams.get("range") || "30d"
    const categoryFilter = searchParams.get("category") || "all"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const filename = `TURNIVO-download-report-${todayStr}.xlsx`

    // Determine filter bounds if scope === "current"
    let filterStart: Date | null = null
    let filterEnd: Date = now
    let filterDescription = "All Time permitted admin dataset"

    if (scope === "current") {
      if (range === "today") {
        filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        filterDescription = "Today"
      } else if (range === "7d") {
        filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filterDescription = "Last 7 Days"
      } else if (range === "30d") {
        filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filterDescription = "Last 30 Days"
      } else if (range === "90d") {
        filterStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        filterDescription = "Last 90 Days"
      } else if (range === "year") {
        filterStart = new Date(now.getFullYear(), 0, 1)
        filterDescription = "This Year"
      } else if (range === "custom" && startDateParam) {
        filterStart = new Date(startDateParam)
        if (endDateParam) {
          filterEnd = new Date(new Date(endDateParam).setHours(23, 59, 59, 999))
        }
        filterDescription = `Custom: ${startDateParam} to ${endDateParam || "Now"}`
      }
    }

    const whereClause: any = {}
    if (filterStart) {
      whereClause.createdAt = {
        gte: filterStart,
        lte: filterEnd,
      }
    }
    if (scope === "current" && categoryFilter && categoryFilter !== "all") {
      whereClause.category = categoryFilter
    }

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel database retrieval
    const [
      totalDownloadsCount,
      totalToolUsesCount,
      topToolGroup,
      topCategoryGroup,
      downloadsByTool,
      todayDownloadsByTool,
      monthDownloadsByTool,
      firstDownloadByTool,
      lastDownloadByTool,
      dailyDownloadsList,
      eventBreakdownList,
      recentEventsList,
    ] = await Promise.all([
      // Total PDF downloads in scope
      prisma.toolEvent.count({
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
      }),
      // Total tool uses in scope
      prisma.toolEvent.count({
        where: whereClause,
      }),
      // Top tool
      prisma.toolEvent.groupBy({
        by: ["toolName"],
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
      // Top category
      prisma.toolEvent.groupBy({
        by: ["category"],
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
      // Downloads per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
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
      // First download per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: { eventType: "pdf_download" },
        _min: { createdAt: true },
      }),
      // Last download per tool
      prisma.toolEvent.groupBy({
        by: ["toolId"],
        where: { eventType: "pdf_download" },
        _max: { createdAt: true },
      }),
      // Daily downloads list
      prisma.toolEvent.findMany({
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Events breakdown for funnel
      prisma.toolEvent.groupBy({
        by: ["toolId", "eventType"],
        where: whereClause,
        _count: { id: true },
      }),
      // Recent activity (latest 200 events)
      prisma.toolEvent.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          createdAt: true,
          toolName: true,
          category: true,
          eventType: true,
        },
      }),
    ])

    // ==========================================
    // BUILD WORKBOOK
    // ==========================================
    const wb = XLSX.utils.book_new()
    const allTools = getAllTools()

    // ------------------------------------------
    // SHEET 1: Summary
    // ------------------------------------------
    const summaryRows = [
      { Metric: "Report Title", Value: "TURNIVO - Official Download & Usage Analytics Report" },
      { Metric: "Website Domain", Value: "https://turnivo.in" },
      {
        Metric: "Report Generation Date",
        Value: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " (IST)",
      },
      { Metric: "Export Scope", Value: scope === "current" ? "Current Filtered View" : "Complete Permitted Dataset" },
      { Metric: "Date Range", Value: filterDescription },
      { Metric: "Category Filter", Value: categoryFilter || "All Categories" },
      { Metric: "Total PDF Downloads", Value: totalDownloadsCount },
      { Metric: "Total Tool Uses", Value: totalToolUsesCount },
      { Metric: "Top Downloaded Tool", Value: topToolGroup[0]?.toolName || "N/A" },
      { Metric: "Top Performing Category", Value: topCategoryGroup[0]?.category || "N/A" },
      { Metric: "Admin Generating Report", Value: session.email },
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 70 }]

    // ------------------------------------------
    // SHEET 2: Downloads by Tool
    // ------------------------------------------
    const downloadsMap = new Map(downloadsByTool.map((x) => [x.toolId, x._count.id]))
    const todayMap = new Map(todayDownloadsByTool.map((x) => [x.toolId, x._count.id]))
    const monthMap = new Map(monthDownloadsByTool.map((x) => [x.toolId, x._count.id]))
    const firstMap = new Map(firstDownloadByTool.map((x) => [x.toolId, x._min.createdAt]))
    const lastMap = new Map(lastDownloadByTool.map((x) => [x.toolId, x._max.createdAt]))

    const toolRows = allTools
      .filter((t) => scope !== "current" || categoryFilter === "all" || t.category === categoryFilter)
      .map((tool) => {
        const total = downloadsMap.get(tool.id) || 0
        const today = todayMap.get(tool.id) || 0
        const thisMonth = monthMap.get(tool.id) || 0
        const first = firstMap.get(tool.id)
        const last = lastMap.get(tool.id)
        const pct = totalDownloadsCount > 0 ? (total / totalDownloadsCount) * 100 : 0

        return {
          Tool: tool.name,
          Category: tool.category,
          "Total Downloads": total,
          "Downloads Today": today,
          "Downloads This Month": thisMonth,
          "First Download": first ? new Date(first).toISOString().split("T")[0] : "None",
          "Last Download": last ? new Date(last).toISOString().split("T")[0] : "None",
          "Percentage of Total": `${pct.toFixed(1)}%`,
        }
      })

    toolRows.sort((a, b) => b["Total Downloads"] - a["Total Downloads"])

    const wsToolRows = XLSX.utils.json_to_sheet(toolRows)
    wsToolRows["!cols"] = [
      { wch: 28 }, // Tool
      { wch: 24 }, // Category
      { wch: 18 }, // Total Downloads
      { wch: 18 }, // Downloads Today
      { wch: 22 }, // Downloads This Month
      { wch: 16 }, // First Download
      { wch: 16 }, // Last Download
      { wch: 20 }, // Percentage
    ]

    // ------------------------------------------
    // SHEET 3: Daily Downloads
    // ------------------------------------------
    const dailyMap = new Map<string, number>()
    for (const ev of dailyDownloadsList) {
      const d = ev.createdAt.toISOString().split("T")[0]
      dailyMap.set(d, (dailyMap.get(d) || 0) + 1)
    }

    const sortedDates = Array.from(dailyMap.keys()).sort()
    const dailyRows = sortedDates.map((date) => ({
      Date: date,
      "Total Downloads": dailyMap.get(date) || 0,
    }))

    const wsDaily = XLSX.utils.json_to_sheet(
      dailyRows.length > 0 ? dailyRows : [{ Date: "No download events in period", "Total Downloads": 0 }]
    )
    wsDaily["!cols"] = [{ wch: 20 }, { wch: 20 }]

    // ------------------------------------------
    // SHEET 4: Event Summary (Funnel)
    // ------------------------------------------
    const eventSummaryMap = new Map<
      string,
      { opens: number; calculations: number; previews: number; downloads: number; shares: number }
    >()

    for (const item of eventBreakdownList) {
      if (!eventSummaryMap.has(item.toolId)) {
        eventSummaryMap.set(item.toolId, { opens: 0, calculations: 0, previews: 0, downloads: 0, shares: 0 })
      }
      const entry = eventSummaryMap.get(item.toolId)!
      const count = item._count.id
      if (item.eventType === "tool_open") entry.opens = count
      else if (item.eventType === "calculate") entry.calculations = count
      else if (item.eventType === "preview") entry.previews = count
      else if (item.eventType === "pdf_download") entry.downloads = count
      else if (item.eventType === "share") entry.shares = count
    }

    const eventSummaryRows = allTools
      .filter((t) => scope !== "current" || categoryFilter === "all" || t.category === categoryFilter)
      .map((tool) => {
        const counts = eventSummaryMap.get(tool.id) || { opens: 0, calculations: 0, previews: 0, downloads: 0, shares: 0 }
        return {
          Tool: tool.name,
          Category: tool.category,
          "Tool Opens": counts.opens,
          Calculations: counts.calculations,
          Previews: counts.previews,
          "PDF Downloads": counts.downloads,
          Shares: counts.shares,
        }
      })

    const wsEventSummary = XLSX.utils.json_to_sheet(eventSummaryRows)
    wsEventSummary["!cols"] = [
      { wch: 28 },
      { wch: 24 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
    ]

    // ------------------------------------------
    // SHEET 5: Recent Activity
    // ------------------------------------------
    const recentActivityRows = recentEventsList.map((ev) => ({
      Timestamp: new Date(ev.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      Tool: ev.toolName,
      Category: ev.category,
      Event:
        ev.eventType === "pdf_download"
          ? "PDF Download"
          : ev.eventType === "tool_open"
          ? "Tool Open"
          : ev.eventType === "preview"
          ? "Preview"
          : ev.eventType === "calculate"
          ? "Calculation"
          : ev.eventType === "share"
          ? "Share"
          : ev.eventType,
    }))

    const wsRecent = XLSX.utils.json_to_sheet(
      recentActivityRows.length > 0
        ? recentActivityRows
        : [{ Timestamp: "No recent events", Tool: "-", Category: "-", Event: "-" }]
    )
    wsRecent["!cols"] = [{ wch: 26 }, { wch: 28 }, { wch: 24 }, { wch: 20 }]

    // Append sheets with exact names specified in instructions
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")
    XLSX.utils.book_append_sheet(wb, wsToolRows, "Downloads by Tool")
    XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Downloads")
    XLSX.utils.book_append_sheet(wb, wsEventSummary, "Event Summary")
    XLSX.utils.book_append_sheet(wb, wsRecent, "Recent Activity")

    // Generate binary buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    // Log admin export action
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"

    await logAdminAction({
      action: "Report export",
      adminEmail: session.email,
      ipAddress: ip,
      details: `Exported Excel report "${filename}" (${scope})`,
    })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (err: any) {
    console.error("[Admin Export API Error]", err)
    return NextResponse.json({ error: "Failed to export Excel report" }, { status: 500 })
  }
}
