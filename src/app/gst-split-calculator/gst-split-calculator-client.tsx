"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraSectionLabel, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraEmptyState, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

const GST_RATES = [0, 5, 12, 18, 28]

interface SplitEntry {
  rate: number
  percentage: number
}

export function GstSplitCalculatorClient() {
  const [totalAmount, setTotalAmount] = useState("")
  const [splits, setSplits] = useState<SplitEntry[]>(
    GST_RATES.map(rate => ({ rate, percentage: 0 }))
  )
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const total = parseFloat(totalAmount) || 0

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)
  const remaining = Math.max(0, 100 - totalPercentage)

  const updateSplit = (rate: number, value: string) => {
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setSplits(prev => prev.map(s => s.rate === rate ? { ...s, percentage: num } : s))
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (total > 0 && splits.some(s => s.percentage > 0)) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setTotalAmount("")
    setSplits(GST_RATES.map(rate => ({ rate, percentage: 0 })))
    setCalculated(false)
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `gst-split-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const totalAllocated = splits.filter(s => s.percentage > 0).reduce((sum, s) => sum + (total * s.percentage) / 100, 0)
  const allocatedPortion = calculated && total > 0 ? (totalAllocated / total) * 100 : 0

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
                  style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                >
                  <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                    <div className="text-right w-full">
                      <h1 className="text-3xl font-light text-violet-600 uppercase tracking-widest mb-2">GST Split Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">GST Split Calculation</h3>
                    <p className="text-gray-500 text-sm">A detailed breakdown of total amount across various GST rates.</p>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                      <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-3xl font-display font-bold text-gray-900">₹{fmt(total)}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {splits.filter(s => s.percentage > 0).map(s => {
                        const allocated = (total * s.percentage) / 100
                        const gstOnAllocated = (allocated * s.rate) / 100
                        const cgst = gstOnAllocated / 2
                        const sgst = gstOnAllocated / 2
                        return (
                          <div key={s.rate} className="bg-muted/30 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">{s.rate}% GST Category ({s.percentage}%)</span>
                              <span className="text-lg font-semibold">₹{fmt(allocated)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-gray-100">
                              <span>GST Amount: ₹{fmt(gstOnAllocated)}</span>
                              <span>(CGST: ₹{fmt(cgst)} / SGST: ₹{fmt(sgst)})</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {remaining > 0 && (
                      <div className="bg-red-50 p-4 rounded-xl flex justify-between items-center">
                         <span className="text-red-600 font-medium">Unallocated ({remaining.toFixed(0)}%)</span>
                         <span className="text-red-600 font-bold">₹{fmt((total * remaining) / 100)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the Turnivo GST Split Calculator.
                    </p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </div>

      <UltraShell>
        <UltraNav />
        <UltraPage>
          <UltraHeader
            badge="GST Split"
            title={"GST Split\nCalculator"}
            subtitle="Allocate a total amount across different GST rate slabs and see the breakdown."
          />

          <UltraGrid>
            {/* ─── CALCULATE CARD ─── */}
            <UltraCard>
              <UltraCardHeader title="Calculate" />

              <UltraInput
                type="number"
                placeholder="Total Amount"
                currencySymbol="₹"
                value={totalAmount}
                onChange={e => { setTotalAmount(e.target.value); setCalculated(false) }}
              />

              <div className="space-y-3 mt-4">
                <UltraSectionLabel>Split Percentage by GST Rate</UltraSectionLabel>
                {splits.map(s => (
                  <div key={s.rate} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-white w-12 flex-shrink-0">{s.rate}%</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={s.percentage || ""}
                        onChange={e => { updateSplit(s.rate, e.target.value); setCalculated(false) }}
                        className="w-full bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white text-sm outline-none px-4 py-2.5 transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-400 dark:placeholder-white/30"
                      />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-white/70 w-24 text-right font-mono font-semibold">
                      ₹{fmt((total * s.percentage) / 100)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-bold text-slate-500 dark:text-white/50 w-12 flex-shrink-0">Rem.</span>
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

            {/* ─── RESULTS CARD ─── */}
            <UltraCard>
              <UltraCardHeader title="Results" />

              {!calculated || !(total > 0 && splits.some(s => s.percentage > 0)) ? (
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
                    <UltraResultCard label="Unallocated" value={`₹${fmt((total * remaining) / 100)}`} color={remaining > 0 ? "amber" : "green"} />
                  </UltraResultsGrid>

                  <div className="space-y-2 mt-4">
                    {splits.filter(s => s.percentage > 0).map(s => {
                      const allocated = (total * s.percentage) / 100
                      const gstOnAllocated = (allocated * s.rate) / 100
                      const cgst = gstOnAllocated / 2
                      const sgst = gstOnAllocated / 2
                      return (
                        <div key={s.rate} className="bg-slate-50 border border-slate-200 dark:bg-white/[0.04] dark:border-white/[0.06] rounded-xl p-3 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.rate}% GST Category ({s.percentage}%)</span>
                            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">₹{fmt(allocated)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-600 dark:text-white/65">
                            <span>GST: ₹{fmt(gstOnAllocated)}</span>
                            <span>(CGST: ₹{fmt(cgst)} / SGST: ₹{fmt(sgst)})</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4">
                    <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                  </UltraPrimaryButton>
                </>
              )}
            </UltraCard>
          </UltraGrid>
        </UltraPage>
      </UltraShell>
    </>
  )
}
