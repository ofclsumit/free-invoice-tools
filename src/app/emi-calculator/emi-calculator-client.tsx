"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  RotateCcw,
  Sliders,
  Calendar,
  Layers,
  HelpCircle,
  TrendingDown,
  Check,
  Share2,
  Copy,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { EmiDocument } from "@/components/calculator-documents"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
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

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-current shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function EmiCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale Settings
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake data)
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years")
  
  // State management: Initial -> Calculating -> Calculated
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Advanced / Scenario Options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const P = parseFloat(amount) || 0
  const rateNum = parseFloat(rate) || 0
  const r = rateNum / 12 / 100
  const n = tenureUnit === "years" ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0
  const extraPmt = parseFloat(extraMonthlyPayment) || 0

  // Primary Standard Calculation
  const standardCalc = useMemo(() => {
    if (!calculated || P <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0, interestRatio: 0 }
    }
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P
    const interestRatio = P > 0 ? (totalInterest / P) : 0
    return { emi, totalInterest, totalPayment, interestRatio }
  }, [calculated, P, r, n])

  // Prepayment / Scenario Analysis
  const scenarioCalc = useMemo(() => {
    if (!calculated || P <= 0 || r <= 0 || n <= 0) {
      return { newMonths: n, interestSaved: 0, monthsSaved: 0, newTotalInterest: 0 }
    }
    if (extraPmt <= 0) {
      return { newMonths: n, interestSaved: 0, monthsSaved: 0, newTotalInterest: standardCalc.totalInterest }
    }

    const targetMonthly = standardCalc.emi + extraPmt
    let balance = P
    let totalInt = 0
    let months = 0

    while (balance > 0.01 && months < 600) {
      const monthInterest = balance * r
      totalInt += monthInterest
      const principalPaid = Math.min(balance, targetMonthly - monthInterest)
      balance -= principalPaid
      months++
    }

    const monthsSaved = Math.max(0, n - months)
    const interestSaved = Math.max(0, standardCalc.totalInterest - totalInt)

    return {
      newMonths: months,
      interestSaved,
      monthsSaved,
      newTotalInterest: totalInt,
    }
  }, [calculated, P, r, n, extraPmt, standardCalc])

  // Yearly Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    if (!calculated || P <= 0 || r <= 0 || n <= 0) return []

    const schedule = []
    let balance = P
    const emi = standardCalc.emi
    const totalYears = Math.ceil(n / 12)

    for (let yr = 1; yr <= totalYears; yr++) {
      let yrPrincipal = 0
      let yrInterest = 0
      const startBalance = balance

      const monthsInThisYear = Math.min(12, n - (yr - 1) * 12)

      for (let m = 0; m < monthsInThisYear; m++) {
        if (balance <= 0.01) break
        const intPmt = balance * r
        const prinPmt = Math.min(balance, emi - intPmt)
        yrInterest += intPmt
        yrPrincipal += prinPmt
        balance -= prinPmt
      }

      schedule.push({
        year: yr,
        startBalance,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        endBalance: Math.max(0, balance),
      })

      if (balance <= 0.01) break
    }

    return schedule
  }, [calculated, P, r, n, standardCalc.emi])

  const fmt = (num: number) => {
    if (currency === "INR") {
      return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    if (P > 0 && rateNum > 0 && n > 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: "Please enter a valid loan amount, interest rate, and tenure.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setAmount("")
    setRate("")
    setTenure("")
    setExtraMonthlyPayment("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Loan EMI & Repayment Schedule Report",
    principal: P,
    rate: rateNum,
    tenureYears: tenureUnit === "years" ? parseFloat(tenure) || 0 : (parseFloat(tenure) || 0) / 12,
    tenureMonths: Math.round(n),
    emi: standardCalc.emi,
    totalInterest: standardCalc.totalInterest,
    totalPayment: standardCalc.totalPayment,
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Please enter details and click Calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "emi-calculator",
      title: "EMI Calculation Report Preview",
      fileName: `emi-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Please enter details and click Calculate before downloading.", variant: "destructive" })
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

  const handleCopyShareLink = () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Calculate an EMI before generating a share link.", variant: "destructive" })
      return
    }
    const url = `${window.location.origin}/emi-calculator?amount=${amount}&rate=${rate}&tenure=${tenure}&unit=${tenureUnit}&currency=${currency}`
    navigator.clipboard.writeText(url)
    toast({ title: "Link Copied!", description: "Shareable calculation link copied to clipboard." })
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
          <EmiDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-4">
            <UltraCardHeader title="Loan Parameters" />
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

          {/* Main Inputs */}
          <UltraInput
            type="number"
            placeholder="Loan Amount"
            currencySymbol={currencySymbol}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Annual Interest Rate (% p.a.)"
            suffix="%"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraToggle
            options={[
              { value: "years", label: "Tenure (Years)" },
              { value: "months", label: "Tenure (Months)" },
            ]}
            value={tenureUnit}
            onChange={(v) => {
              setTenureUnit(v as "months" | "years")
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder={tenureUnit === "years" ? "Loan Tenure (Years)" : "Loan Tenure (Months)"}
            value={tenure}
            onChange={(e) => {
              setTenure(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Collapsible Advanced Options */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2 transition-colors"
            >
              {showAdvanced ? "Hide Prepayment Options ▲" : "+ Prepayment & Scenario Options ▼"}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mb-4"
                >
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Extra Monthly Prepayment ({currencySymbol})
                  </label>
                  <UltraInput
                    type="number"
                    placeholder="Extra Payment per Month"
                    currencySymbol={currencySymbol}
                    value={extraMonthlyPayment}
                    onChange={(e) => {
                      setExtraMonthlyPayment(e.target.value)
                      setCalculated(false)
                    }}
                  />
                  <p className="text-[11px] text-slate-500">
                    Simulate paying an extra amount each month to accelerate debt payoff.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                  <span>Calculate EMI</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-2">
            <UltraCardHeader title="Repayment Summary" />
            {calculated && (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Share calculation"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            )}
          </div>

          {!calculated || !(P > 0 && r > 0 && n > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your loan amount, interest rate, and tenure, then click <strong>Calculate EMI</strong>.
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
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm space-y-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-violet-200 block">
                  Monthly Loan EMI
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                  {currencySymbol}{fmt(standardCalc.emi)}
                  <span className="text-xs font-normal text-violet-200 ml-1">/ month</span>
                </div>
                <div className="text-[11px] text-violet-100 pt-0.5">
                  For a {currencySymbol}{fmt(P)} loan at {rateNum}% over {tenureUnit === "years" ? `${tenure} years` : `${tenure} months`} ({Math.round(n)} installments)
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Principal Borrowed" value={`${currencySymbol}${fmt(P)}`} color="blue" />
                <UltraResultCard label="Total Interest Paid" value={`${currencySymbol}${fmt(standardCalc.totalInterest)}`} color="amber" />
                <UltraResultCard label="Total Repayment Amount" value={`${currencySymbol}${fmt(standardCalc.totalPayment)}`} color="green" />
                <UltraResultCard label="Interest-to-Loan Ratio" value={`${(standardCalc.interestRatio * 100).toFixed(1)}%`} color="main" />
              </UltraResultsGrid>

              <UltraProgressBar
                label="Principal vs Interest Breakdown"
                percent={standardCalc.totalPayment > 0 ? (P / standardCalc.totalPayment) * 100 : 0}
              />

              {/* "WHAT THIS MEANS" EXPLANATION */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> What This Means
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Over the complete tenure of {Math.round(n)} months, you will repay a total of <strong>{currencySymbol}{fmt(standardCalc.totalPayment)}</strong>. For every {currencySymbol}1.00 borrowed, you will pay approximately <strong>{currencySymbol}{standardCalc.interestRatio.toFixed(2)}</strong> in interest charges.
                </p>
              </div>

              {/* PREPAYMENT SAVINGS SPOTLIGHT (if active) */}
              {extraPmt > 0 && scenarioCalc.interestSaved > 0 && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/50 rounded-xl text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <TrendingDown className="w-4 h-4" /> Prepayment Impact
                  </span>
                  <p>
                    Paying an extra <strong>{currencySymbol}{fmt(extraPmt)}/mo</strong> saves <strong>{currencySymbol}{fmt(scenarioCalc.interestSaved)}</strong> in interest and closes your loan <strong>{scenarioCalc.monthsSaved} months earlier</strong>!
                  </p>
                </div>
              )}

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

      {/* YEARLY AMORTIZATION SCHEDULE */}
      {calculated && amortizationSchedule.length > 0 && (
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
                Yearly Amortization Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Track annual principal reduction, interest paid, and remaining loan balance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0"
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
                      <th className="p-2.5">Opening Balance</th>
                      <th className="p-2.5">Principal Paid</th>
                      <th className="p-2.5">Interest Paid</th>
                      <th className="p-2.5 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                    {amortizationSchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-2.5 font-bold font-sans">Year {row.year}</td>
                        <td className="p-2.5">{currencySymbol}{fmt(row.startBalance)}</td>
                        <td className="p-2.5 text-emerald-600 dark:text-emerald-400">+{currencySymbol}{fmt(row.principalPaid)}</td>
                        <td className="p-2.5 text-amber-600 dark:text-amber-400">{currencySymbol}{fmt(row.interestPaid)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">{currencySymbol}{fmt(row.endBalance)}</td>
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
            How the EMI Calculation Works &amp; Formulas
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
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Standard Reducing Balance EMI Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
                </code>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                <li><strong>P</strong> = Principal Loan Amount</li>
                <li><strong>r</strong> = Monthly Interest Rate (Annual Rate / 12 / 100)</li>
                <li><strong>n</strong> = Loan Tenure in Total Months</li>
              </ul>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]">
                <strong>Assumptions:</strong> Calculations use monthly reducing balance compounding with fixed monthly installments. Taxes, processing fees, and insurance charges are excluded unless added.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
