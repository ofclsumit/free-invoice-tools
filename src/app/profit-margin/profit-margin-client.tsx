"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  RotateCcw,
  Sliders,
  HelpCircle,
  TrendingUp,
  Share2,
  Percent,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { ProfitMarginDocument } from "@/components/calculator-documents"
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
  UltraToggle,
} from "@/components/ultra/ultra-components"

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function ProfitMarginClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")
  const [mode, setMode] = useState<"cost_selling" | "cost_margin">("cost_selling")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [targetMargin, setTargetMargin] = useState("")
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Scenario & UI States
  const [scenarioBoost, setScenarioBoost] = useState<number>(10) // +10% price boost
  const [showFormulas, setShowFormulas] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const c = parseFloat(cost) || 0

  // Calculation Results
  const { s, profit, margin, markup } = useMemo(() => {
    if (!calculated || c <= 0) {
      return { s: 0, profit: 0, margin: 0, markup: 0 }
    }
    if (mode === "cost_selling") {
      const sellPrice = parseFloat(selling) || 0
      if (sellPrice <= 0) return { s: 0, profit: 0, margin: 0, markup: 0 }
      const prof = sellPrice - c
      const marg = sellPrice > 0 ? (prof / sellPrice) * 100 : 0
      const mark = c > 0 ? (prof / c) * 100 : 0
      return { s: sellPrice, profit: prof, margin: marg, markup: mark }
    } else {
      const targMarg = parseFloat(targetMargin) || 0
      if (targMarg >= 100 || targMarg <= 0) {
        return { s: 0, profit: 0, margin: 0, markup: 0 }
      }
      const sellPrice = c / (1 - targMarg / 100)
      const prof = sellPrice - c
      const mark = c > 0 ? (prof / c) * 100 : 0
      return { s: sellPrice, profit: prof, margin: targMarg, markup: mark }
    }
  }, [calculated, mode, cost, selling, targetMargin, c])

  // Scenario Calculation (+X% Selling Price Boost)
  const scenarioCalc = useMemo(() => {
    if (!calculated || c <= 0 || s <= 0) return null
    const boostedSelling = s * (1 + scenarioBoost / 100)
    const boostedProfit = boostedSelling - c
    const boostedMargin = (boostedProfit / boostedSelling) * 100
    const profitGain = boostedProfit - profit
    return {
      boostedSelling,
      boostedProfit,
      boostedMargin,
      profitGain,
    }
  }, [calculated, c, s, scenarioBoost, profit])

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    const validCost = c > 0
    const validSelling = mode === "cost_selling" ? parseFloat(selling) > 0 : (parseFloat(targetMargin) > 0 && parseFloat(targetMargin) < 100)

    if (validCost && validSelling) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: mode === "cost_selling"
          ? "Please enter a valid cost price and selling price."
          : "Please enter a valid cost price and target margin % (between 0% and 99.9%).",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setCost("")
    setSelling("")
    setTargetMargin("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Profit Margin & Pricing Analysis Report",
    isDiscount: false,
    costPrice: c,
    sellingPrice: s,
    profitOrDiscountAmount: profit,
    percentage: margin,
    markupPercentage: markup,
    companyName: companyName.trim() || "Turnivo Business",
    companyLogo,
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(c > 0 && s > 0)) {
      toast({ title: "Calculate first", description: "Please enter pricing details and calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "profit-margin",
      title: "Profit Margin Report Preview",
      fileName: `profit-margin-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(c > 0 && s > 0)) {
      toast({ title: "Calculate first", description: "Please enter pricing details and calculate before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `profit-margin-${new Date().toISOString().split("T")[0]}.pdf`)
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
          <ProfitMarginDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <div className="flex items-center justify-between mb-4">
            <UltraCardHeader title="Pricing Inputs" />
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
              { value: "cost_selling", label: "Cost & Selling Price" },
              { value: "cost_margin", label: "Cost & Target Margin %" },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as any)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Cost Price (COGS)"
            currencySymbol={currencySymbol}
            value={cost}
            onChange={(e) => {
              setCost(e.target.value)
              setCalculated(false)
            }}
          />

          {mode === "cost_selling" ? (
            <UltraInput
              type="number"
              placeholder="Selling Price"
              currencySymbol={currencySymbol}
              value={selling}
              onChange={(e) => {
                setSelling(e.target.value)
                setCalculated(false)
              }}
            />
          ) : (
            <UltraInput
              type="number"
              placeholder="Target Gross Margin (%)"
              suffix="%"
              value={targetMargin}
              onChange={(e) => {
                setTargetMargin(e.target.value)
                setCalculated(false)
              }}
            />
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
                  <span>Calculate Margin</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Margin & Markup Breakdown" />

          {!calculated || !(c > 0 && s > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your cost and pricing parameters, then click <strong>Calculate Margin</strong>.
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
                  Gross Profit Margin
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  {margin.toFixed(2)}%
                  <span className="text-xs font-normal text-emerald-200 ml-2">
                    ({currencySymbol}{fmt(profit)} net profit per unit)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-100 pt-0.5">
                  For Cost: {currencySymbol}{fmt(c)} → Selling Price: {currencySymbol}{fmt(s)}
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Cost Price" value={`${currencySymbol}${fmt(c)}`} color="blue" />
                <UltraResultCard label="Selling Price" value={`${currencySymbol}${fmt(s)}`} color="main" />
                <UltraResultCard label="Gross Profit ($)" value={`${currencySymbol}${fmt(profit)}`} color="green" />
                <UltraResultCard label="Markup on Cost" value={`${markup.toFixed(2)}%`} color="amber" />
              </UltraResultsGrid>

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Margin vs Markup Difference
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your <strong>Gross Margin is {margin.toFixed(1)}%</strong>, meaning {margin.toFixed(1)} cents of every revenue dollar is profit. Your <strong>Markup is {markup.toFixed(1)}%</strong>, meaning your selling price is {markup.toFixed(1)}% higher than your cost.
                </p>
              </div>

              {/* SCENARIO ANALYSIS (+X% PRICE BOOST) */}
              {scenarioCalc && (
                <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-600" /> Price Adjustment Simulation
                    </span>
                    <div className="flex gap-1">
                      {[5, 10, 15].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setScenarioBoost(pct)}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                            scenarioBoost === pct
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
                    Increasing selling price by <strong>+{scenarioBoost}%</strong> to <strong>{currencySymbol}{fmt(scenarioCalc.boostedSelling)}</strong> increases profit to <strong>{currencySymbol}{fmt(scenarioCalc.boostedProfit)}</strong> (+{currencySymbol}{fmt(scenarioCalc.profitGain)} per unit) and boosts margin to <strong>{scenarioCalc.boostedMargin.toFixed(1)}%</strong>.
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
            Profit Margin &amp; Markup Formulas
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
                  <strong className="text-slate-900 dark:text-white block">Gross Margin % (Revenue Basis):</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    Margin = [(Selling Price - Cost) / Selling Price] × 100
                  </code>
                </div>
                <div className="space-y-1">
                  <strong className="text-slate-900 dark:text-white block">Markup % (Cost Basis):</strong>
                  <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                    Markup = [(Selling Price - Cost) / Cost] × 100
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
