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
  TrendingDown,
  Share2,
  Sliders,
  Scale,
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
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function LoanCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")

  // Loan A Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years")
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Advanced & Comparison Mode
  const [showComparison, setShowComparison] = useState(false)
  const [compRate, setCompRate] = useState("")
  const [compTenure, setCompTenure] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const P = parseFloat(amount) || 0
  const annualRate = parseFloat(rate) || 0
  const monthlyRate = annualRate / 12 / 100
  const months = tenureUnit === "years" ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0

  // Base Loan Calculation
  const baseCalc = useMemo(() => {
    if (!calculated || P <= 0 || monthlyRate <= 0 || months <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0, interestRatio: 0 }
    }
    const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    const totalPayment = emi * months
    const totalInterest = totalPayment - P
    const interestRatio = P > 0 ? totalInterest / P : 0
    return { emi, totalInterest, totalPayment, interestRatio }
  }, [calculated, P, monthlyRate, months])

  // Comparison Loan Offer B Calculation
  const compCalc = useMemo(() => {
    if (!calculated || !showComparison || P <= 0) return null
    const cRate = parseFloat(compRate) || 0
    const cMonthlyRate = cRate / 12 / 100
    const cMonths = tenureUnit === "years" ? (parseFloat(compTenure) || 0) * 12 : parseFloat(compTenure) || 0

    if (cRate <= 0 || cMonths <= 0) return null

    const emi = (P * cMonthlyRate * Math.pow(1 + cMonthlyRate, cMonths)) / (Math.pow(1 + cMonthlyRate, cMonths) - 1)
    const totalPayment = emi * cMonths
    const totalInterest = totalPayment - P

    return {
      emi,
      totalInterest,
      totalPayment,
      emiDiff: emi - baseCalc.emi,
      interestDiff: baseCalc.totalInterest - totalInterest,
    }
  }, [calculated, showComparison, P, compRate, compTenure, tenureUnit, baseCalc])

  // Yearly Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    if (!calculated || P <= 0 || monthlyRate <= 0 || months <= 0) return []

    const schedule = []
    let balance = P
    const emi = baseCalc.emi
    const totalYears = Math.ceil(months / 12)

    for (let yr = 1; yr <= totalYears; yr++) {
      let yrPrincipal = 0
      let yrInterest = 0
      const startBalance = balance
      const monthsInThisYear = Math.min(12, months - (yr - 1) * 12)

      for (let m = 0; m < monthsInThisYear; m++) {
        if (balance <= 0.01) break
        const intPmt = balance * monthlyRate
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
  }, [calculated, P, monthlyRate, months, baseCalc.emi])

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    if (P > 0 && annualRate > 0 && months > 0) {
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
    setCompRate("")
    setCompTenure("")
    setShowComparison(false)
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Loan Calculation & Repayment Schedule Report",
    principal: P,
    rate: annualRate,
    tenureYears: tenureUnit === "years" ? parseFloat(tenure) || 0 : (parseFloat(tenure) || 0) / 12,
    tenureMonths: Math.round(months),
    emi: baseCalc.emi,
    totalInterest: baseCalc.totalInterest,
    totalPayment: baseCalc.totalPayment,
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Please enter details and click Calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "loan-calculator",
      title: "Loan Calculation Report Preview",
      fileName: `loan-report-${new Date().toISOString().split("T")[0]}.pdf`,
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
        await exportNodeToPdf(node, `loan-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyShareLink = () => {
    if (!calculated || P <= 0) {
      toast({ title: "Calculate first", description: "Calculate loan details before generating a share link.", variant: "destructive" })
      return
    }
    const url = `${window.location.origin}/loan-calculator?amount=${amount}&rate=${rate}&tenure=${tenure}&unit=${tenureUnit}&currency=${currency}`
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
            <UltraCardHeader title="Loan Inputs" />
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
            placeholder="Loan Principal Amount"
            currencySymbol={currencySymbol}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
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
            placeholder={tenureUnit === "years" ? "Loan Tenure (in Years)" : "Loan Tenure (in Months)"}
            value={tenure}
            onChange={(e) => {
              setTenure(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Loan Offer B Comparison Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2 transition-colors cursor-pointer"
            >
              {showComparison ? "Hide Loan Comparison Mode ▲" : "+ Compare with Alternative Loan Offer B ▼"}
            </button>

            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mb-4"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Alternative Loan Offer B
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <UltraInput
                      type="number"
                      placeholder="Offer B Rate (%)"
                      suffix="%"
                      value={compRate}
                      onChange={(e) => {
                        setCompRate(e.target.value)
                        setCalculated(false)
                      }}
                    />
                    <UltraInput
                      type="number"
                      placeholder={`Offer B Tenure (${tenureUnit})`}
                      value={compTenure}
                      onChange={(e) => {
                        setCompTenure(e.target.value)
                        setCalculated(false)
                      }}
                    />
                  </div>
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
                  <span>Calculate Loan</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-2">
            <UltraCardHeader title="Loan Analysis" />
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

          {!calculated || !(P > 0 && annualRate > 0 && months > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your loan amount, interest rate, and tenure, then click <strong>Calculate Loan</strong>.
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
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-sm space-y-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-indigo-200 block">
                  Monthly Loan Installment
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                  {currencySymbol}{fmt(baseCalc.emi)}
                  <span className="text-xs font-normal text-indigo-200 ml-1">/ month</span>
                </div>
                <div className="text-[11px] text-indigo-100 pt-0.5">
                  {currencySymbol}{fmt(P)} at {annualRate}% p.a. for {tenureUnit === "years" ? `${tenure} years` : `${tenure} months`} ({Math.round(months)} payments)
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Principal Amount" value={`${currencySymbol}${fmt(P)}`} color="blue" />
                <UltraResultCard label="Total Interest Cost" value={`${currencySymbol}${fmt(baseCalc.totalInterest)}`} color="amber" />
                <UltraResultCard label="Total Cost of Loan" value={`${currencySymbol}${fmt(baseCalc.totalPayment)}`} color="green" />
                <UltraResultCard label="Interest Ratio" value={`${(baseCalc.interestRatio * 100).toFixed(1)}%`} color="main" />
              </UltraResultsGrid>

              <UltraProgressBar
                label="Principal vs Interest Ratio"
                percent={baseCalc.totalPayment > 0 ? (P / baseCalc.totalPayment) * 100 : 0}
              />

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> What This Means
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Borrowing <strong>{currencySymbol}{fmt(P)}</strong> will cost <strong>{currencySymbol}{fmt(baseCalc.totalInterest)}</strong> in total financing charges, making the total cash outflow <strong>{currencySymbol}{fmt(baseCalc.totalPayment)}</strong> over {Math.round(months)} months.
                </p>
              </div>

              {/* COMPARISON CALLOUT */}
              {compCalc && (
                <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-violet-600" /> Offer A vs Offer B Comparison
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Offer B Monthly:</span>
                      <strong className="text-slate-900 dark:text-white">{currencySymbol}{fmt(compCalc.emi)}/mo</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Interest Difference:</span>
                      <strong className={compCalc.interestDiff >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {compCalc.interestDiff >= 0 ? `Saves ${currencySymbol}${fmt(compCalc.interestDiff)}` : `Costs +${currencySymbol}${fmt(Math.abs(compCalc.interestDiff))}`}
                      </strong>
                    </div>
                  </div>
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
                Loan Amortization Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Track how each yearly payment splits between interest charges and principal debt payoff.
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
                      <th className="p-2.5">Beginning Balance</th>
                      <th className="p-2.5">Principal Paid</th>
                      <th className="p-2.5">Interest Paid</th>
                      <th className="p-2.5 text-right">Ending Balance</th>
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

      {/* FORMULA & ASSUMPTIONS */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 bg-slate-50 dark:bg-black/20 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-violet-500" />
            Loan Formula &amp; Assumptions
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
                <strong className="text-slate-900 dark:text-white block mb-1">Amortized Loan Monthly Payment Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Payment = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                </code>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• <strong>P</strong> = Total Principal Borrowed</p>
                <p>• <strong>r</strong> = Periodic Interest Rate (Annual Rate / 12)</p>
                <p>• <strong>n</strong> = Total Number of Monthly Payment Periods</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
