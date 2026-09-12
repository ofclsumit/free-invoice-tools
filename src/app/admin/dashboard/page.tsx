"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Download,
  Users,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  RefreshCw,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/loading/skeleton"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
import { useAdmin } from "@/components/admin/admin-context"

interface MetricData {
  totalPdfDownloads: number
  totalToolUses: number
  mostUsedTool: string
  mostUsedToolCount: number
  downloadsToday: number
  downloadsThisMonth: number
  filteredPdfDownloads: number
}

interface TopTool {
  rank: number
  id: string
  name: string
  category: string
  downloads: number
  percentage: number
}

interface CategoryBreakdown {
  category: string
  downloads: number
  percentage: number
}

interface BreakdownItem {
  device?: string
  country?: string
  count: number
  percentage: number
}

interface RecentEvent {
  id: string
  toolId: string
  toolName: string
  category: string
  eventType: string
  downloadType?: string
  country?: string
  deviceType?: string
  createdAt: string
}

const DATE_RANGE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom" },
]

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Document Generators", label: "Document Generators" },
  { value: "Financial Calculators", label: "Financial Calculators" },
  { value: "Utilities & Tools", label: "Utilities & Tools" },
]

export default function AdminDashboardPage() {
  const { refreshKey, isRefreshing, triggerRefresh } = useAdmin()

  // Filters State
  const [selectedRange, setSelectedRange] = useState("30d")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  // Data State
  const [metrics, setMetrics] = useState<MetricData | null>(null)
  const [dailyTrend, setDailyTrend] = useState<{ date: string; downloads: number }[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [topTools, setTopTools] = useState<TopTool[]>([])
  const [deviceBreakdown, setDeviceBreakdown] = useState<BreakdownItem[]>([])
  const [countryBreakdown, setCountryBreakdown] = useState<BreakdownItem[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentEvent[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch Dashboard Analytics
  const fetchDashboardData = useCallback(async () => {
    setError(false)
    try {
      const params = new URLSearchParams()
      params.set("range", selectedRange)
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (selectedRange === "custom" && customStart) {
        params.set("startDate", customStart)
        if (customEnd) params.set("endDate", customEnd)
      }

      const res = await fetch(`/api/admin/analytics/overview?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setMetrics(data.metrics)
      setDailyTrend(data.dailyTrend || [])
      setCategoryBreakdown(data.categoryBreakdown || [])
      setTopTools(data.topDownloadedTools || [])
      setDeviceBreakdown(data.deviceBreakdown || [])
      setCountryBreakdown(data.countryBreakdown || [])
      setRecentActivity(data.recentActivity || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedRange, selectedCategory, customStart, customEnd])

  // Refetch when filters or refreshKey changes
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData, refreshKey])

  // Format date helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      if (diffMins < 1) return "just now"
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    } catch {
      return dateStr
    }
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3.5 select-none py-16 animate-in fade-in duration-200">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full bg-violet-500/20 blur-xl pointer-events-none" />
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading analytics overview...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* TOP TITLE & CONTROLS */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turnivo Live Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time tool usage, document generation, and PDF download telemetry.
          </p>
        </div>

        {/* Quick Excel Export Shortcut */}
        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <Button
              size="sm"
              className="h-9 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER BAR: DATE RANGE PRESETS & CATEGORY DROPDOWN */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Range Presets */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5 shrink-0">
            Date Range:
          </span>
          {DATE_RANGE_PRESETS.map((preset) => {
            const isActive = selectedRange === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedRange(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-violet-600 text-white shadow-xs shadow-violet-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        {/* Custom Range Inputs (if active) */}
        {selectedRange === "custom" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
            />
          </div>
        )}

        {/* Category Filter using TurnivoSelect */}
        <div className="flex items-center gap-2 min-w-[200px] shrink-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Category:
          </span>
          <div className="flex-1">
            <TurnivoSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={CATEGORY_OPTIONS}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ERROR STATE */}
      {/* ============================================================ */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
            Unable to load analytics.
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            A network error occurred while connecting to the analytics engine.
          </p>
          <Button
            size="sm"
            onClick={() => fetchDashboardData()}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP-LEVEL METRIC CARDS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* CARD 1: TOTAL PDF DOWNLOADS */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-violet-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total PDF Downloads
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 my-1 rounded-lg" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics?.totalPdfDownloads?.toLocaleString() || 0}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            All-time verified file exports
          </div>
        </div>

        {/* CARD 2: TOTAL TOOL USES */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-blue-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Tool Uses
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 my-1 rounded-lg" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics?.totalToolUses?.toLocaleString() || 0}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Opens, calcs & previews combined
          </div>
        </div>

        {/* CARD 3: MOST USED TOOL */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-amber-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Most Used Tool
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 my-1 rounded-lg" />
          ) : (
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate" title={metrics?.mostUsedTool}>
              {metrics?.mostUsedTool || "None yet"}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono font-medium">
            {metrics?.mostUsedToolCount ? `${metrics.mostUsedToolCount.toLocaleString()} total interactions` : "Awaiting events"}
          </div>
        </div>

        {/* CARD 4: DOWNLOADS TODAY */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Downloads Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 my-1 rounded-lg" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics?.downloadsToday?.toLocaleString() || 0}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Generated since 00:00 IST
          </div>
        </div>

        {/* CARD 5: DOWNLOADS THIS MONTH */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-purple-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Downloads This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 my-1 rounded-lg" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {metrics?.downloadsThisMonth?.toLocaleString() || 0}
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Current calendar month
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHART ROW: DAILY DOWNLOAD TREND + CATEGORY BREAKDOWN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Downloads Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Downloads Over Time
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily successful PDF downloads within selected range
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg">
              {dailyTrend.reduce((acc, curr) => acc + curr.downloads, 0)} Total
            </div>
          </div>

          <div className="h-[260px] w-full mt-2">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : dailyTrend.length === 0 || dailyTrend.every((d) => d.downloads === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/2 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                <Download className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No download data yet in this date range.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Once users download PDFs, the chart will display daily activity.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "rgba(150,150,150,0.8)" }}
                    tickFormatter={(val: string) => {
                      try {
                        const parts = val.split("-")
                        return `${parts[1]}/${parts[2]}`
                      } catch {
                        return val
                      }
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "rgba(150,150,150,0.8)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1422",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "#A78BFA", fontWeight: "bold" }}
                    formatter={(val: any) => [`${val} downloads`, "Downloads"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="downloads"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#downloadGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Downloads by Category (1 col) */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Downloads by Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Category distribution for selected view
                </p>
              </div>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            {loading ? (
              <div className="space-y-4 my-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-slate-500">No category data recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.downloads.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/admin/downloads" className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1">
              View Detailed Downloads Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECOND ROW: TOP 5 TOOLS + DEVICE & COUNTRY BREAKDOWN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP 5 DOWNLOADED TOOLS */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Top Downloaded Tools
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest converting tools by downloads
              </p>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : topTools.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-slate-500">No tool download rankings available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        tool.rank === 1
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : tool.rank === 2
                          ? "bg-slate-500/15 text-slate-700 dark:text-slate-300"
                          : tool.rank === 3
                          ? "bg-amber-700/15 text-amber-700 dark:text-amber-500"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500"
                      }`}
                    >
                      {tool.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tool.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {tool.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {tool.downloads.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">({tool.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DEVICE BREAKDOWN */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Device Breakdown
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Usage by client device type
                </p>
              </div>
              <Laptop className="w-4 h-4 text-slate-400" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : deviceBreakdown.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-slate-500">
                No device telemetry yet.
              </div>
            ) : (
              <div className="space-y-3.5 my-2">
                {deviceBreakdown.map((item) => {
                  const Icon =
                    item.device === "Mobile"
                      ? Smartphone
                      : item.device === "Tablet"
                      ? Tablet
                      : Laptop
                  return (
                    <div key={item.device} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.device}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.count.toLocaleString()} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
            Coarse detection from user-agent header without invasive fingerprinting.
          </div>
        </div>

        {/* COUNTRY BREAKDOWN */}
        <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Coarse Country Breakdown
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target markets: India & United States
                </p>
              </div>
              <Globe className="w-4 h-4 text-emerald-500" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : countryBreakdown.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-xs text-slate-500">
                No country telemetry yet.
              </div>
            ) : (
              <div className="space-y-3.5 my-2">
                {countryBreakdown.map((item) => (
                  <div key={item.country} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.country === "India"
                          ? "🇮🇳 India"
                          : item.country === "United States"
                          ? "🇺🇸 United States"
                          : "🌐 Other"}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
            Privacy-first geo detection. No raw IP addresses or precise locations stored.
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RECENT ACTIVITY TABLE */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Live Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest events recorded across Turnivo tools
            </p>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Tool</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Event</th>
                  <th className="pb-2.5">Device</th>
                  <th className="pb-2.5">Country</th>
                  <th className="pb-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentActivity.map((ev) => {
                  const isDownload = ev.eventType === "pdf_download"
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {ev.toolName}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        {ev.category}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10.5px] uppercase ${
                            isDownload
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                              : ev.eventType === "preview"
                              ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                              : ev.eventType === "calculate"
                              ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {ev.eventType === "pdf_download"
                            ? "PDF Download"
                            : ev.eventType === "tool_open"
                            ? "Tool Open"
                            : ev.eventType}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{ev.deviceType || "Desktop"}</td>
                      <td className="py-2.5 text-slate-500">{ev.country || "India"}</td>
                      <td className="py-2.5 text-right font-mono text-slate-400">
                        {formatTimeAgo(ev.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
