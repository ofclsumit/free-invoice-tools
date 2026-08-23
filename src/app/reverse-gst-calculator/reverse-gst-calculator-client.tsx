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
  UltraResetButton,
  UltraEmptyState,
  UltraInput,
  UltraRateSelector,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
} from "@/components/ultra/ultra-components"

const GST_RATES = [0, 5, 12, 18, 28]

export function ReverseGstCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [totalAmount, setTotalAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const total = parseFloat(totalAmount) || 0
  const baseAmount = (total * 100) / (100 + gstRate)
  const gstAmount = total - baseAmount
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (total > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid total amount is required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setTotalAmount("")
    setGstRate(18)
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Reverse GST Calculation Report",
    mode: "reverse" as const,
    baseAmount,
    gstRate,
    gstAmount,
    totalAmount: total,
    cgst,
    sgst,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate reverse GST before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "reverse-gst-calculator",
      title: "Reverse GST Report Preview",
      fileName: `reverse-gst-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate reverse GST before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `reverse-gst-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Reverse GST PDF..." />}

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
            placeholder="Total Amount (Inclusive of GST)"
            currencySymbol="₹"
            value={totalAmount}
            onChange={(e) => {
              setTotalAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraRateSelector
            rates={GST_RATES}
            value={gstRate}
            onChange={setGstRate}
            labels={{ 0: "Exempt", 5: "Basic", 12: "Mid", 18: "Standard", 28: "Luxury" }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Reverse GST
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(total > 0) ? (
            <UltraEmptyState actionText="Calculate" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Reverse GST
              </div>

              <UltraResultsGrid>
                <UltraResultCard color="main" label="Total (Inclusive)" value={`₹${fmt(total)}`} sub={`Including ${gstRate}% GST`} />
                <UltraResultCard color="green" label="Base Amount" value={`₹${fmt(baseAmount)}`} sub="Without GST" />
                <UltraResultCard color="amber" label="GST Amount" value={`₹${fmt(gstAmount)}`} sub={`${gstRate}% GST`} />
              </UltraResultsGrid>

              <div className="mt-4 p-4 sm:p-5 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/[0.04]">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-white/65">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-indigo-600" />
                    CGST ({gstRate / 2}%)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-indigo-400">₹{fmt(cgst)}</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-2.5">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-white/65">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-purple-600" />
                    SGST ({gstRate / 2}%)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-purple-400">₹{fmt(sgst)}</span>
                </div>
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
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </UltraPrimaryButton>
              </div>
            </>
          )}
        </UltraCard>
      </UltraGrid>
    </>
  )
}
