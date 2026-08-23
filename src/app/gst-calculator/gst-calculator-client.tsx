"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
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
  UltraToggle,
  UltraInput,
  UltraTextInput,
  UltraRateSelector,
  UltraResultsGrid,
  UltraResultCard,
  UltraPrimaryButton,
  UltraProgressBar,
} from "@/components/ultra/ultra-components"

const GST_RATES = [0, 5, 12, 18, 28]

export function GstCalculatorClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  const numAmount = parseFloat(amount) || 0

  let baseAmount = 0
  let gstAmount = 0
  let totalAmount = 0
  if (calculated && numAmount > 0) {
    if (mode === "exclusive") {
      baseAmount = numAmount
      gstAmount = (numAmount * gstRate) / 100
      totalAmount = numAmount + gstAmount
    } else {
      totalAmount = numAmount
      baseAmount = (numAmount * 100) / (100 + gstRate)
      gstAmount = totalAmount - baseAmount
    }
  }

  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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

  const handleCalculate = () => {
    if (numAmount > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid amount is required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setAmount("")
    setCalculated(false)
  }

  const getDocData = () => ({
    mode,
    baseAmount,
    gstRate,
    gstAmount,
    totalAmount,
    cgst,
    sgst,
    companyName: companyName || "Turnivo Business",
    companyLogo,
  })

  const handlePreviewPDF = () => {
    if (!calculated || !(numAmount > 0)) {
      toast({ title: "Calculate first", description: "Please calculate GST before previewing.", variant: "destructive" })
      return
    }
    const id = savePreviewData({
      docType: "gst-calculator",
      title: "GST Calculation Report Preview",
      fileName: `gst-report-${new Date().toISOString().split("T")[0]}.pdf`,
      data: getDocData(),
    })
    router.push(`/preview/${id}`)
  }

  const handleDownloadPDF = async () => {
    if (!calculated || !(numAmount > 0)) {
      toast({ title: "Calculate first", description: "Please calculate GST before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("calculator-print-root")
      if (node) {
        await exportNodeToPdf(node, `gst-report-${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating GST Report PDF..." />}

      {/* Hidden print document for instant export */}
      <div className="absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <GstDocument {...getDocData()} />
      </div>

      <UltraGrid>
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

          <UltraToggle
            options={[
              { value: "exclusive", label: "Exclusive (Add GST)" },
              { value: "inclusive", label: "Inclusive (Remove GST)" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as "exclusive" | "inclusive")}
          />

          <UltraInput
            type="number"
            placeholder={mode === "exclusive" ? "Base Amount" : "Total Amount (with GST)"}
            currencySymbol="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <UltraRateSelector
            rates={GST_RATES}
            value={gstRate}
            onChange={setGstRate}
            labels={{ 0: "Exempt", 5: "Basic", 12: "Mid", 18: "Standard", 28: "Luxury" }}
          />

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate GST
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(numAmount > 0) ? (
            <UltraEmptyState actionText="Calculate GST" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                {mode === "exclusive" ? "GST Exclusive" : "GST Inclusive"}
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Base Amount" value={`₹${fmt(baseAmount)}`} color="blue" />
                <UltraResultCard label="GST Rate" value={`${gstRate}%`} color="blue" />
                <UltraResultCard label="GST Amount" value={`₹${fmt(gstAmount)}`} color="green" />
                <UltraResultCard label="Total Amount" value={`₹${fmt(totalAmount)}`} color="main" />
              </UltraResultsGrid>

              <div className="flex justify-between items-center text-[.82rem] text-slate-600 dark:text-white/60 mt-4 pb-2 border-b border-slate-200 dark:border-white/[.06]">
                <span>CGST ({gstRate / 2}%)</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">₹{fmt(cgst)}</span>
              </div>
              <div className="flex justify-between items-center text-[.82rem] text-slate-600 dark:text-white/60 pb-3">
                <span>SGST ({gstRate / 2}%)</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold">₹{fmt(sgst)}</span>
              </div>

              <UltraProgressBar label="Base vs GST" percent={totalAmount > 0 ? (baseAmount / totalAmount) * 100 : 0} />

              <div className="grid grid-cols-2 gap-3 mt-4">
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
