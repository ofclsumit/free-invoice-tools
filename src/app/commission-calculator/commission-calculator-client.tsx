"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  Sliders,
  HelpCircle,
  TrendingUp,
  Share2,
  HandCoins,
  DollarSign,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { CommissionDocument } from "@/components/calculator-documents"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
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

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function CommissionCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [saleAmount, setSaleAmount] = useState("")
  const [commissionRate, setCommissionRate] = useState("")
  const [splitRatio, setSplitRatio] = useState("100")
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Advanced Base Salary / Bonus
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [baseSalary, setBaseSalary] = useState("")
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const sale = parseFloat(saleAmount) || 0
  const rate = parseFloat(commissionRate) || 0
  const split = Math.min(Math.max(parseFloat(splitRatio) || 100, 0), 100)
  const base = parseFloat(baseSalary) || 0

  // Calculations
  const grossCommission = (sale * rate) / 100
  const yourCommission = (grossCommission * split) / 100
  const partnerShare = grossCommission - yourCommission
  const totalPayout = yourCommission + base
  const effectiveEarningsRate = sale > 0 ? (totalPayout / sale) * 100 : 0

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    if (sale > 0 && rate > 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: "Please enter a valid sales volume and commission percentage %.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setSaleAmount("")
    setCommissionRate("")
    setSplitRatio("100")
    setBaseSalary("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Sales Commission & Incentive Payout Statement",
    totalSales: sale,
    commissionRate: rate,
    commissionEarned: yourCommission,
    totalPayout,
    currencySymbol,
    tiers: [
      {
        tier: "Base Sales Commission",
        salesRange: `Gross Volume ${currencySymbol}${fmt(sale)}`,
        rate,
        amount: grossCommission,
      },
      ...(base > 0
        ? [
            {
              tier: "Base Retainer / Fixed Salary",
              salesRange: "Fixed Monthly Retainer",
              rate: 0,
              amount: base,
            },
          ]
        : []),
      ...(split < 100
        ? [
            {
              tier: "Allocated Share",
              salesRange: `${split}% allocation`,
              rate,
              amount: yourCommission,
            },
          ]
        : []),
    ],
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(sale > 0 && rate > 0)) {
      toast({ title: "Calculate first", description: "Please enter sales details and calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
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
      toast({ title: "Calculate first", description: "Please enter sales details and calculate before downloading.", variant: "destructive" })
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Hidden print document for instant export */}
      {mounted && (
        <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm" }} aria-hidden="true">
          <CommissionDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-4">
            <UltraCardHeader title="Sales & Commission Details" />
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

          <UltraInput
            type="number"
            placeholder="Total Gross Sales Volume"
            currencySymbol={currencySymbol}
            value={saleAmount}
            onChange={(e) => {
              setSaleAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Commission Percentage (%)"
            suffix="%"
            value={commissionRate}
            onChange={(e) => {
              setCommissionRate(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Your Allocation Share (%)"
            suffix="%"
            value={splitRatio}
            onChange={(e) => {
              setSplitRatio(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Advanced Base Retainer Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2 transition-colors cursor-pointer"
            >
              {showAdvanced ? "Hide Base Salary Option ▲" : "+ Add Fixed Base Salary / Retainer ▼"}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mb-4"
                >
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fixed Base Retainer ({currencySymbol})
                  </label>
                  <UltraInput
                    type="number"
                    placeholder="Base Salary / Retainer"
                    currencySymbol={currencySymbol}
                    value={baseSalary}
                    onChange={(e) => {
                      setBaseSalary(e.target.value)
                      setCalculated(false)
                    }}
                  />
                  <p className="text-[11px] text-slate-500">
                    Adds a fixed monthly base pay to your variable sales commission.
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
                  <span>Calculate Commission</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Payout Breakdown" />

          {!calculated || !(sale > 0 && rate > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your gross sales and commission percentage, then click <strong>Calculate Commission</strong>.
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
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-sm space-y-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-violet-200 block">
                  Total Take-Home Payout
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  {currencySymbol}{fmt(totalPayout)}
                </div>
                <div className="text-[11px] text-violet-100 pt-0.5">
                  Includes {currencySymbol}{fmt(yourCommission)} commission ({rate}% rate) {base > 0 && `+ ${currencySymbol}${fmt(base)} base retainer`}
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Gross Sales Volume" value={`${currencySymbol}${fmt(sale)}`} color="blue" />
                <UltraResultCard label="Commission Amount" value={`${currencySymbol}${fmt(yourCommission)}`} color="green" />
                <UltraResultCard label="Effective Rate" value={`${effectiveEarningsRate.toFixed(1)}%`} color="amber" />
                <UltraResultCard label="Company Retains" value={`${currencySymbol}${fmt(sale - grossCommission)}`} color="main" />
              </UltraResultsGrid>

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Incentive Assessment
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  On a gross deal size of <strong>{currencySymbol}{fmt(sale)}</strong>, the total commission pool is <strong>{currencySymbol}{fmt(grossCommission)}</strong>. Your {split}% allocation yields <strong>{currencySymbol}{fmt(yourCommission)}</strong>.
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

      {/* FORMULAS & HOW IT WORKS */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 bg-slate-50 dark:bg-black/20 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-violet-500" />
            Commission Payout Formulas
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
                <strong className="text-slate-900 dark:text-white block mb-1">Commission Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Commission = Sales Volume × (Commission Rate / 100) × (Split % / 100)
                </code>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Total Payout:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Total Payout = Base Retainer + Commission
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
