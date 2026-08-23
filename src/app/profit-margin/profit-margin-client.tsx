"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { exportNodeToPdf } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { ProfitMarginDocument } from "@/components/calculator-documents"
import {
  UltraGrid,
  UltraCard,
  UltraCardHeader,
  UltraEmptyState,
  UltraInput,
  UltraTextInput,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraResetButton,
} from "@/components/ultra/ultra-components"

export function ProfitMarginClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const c = parseFloat(cost) || 0
  const s = parseFloat(selling) || 0
  const profit = s - c
  const margin = s > 0 ? (profit / s) * 100 : 0
  const markup = c > 0 ? (profit / c) * 100 : 0

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (c > 0 && s > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid cost and selling price required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setCost("")
    setSelling("")
    setCompanyName("")
    setCompanyLogo("")
    setCalculated(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getDocData = () => ({
    title: "Profit Margin & Pricing Analysis Report",
    isDiscount: false,
    costPrice: c,
    sellingPrice: s,
    profitOrDiscountAmount: profit,
    percentage: margin,
    markupPercentage: markup,
    companyName: companyName || "Turnivo Business",
    companyLogo,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(c > 0 && s > 0)) {
      toast({ title: "Calculate first", description: "Please calculate profit margin before previewing.", variant: "destructive" })
      return
    }
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
      toast({ title: "Calculate first", description: "Please calculate profit margin before downloading.", variant: "destructive" })
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
    <>
      {isGenerating && <LoadingScreen message="Generating Profit Margin PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <ProfitMarginDocument {...getDocData()} />
      </div>

      <UltraGrid>
        {/* CALCULATE CARD */}
        <UltraCard>
          <UltraCardHeader title="Input Details" />

          <div className="mb-4 space-y-3">
            <UltraTextInput
              label="Company Name (Optional)"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-950/40 dark:file:text-violet-300 border border-border rounded-lg p-1"
              />
            </div>
          </div>

          <UltraInput
            type="number"
            placeholder="Cost Price (COGS)"
            currencySymbol="₹"
            value={cost}
            onChange={(e) => {
              setCost(e.target.value)
              setCalculated(false)
            }}
          />

          <UltraInput
            type="number"
            placeholder="Selling Price"
            currencySymbol="₹"
            value={selling}
            onChange={(e) => {
              setSelling(e.target.value)
              setCalculated(false)
            }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Margin
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* RESULTS CARD */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(c > 0 && s > 0) ? (
            <UltraEmptyState actionText="Calculate" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Pricing Metrics
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Profit Margin" value={`${margin.toFixed(2)}%`} color="main" />
                <UltraResultCard label="Markup" value={`${markup.toFixed(2)}%`} color="purple" />
                <UltraResultCard label="Gross Profit" value={`₹${fmt(profit)}`} color="green" />
                <UltraResultCard label="Selling Price" value={`₹${fmt(s)}`} color="blue" />
              </UltraResultsGrid>

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
