"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  BarChart3,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/loading/skeleton"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
import { useAdmin } from "@/components/admin/admin-context"

interface ToolUsageItem {
  id: string
  name: string
  category: string
  opens: number
  calculations: number
  previews: number
  downloads: number
  shares: number
  openToDownloadRate: number
  previewToDownloadRate: number
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Document Generators", label: "Document Generators" },
  { value: "Financial Calculators", label: "Financial Calculators" },
  { value: "Utilities & Tools", label: "Utilities & Tools" },
]

export default function AdminToolUsagePage() {
  const { refreshKey } = useAdmin()

  const [usageList, setUsageList] = useState<ToolUsageItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortField, setSortField] = useState<keyof ToolUsageItem>("opens")
  const [sortAsc, setSortAsc] = useState(false)

  const fetchData = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch(`/api/admin/analytics/tools?category=${selectedCategory}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setUsageList(data.usageTable || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  const handleSort = (field: keyof ToolUsageItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Filter and sort
  const filteredTools = useMemo(() => {
    let result = [...usageList]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA
      }

      return 0
    })

    return result
  }, [usageList, searchQuery, sortField, sortAsc])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Conversion Funnel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tool Usage & Funnel Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare traffic (Opens) vs engagement (Previews & Calculations) vs conversions (Downloads).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search tools */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name or category..."
            className="pl-9.5 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-60">
          <TurnivoSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={CATEGORY_OPTIONS}
            size="md"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
            Failed to load tool usage metrics.
          </p>
          <Button size="sm" onClick={fetchData} className="text-xs h-8">
            Try Again
          </Button>
        </div>
      )}

      {/* Main Tool Usage Table */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-white/2 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Tool</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th
                  onClick={() => handleSort("opens")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Opens</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("calculations")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Calculations</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("previews")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Previews</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("downloads")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Downloads</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("previewToDownloadRate")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Preview → DL Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Loading tool usage metrics...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No tools matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => {
                  // Funnel conversion highlight
                  const isHighConverting = tool.previewToDownloadRate >= 40 && tool.previews > 0
                  const isDropoff = tool.opens > 10 && tool.downloads === 0

                  return (
                    <tr
                      key={tool.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{tool.name}</span>
                          {isHighConverting && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              High Conv
                            </span>
                          )}
                          {isDropoff && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Dropoff
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                        {tool.category}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {tool.opens.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {tool.calculations.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {tool.previews.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {tool.downloads.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded ${
                            tool.previewToDownloadRate >= 50
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : tool.previewToDownloadRate > 0
                              ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                              : "text-slate-400"
                          }`}
                        >
                          {tool.previews > 0 ? `${tool.previewToDownloadRate}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
