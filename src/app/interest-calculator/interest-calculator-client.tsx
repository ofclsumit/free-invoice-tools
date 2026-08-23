"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { InterestDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraSectionLabel,
  UltraEmptyState,
  UltraToggle,
  UltraInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraResetButton,
  UltraProgressBar,
} from "@/components/ultra/ultra-components"

const COMPOUND_FREQUENCIES = [
  { value: 1, label: "Yearly" },
  { value: 2, label: "Half-Yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
]

export function InterestCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<"simple" | "compound">("simple")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState(12)
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const t = parseFloat(time) || 0

  let maturity = 0
  let interest = 0
  if (calculated && P > 0 && r > 0 && t > 0) {
    if (mode === "simple") {
      interest = (P * r * t) / 100
      maturity = P + interest
    } else {
      maturity = P * Math.pow(1 + r / 100 / frequency, frequency * t)
      interest = maturity - P
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && r > 0 && t > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid principal, rate, and time duration required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setPrincipal("")
    setRate("")
    setTime("")
    setCalculated(false)
  }

  const freqLabel =
    frequency === 1
      ? "Annually (Yearly)"
      : frequency === 2
      ? "Semi-Annually (Half-Yearly)"
      : frequency === 4
      ? "Quarterly"
      : "Monthly"

  const getDocData = () => ({
    title: `${mode === "compound" ? "Compound" : "Simple"} Interest Accrual & Growth Report`,
    type: mode,
    principal: P,
    rate: r,
    timeYears: t,
    frequency: freqLabel,
    totalInterest: interest,
    totalAmount: maturity,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(P > 0 && r > 0 && t > 0)) {
      toast({ title: "Calculate first", description: "Please calculate interest before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "interest-calculator",
      title: "Interest Report Preview",
      fileName: `interest-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(P > 0 && r > 0 && t > 0)) {
      toast({ title: "Calculate first", description: "Please calculate interest before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `interest-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const iPct = calculated && maturity > 0 ? (interest / maturity) * 100 : 0

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Interest Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <InterestDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Calculate Interest" />

          <UltraToggle
            options={[
              { value: "simple", label: "Simple Interest" },
              { value: "compound", label: "Compound Interest" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as "simple" | "compound")
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Principal Deposit Amount"
            currencySymbol="₹"
            value={principal}
            onChange={(e) => {
              setPrincipal(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Annual Interest Rate"
            suffix="%"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Time Duration (Years)"
            value={time}
            onChange={(e) => {
              setTime(e.target.value)
              setCalculated(false)
            }}
          />

          {mode === "compound" && (
            <div>
              <UltraSectionLabel>Compounding Frequency</UltraSectionLabel>
              <UltraToggle
                options={COMPOUND_FREQUENCIES}
                value={frequency}
                onChange={(f) => {
                  setFrequency(f as number)
                  setCalculated(false)
                }}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Interest
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(P > 0 && r > 0 && t > 0) ? (
            <UltraEmptyState actionText="Calculate Interest" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                {mode === "simple" ? "Simple Interest" : "Compound Interest"}
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Principal Amount" value={`₹${fmt(P)}`} color="blue" />
                <UltraResultCard label="Rate & Duration" value={`${rate}% × ${t} ${t === 1 ? "Year" : "Years"}`} color="blue" />
                <UltraResultCard label="Interest Earned" value={`₹${fmt(interest)}`} color="green" />
                <UltraResultCard label="Maturity Value" value={`₹${fmt(maturity)}`} color="main" />
              </UltraResultsGrid>

              <UltraProgressBar label="Interest vs Principal Share" percent={iPct} />

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
