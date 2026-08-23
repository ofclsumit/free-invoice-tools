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
  UltraCardHeader,
  UltraResetButton,
  UltraEmptyState,
  UltraToggle,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraProgressBar,
} from "@/components/ultra/ultra-components"

export function EmiCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(amount) || 0
  const rateNum = parseFloat(rate) || 0
  const r = rateNum / 12 / 100
  const n = tenureUnit === "years" ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0

  let emi = 0
  let totalInterest = 0
  let totalPayment = 0
  if (P > 0 && r > 0 && n > 0) {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    totalPayment = emi * n
    totalInterest = totalPayment - P
  }

  const fmt = (num: number) =>
    num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && r > 0 && n > 0) {
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
    title: "Loan EMI & Repayment Schedule Report",
    principal: P,
    rate: rateNum,
    tenureYears: tenureUnit === "years" ? parseFloat(tenure) || 0 : (parseFloat(tenure) || 0) / 12,
    tenureMonths: Math.round(n),
    emi,
    totalInterest,
    totalPayment,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(P > 0)) {
      toast({ title: "Calculate first", description: "Please calculate EMI before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "emi-calculator",
      title: "EMI Calculation Report Preview",
      fileName: `emi-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(P > 0)) {
      toast({ title: "Calculate first", description: "Please calculate EMI before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `emi-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating EMI Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <EmiDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Input Details" />

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
            placeholder="Interest Rate (p.a.)"
            currencySymbol="%"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraToggle
            options={[
              { value: "years", label: "Years" },
              { value: "months", label: "Months" },
            ]}
            value={tenureUnit}
            onChange={(v) => {
              setTenureUnit(v as "months" | "years")
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder={tenureUnit === "years" ? "Tenure (in Years)" : "Tenure (in Months)"}
            currencySymbol=""
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

          {!calculated || !(P > 0 && r > 0 && n > 0) ? (
            <UltraEmptyState actionText="Calculate EMI" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                EMI Breakdown
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Monthly EMI" value={`₹${fmt(emi)}`} color="main" />
                <UltraResultCard label="Principal Amount" value={`₹${fmt(P)}`} color="blue" />
                <UltraResultCard label="Total Interest" value={`₹${fmt(totalInterest)}`} color="amber" />
                <UltraResultCard label="Total Payment" value={`₹${fmt(totalPayment)}`} color="green" />
              </UltraResultsGrid>

              <UltraProgressBar
                label="Principal vs Interest"
                percent={totalPayment > 0 ? (P / totalPayment) * 100 : 0}
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
