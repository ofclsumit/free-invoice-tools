"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Download,
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/shared/loading/skeleton"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
import { useAdmin } from "@/components/admin/admin-context"

interface ToolDownloadItem {
  id: string
  name: string
  category: string
  url: string
  totalDownloads: number
  downloadsToday: number
  downloadsThisMonth: number
  lastDownload: string | null
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Document Generators", label: "Document Generators" },
  { value: "Financial Calculators", label: "Financial Calculators" },
  { value: "Utilities & Tools", label: "Utilities & Tools" },
]

export default function AdminDownloadsPage() {
  const { refreshKey } = useAdmin()

  const [toolsList, setToolsList] = useState<ToolDownloadItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortField, setSortField] = useState<keyof ToolDownloadItem>("totalDownloads")
  const [sortAsc, setSortAsc] = useState(false)

  const fetchData = useCallback(async () => {
    setError(false)
    try {
      const res = await fetch(`/api/admin/analytics/tools?category=${selectedCategory}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setToolsList(data.downloadsTable || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  const handleSort = (field: keyof ToolDownloadItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Filter & Sort
  const filteredTools = useMemo(() => {
    let result = [...toolsList]

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

      if (valA === null) return 1
      if (valB === null) return -1

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA
      }

      return 0
    })

    return result
  }, [toolsList, searchQuery, sortField, sortAsc])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>PDF Export Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Downloads by Tool
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Confirmed, verified file downloads across all 28 Turnivo document tools and calculators.
          </p>
        </div>

        <Link href="/admin/reports">
          <Button
            size="sm"
            className="h-9 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0F1422] border border-slate-200 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-9.5 h-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs rounded-xl"
          />
        </div>

        <div className="w-full sm:w-60">
          <TurnivoSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={CATEGORY_OPTIONS}
            size="md"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
            Failed to load download metrics.
          </p>
          <Button size="sm" onClick={fetchData} className="text-xs h-8">
            Try Again
          </Button>
        </div>
      )}

      {/* Table */}
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
                  onClick={() => handleSort("totalDownloads")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Downloads</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("downloadsToday")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Today</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("downloadsThisMonth")}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>This Month</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("lastDownload")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Last Download</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Loading tool download metrics...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No tools matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{tool.name}</span>
                        <Link
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                          title="Open live tool"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {tool.category}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {tool.totalDownloads.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {tool.downloadsToday.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {tool.downloadsThisMonth.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatDate(tool.lastDownload)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
