"use client"

import React, { useState } from "react"
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Table,
  BarChart,
  Clock,
  Loader2,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TurnivoSelect } from "@/components/ui/turnivo-select"

const DATE_RANGE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" },
]

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Document Generators", label: "Document Generators" },
  { value: "Financial Calculators", label: "Financial Calculators" },
  { value: "Utilities & Tools", label: "Utilities & Tools" },
]

export default function AdminReportsPage() {
  const [selectedRange, setSelectedRange] = useState("30d")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [exportScope, setExportScope] = useState<"current" | "all">("current")

  const todayStr = new Date().toISOString().split("T")[0]
  const expectedFileName = `TURNIVO-download-report-${todayStr}.xlsx`

  const handleDownload = async (scope: "current" | "all") => {
    setIsExporting(true)
    setExportScope(scope)

    try {
      const params = new URLSearchParams()
      params.set("scope", scope)
      if (scope === "current") {
        params.set("range", selectedRange)
        if (selectedCategory !== "all") params.set("category", selectedCategory)
        if (selectedRange === "custom" && customStart) {
          params.set("startDate", customStart)
          if (customEnd) params.set("endDate", customEnd)
        }
      }

      const res = await fetch(`/api/admin/analytics/export?${params.toString()}`)
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = expectedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Failed to export Excel report. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Excel Export Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Download & Usage Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export comprehensive multi-sheet Excel workbooks with professional headers, formatting, and audit-ready data.
        </p>
      </div>

      {/* Export Action Card */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated File Preview
            </span>
            <div className="flex items-center gap-2 mt-1">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white break-all">
                {expectedFileName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Includes 5 pre-formatted sheets: Summary, Downloads by Tool, Daily Downloads, Event Summary, and Recent Activity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Button
              onClick={() => handleDownload("current")}
              disabled={isExporting}
              className="h-11 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-2 cursor-pointer"
            >
              {isExporting && exportScope === "current" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export Current View</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDownload("all")}
              disabled={isExporting}
              className="h-11 px-5 rounded-xl font-bold text-xs border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 gap-2 cursor-pointer"
            >
              {isExporting && exportScope === "all" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export All Permitted Data</span>
            </Button>
          </div>
        </div>

        {/* Filter Configuration for Current View */}
        <div className="pt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Current View Filter Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Range Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Date Range Preset
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DATE_RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedRange(preset.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedRange === preset.id
                        ? "bg-violet-600 text-white shadow-xs shadow-violet-500/20"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Filter by Category
              </label>
              <TurnivoSelect
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={CATEGORY_OPTIONS}
                size="md"
              />
            </div>
          </div>

          {selectedRange === "custom" && (
            <div className="flex items-center gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">From Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">To Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sheets Structure Card */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Workbook Architecture (5 Sheets)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* SHEET 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>Sheet 1: Summary</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Report date, date range, total downloads, total uses, top tool, and top category metrics.
            </p>
          </div>

          {/* SHEET 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Table className="w-4 h-4" />
              <span>Sheet 2: Downloads by Tool</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tool name, category, total downloads (sorted desc), today, this month, first & last download dates.
            </p>
          </div>

          {/* SHEET 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <BarChart className="w-4 h-4" />
              <span>Sheet 3: Daily Downloads</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Chronological daily breakdown with Date and Total Downloads for charting and analysis.
            </p>
          </div>

          {/* SHEET 4 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Sheet 4: Event Summary</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full funnel tracking: Tool, Opens, Calculations, Previews, PDF Downloads, and Shares.
            </p>
          </div>

          {/* SHEET 5 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Sheet 5: Recent Activity</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Chronological log of recent telemetry events with Timestamp, Tool, Category, and Event.
            </p>
          </div>

          {/* STANDARDS */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Formatting Standards</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Frozen bold header rows, auto-sized columns, and standard ISO date formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
