"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { CommissionDocument } from "@/components/calculator-documents"
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

export function CommissionCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [saleAmount, setSaleAmount] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [splitRatio, setSplitRatio] = useState("100")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const sale = parseFloat(saleAmount) || 0
  const rate = parseFloat(commissionRate) || 0
  const split = Math.min(Math.max(parseFloat(splitRatio) || 100, 0), 100)

  const commissionAmount = (sale * rate) / 100
  const yourShare = (commissionAmount * split) / 100
  const otherShare = commissionAmount - yourShare
  const netAmount = sale - commissionAmount

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (sale > 0 && rate > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid sale amount and commission rate required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setSaleAmount("")
    setCommissionRate("")
    setSplitRatio("100")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Sales Commission & Incentive Payout Statement",
    totalSales: sale,
    commissionRate: rate,
    commissionEarned: yourShare,
    totalPayout: yourShare,
    tiers: [
      {
        tier: "Primary Sales Commission",
        salesRange: `Gross Sales ₹${fmt(sale)}`,
        rate,
        amount: commissionAmount,
      },
      ...(split < 100
        ? [
            {
              tier: "Allocated Shareholder Portion",
              salesRange: `${split}% allocation`,
              rate,
              amount: yourShare,
            },
            {
              tier: "Secondary Split / Partner Portion",
              salesRange: `${(100 - split).toFixed(0)}% allocation`,
              rate,
              amount: otherShare,
            },
          ]
        : []),
    ],
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(sale > 0 && rate > 0)) {
      toast({ title: "Calculate first", description: "Please calculate commission before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "commission-calculator",
      title: "Commission Report Preview",
      fileName: `commission-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(sale > 0 && rate > 0)) {
      toast({ title: "Calculate first", description: "Please calculate commission before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `commission-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Commission PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <CommissionDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Calculate Commission" />

          <UltraInput
            type="number"
            placeholder="Gross Realized Sales Volume"
            currencySymbol="₹"
            value={saleAmount}
            onChange={(e) => {
              setSaleAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Commission Rate"
            suffix="%"
            value={commissionRate}
            onChange={(e) => {
              setCommissionRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Your Split Share (0-100%)"
            suffix="%"
            value={splitRatio}
            onChange={(e) => {
              setSplitRatio(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Commission
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(sale > 0 && rate > 0) ? (
            <UltraEmptyState actionText="Calculate" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Commission Breakdown
              </div>

              <UltraResultsGrid>
                <UltraResultCard label={`Total Commission (${rate}%)`} value={`₹${fmt(commissionAmount)}`} color="blue" />
                <UltraResultCard label={`Your Share (${split}%)`} value={`₹${fmt(yourShare)}`} color="main" />
                {split < 100 && (
                  <UltraResultCard label={`Other Party (${(100 - split).toFixed(0)}%)`} value={`₹${fmt(otherShare)}`} color="amber" />
                )}
                <UltraResultCard label="Net Amount After Commission" value={`₹${fmt(netAmount)}`} color="green" />
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
