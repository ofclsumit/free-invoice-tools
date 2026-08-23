"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { ProfitMarginDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraEmptyState,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraResetButton,
} from "@/components/ultra/ultra-components"

export function DiscountCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const price = parseFloat(originalPrice) || 0
  const rate = parseFloat(discountRate) || 0

  const discountAmount = (price * rate) / 100
  const finalPrice = price - discountAmount

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (price > 0 && rate > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid original price and discount rate required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setOriginalPrice("")
    setDiscountRate("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Discount & Pricing Calculation Report",
    isDiscount: true,
    costPrice: price,
    sellingPrice: finalPrice,
    profitOrDiscountAmount: discountAmount,
    percentage: rate,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(price > 0 && rate > 0)) {
      toast({ title: "Calculate first", description: "Please calculate discount before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "discount-calculator",
      title: "Discount Calculation Preview",
      fileName: `discount-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(price > 0 && rate > 0)) {
      toast({ title: "Calculate first", description: "Please calculate discount before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `discount-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Discount Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <ProfitMarginDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Calculate Discount" />

          <UltraInput
            type="number"
            placeholder="Original Catalog / List Price"
            currencySymbol="₹"
            value={originalPrice}
            onChange={(e) => {
              setOriginalPrice(e.target.value)
              setCalculated(false)
            }}
          />
          <UltraInput
            type="number"
            step="0.1"
            placeholder="Discount Percentage"
            suffix="%"
            value={discountRate}
            onChange={(e) => {
              setDiscountRate(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Discount
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(price > 0 && rate > 0) ? (
            <UltraEmptyState actionText="Calculate Discount" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Discount Details
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Original Price" value={`₹${fmt(price)}`} color="blue" />
                <UltraResultCard label={`Discount (${rate}%)`} value={`-₹${fmt(discountAmount)}`} color="amber" />
                <UltraResultCard label="Final Price" value={`₹${fmt(finalPrice)}`} color="main" />
                <UltraResultCard label="You Save" value={`₹${fmt(discountAmount)} (${rate}%)`} color="green" />
              </UltraResultsGrid>

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
