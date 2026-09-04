"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  Sliders,
  HelpCircle,
  TrendingDown,
  Scale,
  Share2,
  Target,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { BreakEvenDocument } from "@/components/calculator-documents"
import { TurnivoSelect } from "@/components/ui/turnivo-select"
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

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function BreakEvenCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [fixedCost, setFixedCost] = useState("")
  const [variableCost, setVariableCost] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Advanced Target Profit
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [targetProfit, setTargetProfit] = useState("")
  const [scenarioPriceBoost, setScenarioPriceBoost] = useState<number>(5)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const FC = parseFloat(fixedCost) || 0
  const VC = parseFloat(variableCost) || 0
  const SP = parseFloat(sellingPrice) || 0
  const TP = parseFloat(targetProfit) || 0
  const contribution = SP - VC

  // Core Calculations
  const breakEvenUnits = calculated && contribution > 0 ? Math.ceil(FC / contribution) : 0
  const breakEvenRevenue = breakEvenUnits * SP
  const cmRatio = calculated && SP > 0 ? (contribution / SP) * 100 : 0

  // Target Profit Units
  const targetProfitUnits = calculated && contribution > 0 && TP > 0 ? Math.ceil((FC + TP) / contribution) : 0
  const targetProfitRevenue = targetProfitUnits * SP

  // Sensitivity Scenario (What if SP increases by +X%?)
  const scenarioCalc = useMemo(() => {
    if (!calculated || FC <= 0 || SP <= 0 || contribution <= 0) return null
    const newSP = SP * (1 + scenarioPriceBoost / 100)
    const newContrib = newSP - VC
    if (newContrib <= 0) return null
    const newBEUnits = Math.ceil(FC / newContrib)
    const unitsSaved = breakEvenUnits - newBEUnits
    return {
      newSP,
      newBEUnits,
      unitsSaved,
    }
  }, [calculated, FC, VC, SP, contribution, scenarioPriceBoost, breakEvenUnits])

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const fmtUnits = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    }
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  }

  const handleCalculate = () => {
    if (FC > 0 && SP > 0 && contribution > 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: "Please enter Fixed Costs > 0 and a Selling Price greater than Variable Cost per unit.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setFixedCost("")
    setVariableCost("")
    setSellingPrice("")
    setTargetProfit("")
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
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(FC > 0 && contribution > 0)) {
      toast({ title: "Calculate first", description: "Please enter cost parameters and calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
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
      toast({ title: "Calculate first", description: "Please enter cost parameters and calculate before downloading.", variant: "destructive" })
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Hidden print document for instant export */}
      {mounted && calculated && FC > 0 && contribution > 0 && (
        <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm" }} aria-hidden="true">
          <BreakEvenDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-4">
            <UltraCardHeader title="Cost & Pricing Structure" />
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
            placeholder="Total Fixed Costs (Rent, Salaries, Overhead)"
            currencySymbol={currencySymbol}
            value={fixedCost}
            onChange={(e) => {
              setFixedCost(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Variable Cost per Unit (Materials, Labor)"
            currencySymbol={currencySymbol}
            value={variableCost}
            onChange={(e) => {
              setVariableCost(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Selling Price per Unit"
            currencySymbol={currencySymbol}
            value={sellingPrice}
            onChange={(e) => {
              setSellingPrice(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Target Profit Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2 transition-colors cursor-pointer"
            >
              {showAdvanced ? "Hide Target Profit Goal ▲" : "+ Add Target Net Profit Goal ▼"}
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
                    Target Net Profit ({currencySymbol})
                  </label>
                  <UltraInput
                    type="number"
                    placeholder="Desired Net Profit Target"
                    currencySymbol={currencySymbol}
                    value={targetProfit}
                    onChange={(e) => {
                      setTargetProfit(e.target.value)
                      setCalculated(false)
                    }}
                  />
                  <p className="text-[11px] text-slate-500">
                    Calculates the exact unit sales volume needed to achieve this target profit.
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
                  <span>Calculate Break-Even</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Break-Even Analysis" />

          {!calculated || !(FC > 0 && SP > 0 && contribution > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your fixed costs, variable cost, and selling price, then click <strong>Calculate Break-Even</strong>.
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
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-sm space-y-1">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-200 block">
                  Break-Even Sales Volume
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  {fmtUnits(breakEvenUnits)} units
                  <span className="text-xs font-normal text-rose-200 ml-2">
                    ({currencySymbol}{fmt(breakEvenRevenue)} revenue)
                  </span>
                </div>
                <div className="text-[11px] text-rose-100 pt-0.5">
                  Covers {currencySymbol}{fmt(FC)} in fixed overhead at a {currencySymbol}{fmt(contribution)} unit margin
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Contribution Margin" value={`${currencySymbol}${fmt(contribution)}`} color="blue" />
                <UltraResultCard label="Margin Ratio (PV)" value={`${cmRatio.toFixed(1)}%`} color="green" />
                <UltraResultCard label="Variable Cost Ratio" value={`${(100 - cmRatio).toFixed(1)}%`} color="amber" />
                <UltraResultCard label="Break-Even Revenue" value={`${currencySymbol}${fmt(breakEvenRevenue)}`} color="main" />
              </UltraResultsGrid>

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Operational Assessment
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Each unit sold contributes <strong>{currencySymbol}{fmt(contribution)}</strong> towards paying off your fixed costs. Once you sell <strong>{fmtUnits(breakEvenUnits)} units</strong>, every additional unit sold generates pure net profit of {currencySymbol}{fmt(contribution)}.
                </p>
              </div>

              {/* TARGET PROFIT SPOTLIGHT (if active) */}
              {TP > 0 && targetProfitUnits > 0 && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-900/50 rounded-xl text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <Target className="w-4 h-4" /> Goal to Earn {currencySymbol}{fmt(TP)} Net Profit
                  </span>
                  <p>
                    You need to sell <strong>{fmtUnits(targetProfitUnits)} units</strong> generating <strong>{currencySymbol}{fmt(targetProfitRevenue)}</strong> in top-line revenue.
                  </p>
                </div>
              )}

              {/* SENSITIVITY SCENARIO */}
              {scenarioCalc && (
                <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-violet-600" /> Price Sensitivity Simulation
                    </span>
                    <div className="flex gap-1">
                      {[5, 10, 15].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setScenarioPriceBoost(pct)}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                            scenarioPriceBoost === pct
                              ? "bg-violet-600 text-white"
                              : "bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    A <strong>+{scenarioPriceBoost}% price increase</strong> reduces your break-even hurdle by <strong>{fmtUnits(scenarioCalc.unitsSaved)} units</strong> (down to {fmtUnits(scenarioCalc.newBEUnits)} units).
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

      {/* FORMULAS & HOW IT WORKS */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full p-4 bg-slate-50 dark:bg-black/20 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-violet-500" />
            Break-Even &amp; CVP Formulas
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
                  <strong className="text-slate-900 dark:text-white block">Break-Even Units:</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    Units = Fixed Costs / (Price - Variable Cost)
                  </code>
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 dark:text-white block">Contribution Margin Ratio:</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    CM Ratio = [(Price - Variable Cost) / Price] × 100
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
