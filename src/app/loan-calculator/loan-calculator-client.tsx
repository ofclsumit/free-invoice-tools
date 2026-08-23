"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { EmiDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraCardHeader,
  UltraResetButton,
  UltraEmptyState,
} from "@/components/ultra/ultra-components"

export function LoanCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(amount) || 0
  const annualRate = parseFloat(rate) || 0
  const months = parseFloat(tenure) || 0
  const monthlyRate = annualRate / 12 / 100

  let emi = 0
  let totalInterest = 0
  let totalCost = 0
  if (calculated && P > 0 && monthlyRate > 0 && months > 0) {
    emi =
      (P * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    totalCost = emi * months
    totalInterest = totalCost - P
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && annualRate > 0 && months > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid loan amount, interest rate, and tenure required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setAmount("")
    setRate("")
    setTenure("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Loan Calculation & Repayment Schedule Report",
    principal: P,
    rate: annualRate,
    tenureYears: months / 12,
    tenureMonths: Math.round(months),
    emi,
    totalInterest,
    totalPayment: totalCost,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(P > 0)) {
      toast({ title: "Calculate first", description: "Please calculate loan EMI before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "loan-calculator",
      title: "Loan Report Preview",
      fileName: `loan-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(P > 0)) {
      toast({ title: "Calculate first", description: "Please calculate loan EMI before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `loan-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Loan Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <EmiDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Calculate Loan EMI" />

          <UltraInput
            type="number"
            placeholder="Loan Amount"
            currencySymbol="₹"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Annual Interest Rate"
            suffix="% p.a."
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Loan Tenure"
            suffix="Months"
            value={tenure}
            onChange={(e) => {
              setTenure(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate EMI
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(P > 0 && annualRate > 0 && months > 0) ? (
            <UltraEmptyState actionText="Calculate EMI" />
          ) : (
            <>
              <UltraResultsGrid>
                <UltraResultCard label="Monthly EMI" value={`₹${fmt(emi)}`} color="main" />
                <UltraResultCard label="Total Interest" value={`₹${fmt(totalInterest)}`} color="amber" />
                <UltraResultCard label="Total Cost" value={`₹${fmt(totalCost)}`} color="purple" />
                <UltraResultCard label="Principal" value={`₹${fmt(P)}`} color="blue" />
                <UltraResultCard
                  label="Interest % of Total"
                  value={`${((totalInterest / totalCost) * 100).toFixed(1)}%`}
                  color="amber"
                />
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
