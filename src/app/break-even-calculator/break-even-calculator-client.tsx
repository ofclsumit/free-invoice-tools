"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { BreakEvenDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraEmptyState,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraProgressBar,
  UltraPrimaryButton,
  UltraResetButton,
} from "@/components/ultra/ultra-components"

export function BreakEvenCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [fixedCost, setFixedCost] = useState("")
  const [variableCost, setVariableCost] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [calculated, setCalculated] = useState(false)

  const FC = parseFloat(fixedCost) || 0
  const VC = parseFloat(variableCost) || 0
  const SP = parseFloat(sellingPrice) || 0
  const contribution = SP - VC

  const breakEvenUnits = contribution > 0 ? FC / contribution : 0
  const breakEvenRevenue = breakEvenUnits * SP
  const cmRatio = SP > 0 ? (contribution / SP) * 100 : 0

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtUnits = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 0 })

  const handleCalculate = () => {
    if (FC > 0 && SP > 0 && contribution > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({
        title: "Valid numbers required",
        description: "Ensure Fixed Costs > 0 and Selling Price > Variable Cost.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setFixedCost("")
    setVariableCost("")
    setSellingPrice("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Break-Even & Cost-Volume-Profit Analysis Report",
    fixedCosts: FC,
    variableCost: VC,
    sellingPrice: SP,
    breakEvenUnits,
    breakEvenRevenue,
    contributionMargin: contribution,
    contributionMarginRatio: cmRatio,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(FC > 0 && contribution > 0)) {
      toast({ title: "Calculate first", description: "Please calculate break-even before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "break-even-calculator",
      title: "Break-Even Analysis Preview",
      fileName: `break-even-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(FC > 0 && contribution > 0)) {
      toast({ title: "Calculate first", description: "Please calculate break-even before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `break-even-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Break-Even Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <BreakEvenDocument {...getDocData()} />
      </div>

      <UltraGrid>
        <UltraCard>
          <UltraCardHeader title="Cost & Pricing Inputs" />

          <UltraInput
            type="number"
            placeholder="Total Fixed Overhead Costs"
            currencySymbol="₹"
            value={fixedCost}
            onChange={(e) => {
              setFixedCost(e.target.value)
              setCalculated(false)
            }}
          />
          <UltraInput
            type="number"
            step="0.01"
            placeholder="Variable Cost Per Unit"
            currencySymbol="₹"
            value={variableCost}
            onChange={(e) => {
              setVariableCost(e.target.value)
              setCalculated(false)
            }}
          />
          <UltraInput
            type="number"
            step="0.01"
            placeholder="Selling Price Per Unit"
            currencySymbol="₹"
            value={sellingPrice}
            onChange={(e) => {
              setSellingPrice(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Break-Even
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(FC > 0 && SP > 0 && contribution > 0) ? (
            <UltraEmptyState actionText="Calculate" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Break-Even Analysis
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Break-Even Units" value={`${fmtUnits(breakEvenUnits)} Units`} color="main" />
                <UltraResultCard label="Break-Even Revenue" value={`₹${fmt(breakEvenRevenue)}`} color="green" />
                <UltraResultCard label="Unit Margin (CM)" value={`₹${fmt(contribution)}`} color="blue" />
                <UltraResultCard label="CM Ratio" value={`${cmRatio.toFixed(1)}%`} color="amber" />
              </UltraResultsGrid>

              <UltraProgressBar
                label="Contribution Margin vs Price"
                percent={Math.min(100, Math.max(0, cmRatio))}
              />

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
