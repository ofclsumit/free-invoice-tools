"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  Sliders,
  HelpCircle,
  Tag,
  Share2,
  Layers,
  Sparkles,
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
} from "@/components/ultra/ultra-components"

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function DiscountCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Currency & Locale
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">("INR")

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  // Advanced Stacked Discount & Tax
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [extraDiscountRate, setExtraDiscountRate] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [showMultiQty, setShowMultiQty] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"

  const price = parseFloat(originalPrice) || 0
  const rate1 = parseFloat(discountRate) || 0
  const rate2 = parseFloat(extraDiscountRate) || 0
  const tax = parseFloat(taxRate) || 0

  // Calculations
  const { finalPrice, totalSaved, effectiveDiscountRate, priceAfterDiscounts, taxAmount } = useMemo(() => {
    if (!calculated || price <= 0) return { finalPrice: 0, totalSaved: 0, effectiveDiscountRate: 0, priceAfterDiscounts: 0, taxAmount: 0 }
    
    // First discount
    const disc1 = (price * rate1) / 100
    const after1 = price - disc1

    // Second stacked discount
    const disc2 = (after1 * rate2) / 100
    const after2 = after1 - disc2

    // Tax if applied
    const appliedTax = (after2 * tax) / 100
    const totalPayable = after2 + appliedTax

    const saved = price - after2
    const effectiveRate = price > 0 ? (saved / price) * 100 : 0

    return {
      finalPrice: totalPayable,
      totalSaved: saved,
      effectiveDiscountRate: effectiveRate,
      priceAfterDiscounts: after2,
      taxAmount: appliedTax,
    }
  }, [calculated, price, rate1, rate2, tax])

  const fmt = (n: number) => {
    if (currency === "INR") {
      return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleCalculate = () => {
    if (price > 0 && rate1 >= 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({
        title: "Missing Required Fields",
        description: "Please enter the original price and discount rate %.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setOriginalPrice("")
    setDiscountRate("")
    setExtraDiscountRate("")
    setTaxRate("")
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Discount & Pricing Calculation Report",
    isDiscount: true,
    costPrice: price,
    sellingPrice: finalPrice,
    profitOrDiscountAmount: totalSaved,
    percentage: effectiveDiscountRate,
    currencySymbol,
  })

  const handlePreviewPDF = () => {
    if (!calculated || price <= 0) {
      toast({ title: "Calculate first", description: "Please enter price details and calculate before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "discount-calculator",
      title: "Discount Calculation Preview",
      fileName: `discount-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || price <= 0) {
      toast({ title: "Calculate first", description: "Please enter price details and calculate before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `discount-report-${new Date().toISOString().split("T")[0]}.pdf`)
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
            <UltraCardHeader title="Discount Parameters" />
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
            placeholder="Original Price / MSRP"
            currencySymbol={currencySymbol}
            value={originalPrice}
            onChange={(e) => {
              setOriginalPrice(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Discount Percentage (%)"
            suffix="%"
            value={discountRate}
            onChange={(e) => {
              setDiscountRate(e.target.value)
              setCalculated(false)
            }}
          />

          {/* Quick preset discount pills */}
          <div className="flex gap-1.5 mb-4">
            {[10, 20, 30, 50].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDiscountRate(d.toString())
                  setCalculated(false)
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  discountRate === d.toString()
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                {d}% Off
              </button>
            ))}
          </div>

          {/* Collapsible Stacked Discount & Tax */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mb-2 transition-colors cursor-pointer"
            >
              {showAdvanced ? "Hide Stacked / Tax Options ▲" : "+ Add Stacked Coupon / Tax Rate ▼"}
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
                  <UltraInput
                    type="number"
                    placeholder="Extra Coupon / Bank Discount (%)"
                    suffix="%"
                    value={extraDiscountRate}
                    onChange={(e) => {
                      setExtraDiscountRate(e.target.value)
                      setCalculated(false)
                    }}
                  />
                  <UltraInput
                    type="number"
                    placeholder="Sales Tax / GST Rate (%)"
                    suffix="%"
                    value={taxRate}
                    onChange={(e) => {
                      setTaxRate(e.target.value)
                      setCalculated(false)
                    }}
                  />
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
                  <span>Calculate Price</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Price & Savings Summary" />

          {!calculated || price <= 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your original price and discount percentage, then click <strong>Calculate Price</strong>.
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
                  Final Payable Price
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  {currencySymbol}{fmt(finalPrice)}
                  <span className="text-xs font-normal text-violet-200 ml-2">
                    (Saved {currencySymbol}{fmt(totalSaved)})
                  </span>
                </div>
                <div className="text-[11px] text-violet-100 pt-0.5">
                  Original Price: {currencySymbol}{fmt(price)} • Effective Discount: {effectiveDiscountRate.toFixed(1)}%
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Original Price" value={`${currencySymbol}${fmt(price)}`} color="blue" />
                <UltraResultCard label="Total Saved" value={`${currencySymbol}${fmt(totalSaved)}`} color="green" />
                <UltraResultCard label="Effective Discount" value={`${effectiveDiscountRate.toFixed(1)}%`} color="amber" />
                <UltraResultCard label="Tax Amount" value={`${currencySymbol}${fmt(taxAmount)}`} color="main" />
              </UltraResultsGrid>

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Savings Breakdown
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  You save <strong>{currencySymbol}{fmt(totalSaved)}</strong> ({effectiveDiscountRate.toFixed(1)}% off MSRP), paying <strong>{currencySymbol}{fmt(finalPrice)}</strong> at checkout.
                  {rate2 > 0 && ` (Note: ${rate1}% + ${rate2}% stacked discounts compound sequentially to ${effectiveDiscountRate.toFixed(1)}% total savings).`}
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

      {/* MULTI-QUANTITY SAVINGS TABLE */}
      {calculated && price > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-500" />
                Multi-Quantity Savings Comparison
              </h3>
              <p className="text-xs text-slate-500">
                See how savings multiply when purchasing multiple quantities at this discounted rate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMultiQty(!showMultiQty)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0"
            >
              {showMultiQty ? "Hide Table ▲" : "View Table ▼"}
            </button>
          </div>

          <AnimatePresence>
            {showMultiQty && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-x-auto pt-2"
              >
                <table className="w-full text-xs text-left border-collapse min-w-[450px]">
                  <thead className="bg-slate-100 dark:bg-black/40 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Regular Price</th>
                      <th className="p-2.5">Discounted Price</th>
                      <th className="p-2.5 text-right text-emerald-600">Total Money Saved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                    {[1, 2, 3, 5, 10].map((qty) => (
                      <tr key={qty} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-2.5 font-bold font-sans">{qty} unit{qty > 1 ? "s" : ""}</td>
                        <td className="p-2.5 text-slate-500 line-through">{currencySymbol}{fmt(price * qty)}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{currencySymbol}{fmt(finalPrice * qty)}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">+{currencySymbol}{fmt(totalSaved * qty)}</td>
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
            Discount Formulas &amp; Sequential Stacking
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
                <strong className="text-slate-900 dark:text-white block mb-1">Standard Discount Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Final Price = Original Price × [1 - (Discount Rate / 100)]
                </code>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Stacked Double Discount Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Final Price = Price × [1 - (Rate 1 / 100)] × [1 - (Rate 2 / 100)]
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
