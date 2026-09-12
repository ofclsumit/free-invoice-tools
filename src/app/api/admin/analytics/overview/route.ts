import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getAdminSession } from "@/lib/auth/admin-auth"

export async function GET(req: NextRequest) {
  // 1. Security Check: Admin Session Verification
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") || "30d" // today, 7d, 30d, 90d, year, all, custom
    const categoryFilter = searchParams.get("category") || "all"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Determine Date Filter Range
    const now = new Date()
    let filterStart: Date | null = null
    let filterEnd: Date = now

    if (range === "today") {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (range === "7d") {
      filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === "30d") {
      filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (range === "90d") {
      filterStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    } else if (range === "year") {
      filterStart = new Date(now.getFullYear(), 0, 1)
    } else if (range === "custom" && startDateParam) {
      filterStart = new Date(startDateParam)
      if (endDateParam) {
        filterEnd = new Date(new Date(endDateParam).setHours(23, 59, 59, 999))
      }
    }

    // Build Prisma Date & Category filters
    const whereClause: any = {}
    if (filterStart) {
      whereClause.createdAt = {
        gte: filterStart,
        lte: filterEnd,
      }
    }
    if (categoryFilter && categoryFilter !== "all") {
      whereClause.category = categoryFilter
    }

    // Calculate Today's & This Month's exact bounds for metric cards
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Execute queries in parallel
    const [
      totalPdfDownloads,
      totalToolUses,
      downloadsToday,
      downloadsThisMonth,
      filteredPdfDownloads,
      eventsGroupedByTool,
      pdfGroupedByTool,
      pdfGroupedByCategory,
      deviceBreakdownGroup,
      countryBreakdownGroup,
      recentEvents,
      allEventsForTrend,
    ] = await Promise.all([
      // Total PDF downloads (all time)
      prisma.toolEvent.count({
        where: { eventType: "pdf_download" },
      }),
      // Total Tool Uses (all events, all time)
      prisma.toolEvent.count(),
      // Downloads Today
      prisma.toolEvent.count({
        where: {
          eventType: "pdf_download",
          createdAt: { gte: startOfToday },
        },
      }),
      // Downloads This Month
      prisma.toolEvent.count({
        where: {
          eventType: "pdf_download",
          createdAt: { gte: startOfMonth },
        },
      }),
      // Filtered PDF downloads for current view
      prisma.toolEvent.count({
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
      }),
      // Events grouped by tool to determine Most Used Tool
      prisma.toolEvent.groupBy({
        by: ["toolId", "toolName"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
      // Top downloaded tools in current filter view
      prisma.toolEvent.groupBy({
        by: ["toolId", "toolName", "category"],
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      // Downloads by Category
      prisma.toolEvent.groupBy({
        by: ["category"],
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        _count: { id: true },
      }),
      // Device breakdown
      prisma.toolEvent.groupBy({
        by: ["deviceType"],
        where: whereClause,
        _count: { id: true },
      }),
      // Country breakdown
      prisma.toolEvent.groupBy({
        by: ["country"],
        where: whereClause,
        _count: { id: true },
      }),
      // Recent Activity (last 50 events)
      prisma.toolEvent.findMany({
        where: categoryFilter && categoryFilter !== "all" ? { category: categoryFilter } : {},
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          toolId: true,
          toolName: true,
          category: true,
          eventType: true,
          downloadType: true,
          country: true,
          deviceType: true,
          createdAt: true,
        },
      }),
      // Raw download events within filter range to aggregate daily trend
      prisma.toolEvent.findMany({
        where: {
          ...whereClause,
          eventType: "pdf_download",
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

  // Most used tool calculation
  const mostUsed = eventsGroupedByTool[0]
    ? {
        name: eventsGroupedByTool[0].toolName,
        id: eventsGroupedByTool[0].toolId,
        uses: eventsGroupedByTool[0]._count.id,
      }
    : { name: "None yet", id: "", uses: 0 }

  // Format Top 5 Downloaded Tools
  const topDownloadedTools = pdfGroupedByTool.slice(0, 5).map((item, idx) => {
    const count = item._count.id
    const pct = filteredPdfDownloads > 0 ? (count / filteredPdfDownloads) * 100 : 0
    return {
      rank: idx + 1,
      id: item.toolId,
      name: item.toolName,
      category: item.category,
      downloads: count,
      percentage: Number(pct.toFixed(1)),
    }
  })

  // Format Category Breakdown
  const categoryBreakdown = pdfGroupedByCategory.map((item) => ({
    category: item.category,
    downloads: item._count.id,
    percentage:
      filteredPdfDownloads > 0
        ? Number(((item._count.id / filteredPdfDownloads) * 100).toFixed(1))
        : 0,
  }))

  // Format Device Breakdown
  const totalDeviceEvents = deviceBreakdownGroup.reduce((acc, curr) => acc + curr._count.id, 0)
  const deviceBreakdown = deviceBreakdownGroup.map((item) => ({
    device: item.deviceType || "Desktop",
    count: item._count.id,
    percentage:
      totalDeviceEvents > 0
        ? Number(((item._count.id / totalDeviceEvents) * 100).toFixed(1))
        : 0,
  }))

  // Format Country Breakdown
  const totalCountryEvents = countryBreakdownGroup.reduce((acc, curr) => acc + curr._count.id, 0)
  const countryBreakdown = countryBreakdownGroup.map((item) => ({
    country: item.country || "Other",
    count: item._count.id,
    percentage:
      totalCountryEvents > 0
        ? Number(((item._count.id / totalCountryEvents) * 100).toFixed(1))
        : 0,
  }))

  // Daily Trend Aggregation (Date -> Count)
  const dailyMap = new Map<string, number>()

  for (const ev of allEventsForTrend) {
    const dStr = ev.createdAt.toISOString().split("T")[0]
    dailyMap.set(dStr, (dailyMap.get(dStr) || 0) + 1)
  }

  // Build contiguous daily trend array
  const dailyTrend: { date: string; downloads: number }[] = []
  if (filterStart) {
    const cur = new Date(filterStart)
    const end = new Date(filterEnd)
    // Limit to max 365 daily points
    let points = 0
    while (cur <= end && points < 366) {
      const dStr = cur.toISOString().split("T")[0]
      dailyTrend.push({
        date: dStr,
        downloads: dailyMap.get(dStr) || 0,
      })
      cur.setDate(cur.getDate() + 1)
      points++
    }
  } else {
    // If 'all', list all dates that have data
    const sortedDates = Array.from(dailyMap.keys()).sort()
    for (const d of sortedDates) {
      dailyTrend.push({
        date: d,
        downloads: dailyMap.get(d) || 0,
      })
    }
  }

  return NextResponse.json({
    metrics: {
      totalPdfDownloads,
      totalToolUses,
      mostUsedTool: mostUsed.name,
      mostUsedToolCount: mostUsed.uses,
      downloadsToday,
      downloadsThisMonth,
      filteredPdfDownloads,
    },
    dailyTrend,
    categoryBreakdown,
    topDownloadedTools,
    deviceBreakdown,
    countryBreakdown,
    recentActivity: recentEvents,
    filterInfo: {
      range,
      category: categoryFilter,
      filterStart: filterStart ? filterStart.toISOString() : null,
      filterEnd: filterEnd.toISOString(),
    },
  })
  } catch (err: any) {
    console.error("[Admin Overview API Error]", err)
    return NextResponse.json({ error: "Failed to load analytics overview" }, { status: 500 })
  }
}
