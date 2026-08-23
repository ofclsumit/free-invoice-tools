"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { GstDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraSectionLabel,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraEmptyState,
  UltraPrimaryButton,
  UltraResetButton,
} from "@/components/ultra/ultra-components"

const GST_RATES = [0, 5, 12, 18, 28]

interface SplitEntry {
  rate: number
  percentage: number
}

export function GstSplitCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [totalAmount, setTotalAmount] = useState("")
  const [splits, setSplits] = useState<SplitEntry[]>(
    GST_RATES.map((rate) => ({ rate, percentage: 0 }))
  )
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const total = parseFloat(totalAmount) || 0
  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)
  const remaining = Math.max(0, 100 - totalPercentage)

  const updateSplit = (rate: number, value: string) => {
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setSplits((prev) => prev.map((s) => (s.rate === rate ? { ...s, percentage: num } : s)))
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (total > 0 && splits.some((s) => s.percentage > 0)) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid total and split allocation required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setTotalAmount("")
    setSplits(GST_RATES.map((rate) => ({ rate, percentage: 0 })))
    setCalculated(false)
  }

  const totalAllocated = splits
    .filter((s) => s.percentage > 0)
    .reduce((sum, s) => sum + (total * s.percentage) / 100, 0)

  const totalGstCalculated = splits
    .filter((s) => s.percentage > 0)
    .reduce((sum, s) => sum + (((total * s.percentage) / 100) * s.rate) / 100, 0)

  const allocatedPortion = calculated && total > 0 ? (totalAllocated / total) * 100 : 0

  const getDocData = () => ({
    title: "GST Multi-Rate Split & Allocation Report",
    mode: "split" as const,
    baseAmount: totalAllocated,
    gstRate: Math.round((totalGstCalculated / (totalAllocated || 1)) * 100),
    gstAmount: totalGstCalculated,
    totalAmount: totalAllocated + totalGstCalculated,
    cgst: totalGstCalculated / 2,
    sgst: totalGstCalculated / 2,
    notes: `Split Summary: ${splits
      .filter((s) => s.percentage > 0)
      .map((s) => `${s.rate}% slab: ₹${fmt((total * s.percentage) / 100)} (${s.percentage}%)`)
      .join(" • ")}`,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate split before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "gst-split-calculator",
      title: "GST Split Report Preview",
      fileName: `gst-split-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate split before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `gst-split-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating GST Split PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <GstDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Calculate" />

          <UltraInput
            type="number"
            placeholder="Total Amount"
            currencySymbol="₹"
            value={totalAmount}
            onChange={(e) => {
              setTotalAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="space-y-3 mt-4">
            <UltraSectionLabel>Split Percentage by GST Rate</UltraSectionLabel>
            {splits.map((s) => (
              <div key={s.rate} className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800 dark:text-white w-12 flex-shrink-0">
                  {s.rate}%
                </span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={s.percentage || ""}
                    onChange={(e) => {
                      updateSplit(s.rate, e.target.value)
                      setCalculated(false)
                    }}
                    className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white text-sm outline-none px-4 py-2.5 transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-400 dark:placeholder-white/30"
                  />
                </div>
                <span className="text-sm text-slate-700 dark:text-white/70 w-24 text-right font-mono font-semibold">
                  ₹{fmt((total * s.percentage) / 100)}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-bold text-slate-500 dark:text-white/50 w-12 flex-shrink-0">
                Rem.
              </span>
              <div className="flex-1">
                <div className="h-10 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.12] flex items-center px-3 text-sm text-slate-600 dark:text-white/60 bg-slate-50 dark:bg-black/20 font-medium">
                  {remaining.toFixed(0)}% unallocated
                </div>
              </div>
              <span className="text-sm text-slate-500 dark:text-white/50 w-24 text-right font-mono font-medium">
                ₹{fmt((total * remaining) / 100)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Split
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(total > 0 && splits.some((s) => s.percentage > 0)) ? (
            <UltraEmptyState actionText="Calculate Split" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                GST Split Breakdown
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Total Amount" value={`₹${fmt(total)}`} color="blue" />
                <UltraResultCard label="Total Allocated" value={`₹${fmt(totalAllocated)}`} color="green" />
                <UltraResultCard label="Allocated %" value={`${allocatedPortion.toFixed(1)}%`} color="main" />
                <UltraResultCard
                  label="Unallocated"
                  value={`₹${fmt((total * remaining) / 100)}`}
                  color={remaining > 0 ? "amber" : "green"}
                />
              </UltraResultsGrid>

              <div className="space-y-2 mt-4">
                {splits
                  .filter((s) => s.percentage > 0)
                  .map((s) => {
                    const allocated = (total * s.percentage) / 100
                    const gstOnAllocated = (allocated * s.rate) / 100
                    const cgst = gstOnAllocated / 2
                    const sgst = gstOnAllocated / 2
                    return (
                      <div
                        key={s.rate}
                        className="bg-slate-50 border border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded-xl p-3 space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {s.rate}% GST Category ({s.percentage}%)
                          </span>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                            ₹{fmt(allocated)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-white/65">
                          <span>GST: ₹{fmt(gstOnAllocated)}</span>
                          <span>
                            (CGST: ₹{fmt(cgst)} / SGST: ₹{fmt(sgst)})
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePreviewPDF}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Eye className="w-4 h-4" /> Preview PDF
                </button>

                <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </UltraPrimaryButton>
              </div>
            </>
          )}
        </UltraCard>
      </UltraGrid>
    </>
  )
}
