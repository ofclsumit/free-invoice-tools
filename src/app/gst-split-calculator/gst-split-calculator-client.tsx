"use client"
import { useState } from "react"
import { Download, ArrowLeft, Export, RotateCcw } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraInput, UltraPrimaryButton,
  UltraDivider, UltraResultCard, UltraResultsGrid, UltraResetButton,
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
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const total = parseFloat(totalAmount) || 0

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)
  const remaining = Math.max(0, 100 - totalPercentage)

  const updateSplit = (rate: number, value: string) => {
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0))
    setSplits(prev => prev.map(s => s.rate === rate ? { ...s, percentage: num } : s))
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setTotalAmount("")
    setSplits(GST_RATES.map(rate => ({ rate, percentage: 0 })))
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

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium border border-border transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </button>
            </div>

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
                      This report was generated using the QuoteFlow GST Split Calculator.
                    </p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>

      <UltraShell>
        <UltraHeader badge="GST Split" title={<>GST Split<br/>Calculator</>} subtitle="Allocate a total amount across different GST rate slabs and see the breakdown." />

        <UltraCard>
          <UltraInput
            type="number"
            placeholder="Total Amount"
            currencySymbol="₹"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
          />

          <UltraDivider />

          {total > 0 && (
            <>
              <div className="space-y-3 mb-6">
                <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">Split Percentage by GST Rate</label>
                {splits.map(s => (
                  <div key={s.rate} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#f1f5f9] w-12 flex-shrink-0">{s.rate}%</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={s.percentage || ""}
                        onChange={e => updateSplit(s.rate, e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.12] rounded-xl text-white text-sm outline-none px-4 py-2.5 focus:border-indigo-500/60 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                      />
                    </div>
                    <span className="text-sm text-[#f1f5f9]/65 w-24 text-right font-medium font-['Space_Grotesk']">
                      ₹{fmt((total * s.percentage) / 100)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-sm font-semibold text-[#f1f5f9]/50 w-12 flex-shrink-0">Rem.</span>
                  <div className="flex-1">
                    <div className="h-10 rounded-xl border border-dashed border-white/[0.08] flex items-center px-3 text-sm text-[#f1f5f9]/50 bg-black/20">
                      {remaining.toFixed(0)}% unallocated
                    </div>
                  </div>
                  <span className="text-sm text-[#f1f5f9]/50 w-24 text-right font-medium font-['Space_Grotesk']">
                    ₹{fmt((total * remaining) / 100)}
                  </span>
                </div>
              </div>

              {splits.some(s => s.percentage > 0) && (
                <>
                  <UltraDivider />
                  <div className="space-y-3 mb-9">
                    <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65">Amount by GST Rate</p>
                    {splits.filter(s => s.percentage > 0).map(s => {
                      const allocated = (total * s.percentage) / 100
                      const gstOnAllocated = (allocated * s.rate) / 100
                      const cgst = gstOnAllocated / 2
                      const sgst = gstOnAllocated / 2
                      return (
                        <div key={s.rate} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#f1f5f9]">{s.rate}% GST Category</span>
                            <span className="text-sm font-semibold text-[#f1f5f9]">₹{fmt(allocated)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-[#f1f5f9]/65">
                            <span>GST Amount: ₹{fmt(gstOnAllocated)}</span>
                            <span>(CGST: ₹{fmt(cgst)} / SGST: ₹{fmt(sgst)})</span>
                          </div>
                        </div>
                      )
                    })}
                    <UltraDivider />
                    <div className="flex justify-between items-center">
                      <span className="font-['Space_Grotesk'] font-bold text-[#f1f5f9]">Total Allocated</span>
                      <span className="font-['Space_Grotesk'] font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        ₹{fmt(splits.filter(s => s.percentage > 0).reduce((sum, s) => sum + (total * s.percentage) / 100, 0))}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mb-6">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
            </>
          )}

          <UltraResetButton onClick={handleReset} />
        </UltraCard>
      </UltraShell>
    </>
  )
}
