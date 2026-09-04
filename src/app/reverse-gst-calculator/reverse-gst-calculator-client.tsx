"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Eye,
  RotateCcw,
  HelpCircle,
  Calculator,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { GstDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraResetButton,
  UltraEmptyState,
  UltraInput,
  UltraRateSelector,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
} from "@/components/ultra/ultra-components"

function CircleLoader({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-current shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

const GST_RATES = [0, 5, 12, 18, 28]

export function ReverseGstCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Core Inputs — Defaulting to clean empty state (no preloaded fake numbers)
  const [totalAmount, setTotalAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  
  // State management
  const [calculated, setCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)

  const total = parseFloat(totalAmount) || 0
  const baseAmount = calculated && total > 0 ? (total * 100) / (100 + gstRate) : 0
  const gstAmount = calculated && total > 0 ? total - baseAmount : 0
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (total > 0) {
      setIsCalculating(true)
      setTimeout(() => {
        setIsCalculating(false)
        setCalculated(true)
      }, 150)
    } else {
      setCalculated(false)
      toast({ title: "Missing Required Field", description: "Please enter the total GST-inclusive amount.", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setTotalAmount("")
    setGstRate(18)
    setCalculated(false)
  }

  const getDocData = () => ({
    title: "Reverse GST Calculation Report",
    mode: "reverse" as const,
    baseAmount,
    gstRate,
    gstAmount,
    totalAmount: total,
    cgst,
    sgst,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate reverse GST before previewing.", variant: "destructive" })
      return
    }
    setIsPreviewing(true)
    const id = savePreviewData({
      docType: "reverse-gst-calculator",
      title: "Reverse GST Report Preview",
      fileName: `reverse-gst-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(total > 0)) {
      toast({ title: "Calculate first", description: "Please calculate reverse GST before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `reverse-gst-report-${new Date().toISOString().split("T")[0]}.pdf`)
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
          <GstDocument {...getDocData()} />
        </div>
      )}

      <UltraGrid>
        {/* INPUT CARD */}
        <UltraCard>
          <UltraCardHeader title="Gross Inclusive Amount" />

          <UltraInput
            type="number"
            placeholder="Total Amount (Inclusive of GST)"
            currencySymbol="₹"
            value={totalAmount}
            onChange={(e) => {
              setTotalAmount(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraRateSelector
            rates={GST_RATES}
            selectedRate={gstRate}
            onSelect={(r) => {
              setGstRate(r)
              setCalculated(false)
            }}
            labels={{ 0: "Nil", 5: "Essential", 12: "Standard", 18: "Services", 28: "Luxury" }}
          />

          <div className="flex gap-2 sm:gap-3 mt-6">
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
                  <span>Calculate Base Price</span>
                </>
              )}
            </button>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Extracted Base & Tax" />

          {!calculated || !(total > 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
              <Calculator className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Enter your total gross invoice amount and select the GST slab, then click <strong>Calculate Base Price</strong>.
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
                  Original Pre-GST Base Price
                </span>
                <div className="text-3xl font-extrabold font-mono">
                  ₹{fmt(baseAmount)}
                </div>
                <div className="text-[11px] text-indigo-100 pt-0.5">
                  Extracted from ₹{fmt(total)} gross price at {gstRate}% GST (Tax Component: ₹{fmt(gstAmount)})
                </div>
              </div>

              {/* SECONDARY RESULTS GRID */}
              <UltraResultsGrid>
                <UltraResultCard label="Gross Total (Paid)" value={`₹${fmt(total)}`} color="blue" />
                <UltraResultCard label="Base Amount (Net)" value={`₹${fmt(baseAmount)}`} color="green" />
                <UltraResultCard label={`CGST (${gstRate / 2}%)`} value={`₹${fmt(cgst)}`} color="main" />
                <UltraResultCard label={`SGST (${gstRate / 2}%)`} value={`₹${fmt(sgst)}`} color="amber" />
              </UltraResultsGrid>

              {/* "WHAT THIS MEANS" */}
              <div className="p-3.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> Reverse Tax Extraction
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  The pre-tax product cost is <strong>₹{fmt(baseAmount)}</strong>. The remaining <strong>₹{fmt(gstAmount)}</strong> represents the {gstRate}% GST collected on this transaction.
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
            Reverse GST Formula
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
                <strong className="text-slate-900 dark:text-white block mb-1">Pre-Tax Base Amount Formula:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  Base Amount = (Gross Amount × 100) / (100 + GST Rate)
                </code>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">GST Amount:</strong>
                <code className="bg-slate-100 dark:bg-black/40 px-2 py-1 rounded font-mono text-[11px] block w-fit">
                  GST Amount = Gross Amount - Base Amount
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
