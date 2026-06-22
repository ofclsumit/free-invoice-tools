"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download, Eye, ArrowLeft } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

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

  if (showPreview) {
    return (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
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
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Total Amount (₹)</Label>
        <Input
          type="number"
          placeholder="Enter total amount"
          value={totalAmount}
          onChange={e => setTotalAmount(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      {total > 0 && (
        <>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <Label className="text-xs font-medium">Split Percentage by GST Rate</Label>
            {splits.map(s => (
              <div key={s.rate} className="flex items-center gap-3">
                <span className="text-sm font-semibold w-12 flex-shrink-0">{s.rate}%</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={s.percentage || ""}
                    onChange={e => updateSplit(s.rate, e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <span className="text-sm text-muted-foreground w-24 text-right font-medium">
                  ₹{fmt((total * s.percentage) / 100)}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-semibold w-12 flex-shrink-0 text-muted-foreground">Rem.</span>
              <div className="flex-1">
                <div className="h-10 rounded-xl border border-dashed border-border flex items-center px-3 text-sm text-muted-foreground">
                  {remaining.toFixed(0)}% unallocated
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-24 text-right font-medium">
                ₹{fmt((total * remaining) / 100)}
              </span>
            </div>
          </div>

          {splits.some(s => s.percentage > 0) && (
            <div className="space-y-3 pt-2">
              <div className="h-px bg-border" />
              <p className="text-xs font-semibold text-muted-foreground">Amount by GST Rate</p>
              {splits.filter(s => s.percentage > 0).map(s => {
                const allocated = (total * s.percentage) / 100
                const gstOnAllocated = (allocated * s.rate) / 100
                const cgst = gstOnAllocated / 2
                const sgst = gstOnAllocated / 2
                return (
                  <div key={s.rate} className="bg-muted/30 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{s.rate}% GST Category</span>
                      <span className="text-sm font-semibold">₹{fmt(allocated)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>GST Amount: ₹{fmt(gstOnAllocated)}</span>
                      <span>(CGST: ₹{fmt(cgst)} / SGST: ₹{fmt(sgst)})</span>
                    </div>
                  </div>
                )
              })}
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="font-display font-bold">Total Allocated</span>
                <span className="font-display font-bold text-xl text-violet-600 dark:text-violet-400">
                  ₹{fmt(splits.filter(s => s.percentage > 0).reduce((sum, s) => sum + (total * s.percentage) / 100, 0))}
                </span>
              </div>
            </div>
          )}
          
          <Button onClick={() => setShowPreview(true)} className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-semibold gap-2">
            <Eye className="h-4 w-4" /> Show Preview
          </Button>
        </>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 flex-1" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  )
}
