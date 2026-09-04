"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
  Share2,
  Sliders,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { InterestDocument } from "@/components/calculator-documents"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
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

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

const COMPOUND_FREQUENCIES = [
  { value: 1, label: "Yearly" },
  { value: 2, label: "Half-Yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 365, label: "Daily" },
]

export function InterestCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")
  const [mode, setMode] = useState<"compound" | "simple">("compound")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState(12)
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Schedules & Modals
  const [showSchedule, setShowSchedule] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const t = parseFloat(time) || 0

  // Calculations
  const { maturity, interest, simpleInterestEquivalent, compoundAdvantage } = useMemo(() => {
    if (!calculated || P <= 0 || r <= 0 || t <= 0) {
      return { maturity: 0, interest: 0, simpleInterestEquivalent: 0, compoundAdvantage: 0 }
    }

    const simpleInt = (P * r * t) / 100

    if (mode === "simple") {
      return {
        maturity: P + simpleInt,
        interest: simpleInt,
        simpleInterestEquivalent: simpleInt,
        compoundAdvantage: 0,
      }
    } else {
      const compMaturity = P * Math.pow(1 + r / 100 / frequency, frequency * t)
      const compInterest = compMaturity - P
      return {
        maturity: compMaturity,
        interest: compInterest,
        simpleInterestEquivalent: simpleInt,
        compoundAdvantage: Math.max(0, compInterest - simpleInt),
      }
    }
  }, [calculated, P, r, t, mode, frequency])

  // Year-by-Year Growth Schedule
  const growthSchedule = useMemo(() => {
    if (!calculated || P <= 0 || r <= 0 || t <= 0) return []

    const schedule = []
    const totalYears = Math.ceil(t)

    for (let yr = 1; yr <= totalYears; yr++) {
      const yrTime = Math.min(yr, t)
      let yrMaturity = 0
      let yrInterest = 0

      if (mode === "simple") {
        yrInterest = (P * r * yrTime) / 100
        yrMaturity = P + yrInterest
      } else {
        yrMaturity = P * Math.pow(1 + r / 100 / frequency, frequency * yrTime)
        yrInterest = yrMaturity - P
      }

      schedule.push({
        year: yr,
        principal: P,
        accruedInterest: yrInterest,
        totalBalance: yrMaturity,
      })
    }

    return schedule
  }, [calculated, P, r, t, mode, frequency])

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    if (P > 0 && r > 0 && t > 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: "Please enter a valid deposit amount, interest rate, and duration.",
        variant: "destructive",
      })
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
      ? "Annually"
      : frequency === 2
      ? "Semi-Annually"
      : frequency === 4
      ? "Quarterly"
      : frequency === 365
      ? "Daily"
      : "Monthly"

  const getDocData = () => ({
    title: `${mode === "compound" ? "Compound" : "Simple"} Interest Growth Report`,
    type: mode,
    principal: P,
    rate: r,
    timeYears: t,
    frequency: freqLabel,
    totalInterest: interest,
    totalAmount: maturity,
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Please enter investment details and calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "interest-calculator",
      title: "Interest Growth Report Preview",
      fileName: `interest-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Please enter investment details and calculate before downloading.", variant: "destructive" })
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Hidden print document for instant export */}
      {mounted && (
        <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm" }} aria-hidden="true">
          <InterestDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-4">
            <UltraCardHeader title="Investment Inputs" />
            <div className="w-28">
              <TurnivoSelect
                value={currency}
                onChange={(v) => {
                  setCurrency(v as any)
                  setCalculated(false)
                }}
                options={[
                  { value: "INR", label: "INR (₹)" },
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "GBP", label: "GBP (£)" },
                ]}
                size="sm"
              />
            </div>
          </div>

          {/* Mode Toggle */}
          <UltraToggle
            options={[
              { value: "compound", label: "Compound Interest" },
              { value: "simple", label: "Simple Interest" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as any)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Initial Principal Deposit"
            currencySymbol={currencySymbol}
            value={principal}
            onChange={(e) => {
              setPrincipal(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Annual Interest Rate (%)"
            suffix="%"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Investment Duration (in Years)"
            suffix="Years"
            value={time}
            onChange={(e) => {
              setTime(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Compounding Frequency Picker (Compound Mode Only) */}
          {mode === "compound" && (
            <div className="space-y-1.5 mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Compounding Frequency
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {COMPOUND_FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      setFrequency(f.value)
                      setCalculated(false)
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      frequency === f.value
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 mt-4">
            <button
              id="calc-btn"
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="flex-[2] py-3 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCalculating ? (
                <>
                  <CircleLoader />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Growth</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Maturity & Returns Summary" />

          {!calculated || !(P > 0 && r > 0 && t > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your principal amount, rate, and duration, then click <strong>Calculate Growth</strong>.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* PRIMARY RESULT SPOTLIGHT */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm space-y-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                  Total Maturity Value
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  {currencySymbol}{fmt(maturity)}
                  <span className="text-xs font-normal text-emerald-200 ml-2">
                    (+{currencySymbol}{fmt(interest)} earned)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 pt-0.5">
                  Deposit: {currencySymbol}{fmt(P)} at {r}% for {t} years ({mode === "compound" ? `${freqLabel} compounding` : "Simple Interest"})
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Initial Deposit" value={`${currencySymbol}${fmt(P)}`} color="blue" />
                <UltraResultCard label="Interest Earned" value={`${currencySymbol}${fmt(interest)}`} color="green" />
                <UltraResultCard label="Total ROI" value={`${((interest / P) * 100).toFixed(1)}%`} color="amber" />
                <UltraResultCard label="Annualized APY" value={`${((Math.pow(1 + r / 100 / frequency, frequency) - 1) * 100).toFixed(2)}%`} color="main" />
              </UltraResultsGrid>

              <UltraProgressBar
                label="Principal vs Interest Ratio"
                percent={maturity > 0 ? (P / maturity) * 100 : 0}
              />

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Growth Interpretation
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Over {t} years, your money multiplies by <strong>{(maturity / P).toFixed(2)}x</strong>, yielding <strong>{currencySymbol}{fmt(interest)}</strong> in interest returns.
                  {mode === "compound" && compoundAdvantage > 0 && (
                    <span> Compounding gave you an extra <strong>{currencySymbol}{fmt(compoundAdvantage)}</strong> compared to simple linear interest.</span>
                  )}
                </p>
              </div>

              {/* PDF EXPORT BUTTONS */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePreviewPDF}
                  disabled={isPreviewing}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors disabled:opacity-50"
                >
                  {isPreviewing ? <CircleLoader /> : <Eye className="w-4 h-4" />} Preview PDF
                </button>

                <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating}>
                  {isGenerating ? <CircleLoader /> : <Download className="w-4 h-4" />} Download PDF
                </UltraPrimaryButton>
              </div>
            </motion.div>
          )}
        </UltraCard>
      </UltraGrid>

      {/* YEAR-BY-YEAR GROWTH SCHEDULE */}
      {calculated && growthSchedule.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                Annual Investment Growth Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Track compounding balance growth and cumulative interest earned year over year.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0 cursor-pointer"
            >
              {showSchedule ? "Hide Schedule ▲" : "View Full Schedule ▼"}
            </button>
          </div>

          <AnimatePresence>
            {showSchedule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-x-auto pt-2"
              >
                <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                  <thead className="bg-slate-100 dark:bg-black/40 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5">Principal Deposit</th>
                      <th className="p-2.5">Cumulative Interest</th>
                      <th className="p-2.5 text-right font-bold">End-of-Year Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                    {growthSchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-2.5 font-bold font-sans">Year {row.year}</td>
                        <td className="p-2.5">{currencySymbol}{fmt(row.principal)}</td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400">+{currencySymbol}{fmt(row.accruedInterest)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">{currencySymbol}{fmt(row.totalBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FORMULAS & HOW IT WORKS */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 bg-slate-50 dark:bg-black/20 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-violet-500" />
            Interest Calculation Formulas
          </span>
          <span className="text-violet-600 dark:text-violet-400">{showFormulas ? "Hide ▲" : "Inspect ▼"}</span>
        </button>

        <AnimatePresence>
          {showFormulas && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <strong className="text-slate-900 dark:text-white block">Compound Interest:</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    A = P × [1 + (r / n)]^(n × t)
                  </code>
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 dark:text-white block">Simple Interest:</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    I = (P × r × t) / 100
                  </code>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
