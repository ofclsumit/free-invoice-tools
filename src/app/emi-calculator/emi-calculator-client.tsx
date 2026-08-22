"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, X, ZoomIn, ZoomOut } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraResetButton, UltraEmptyState, UltraToggle, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraProgressBar
} from "@/components/ultra/ultra-components"

export function EmiCalculatorClient() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years")
  const [calculated, setCalculated] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setZoom(1)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showPreview])

  const P = parseFloat(amount) || 0
  const r = (parseFloat(rate) || 0) / 12 / 100
  const n = tenureUnit === "years" ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0

  let emi = 0, totalInterest = 0, totalPayment = 0
  if (P > 0 && r > 0 && n > 0) {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    totalPayment = emi * n
    totalInterest = totalPayment - P
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && r > 0 && n > 0) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setAmount(""); setRate(""); setTenure(""); setCalculated(false)
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `emi-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const renderReport = () => (
    <div
      className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
      style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
    >
      <div className="mb-12 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">EMI Calculation Report</h3>
      </div>

      <div className="space-y-6 mb-12">
        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Loan Amount</p>
            <p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p>
            <p className="text-2xl font-medium text-gray-900">{rate}% p.a.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-6 rounded-xl text-center col-span-2">
            <p className="text-3xl font-display font-bold text-emerald-600">₹{fmt(emi)}</p>
            <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Monthly EMI</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
          <div className="bg-amber-50 p-4 rounded-xl text-center">
            <p className="text-lg font-display font-bold text-amber-700">₹{fmt(totalInterest)}</p>
            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Interest</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <p className="text-lg font-display font-bold text-blue-700">₹{fmt(totalPayment)}</p>
            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Payment</p>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs italic">
          This report was generated using the Turnivo EMI Calculator.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating EMI Report PDF..." />}

      {/* Hidden print root */}
      <div id="invoice-print-wrapper" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <div id="invoice-print-root">
          <InvoicePreview hideToolbar={true}>
            {renderReport()}
          </InvoicePreview>
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block text-foreground">EMI Report Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 ml-4 border border-border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm text-foreground" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium w-12 text-center select-none text-foreground">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm text-foreground" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-0 sm:p-2 md:p-4 flex flex-col items-center"
              style={{ cursor: "grab" }}
            >
              <div
                className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  margin: "0 auto"
                }}
              >
                <InvoicePreview hideToolbar={true}>
                  {renderReport()}
                </InvoicePreview>
              </div>
            </div>
          </div>
        </div>
      )}

      <UltraShell>
        <UltraNav />
        <UltraPage>
          <UltraHeader
            badge="EMI Calculator"
            title={"EMI\nCalculator"}
            subtitle="Plan your loan payments with instant EMI calculations."
          />

          <UltraGrid>
            {/* ─── CALCULATE CARD ─── */}
            <UltraCard>
              <UltraCardHeader title="Calculate EMI" />

              <UltraInput
                type="number"
                placeholder="Loan Amount"
                currencySymbol="₹"
                value={amount}
                onChange={e => { setAmount(e.target.value); setCalculated(false) }}
              />

              <UltraInput
                type="number"
                step="0.1"
                placeholder="Annual Interest Rate"
                suffix="% p.a."
                value={rate}
                onChange={e => { setRate(e.target.value); setCalculated(false) }}
              />

              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <UltraInput
                    type="number"
                    placeholder="Loan Tenure"
                    value={tenure}
                    onChange={e => { setTenure(e.target.value); setCalculated(false) }}
                  />
                </div>
                <div className="min-w-[160px] pt-7">
                  <UltraToggle
                    options={[{value:"months",label:"Months"},{value:"years",label:"Years"}]}
                    value={tenureUnit}
                    onChange={(v) => setTenureUnit(v as "months" | "years")}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
                  Calculate EMI
                </UltraPrimaryButton>
                <UltraResetButton onClick={handleReset} />
              </div>
            </UltraCard>

            {/* ─── RESULTS CARD ─── */}
            <UltraCard>
              <UltraCardHeader title="Results" />

              {!calculated || !(P > 0 && r > 0 && n > 0) ? (
                <UltraEmptyState actionText="Calculate EMI" />
              ) : (
                <>
                  <UltraResultsGrid>
                    <UltraResultCard label="Monthly EMI" value={`₹${fmt(emi)}`} color="main" />
                    <UltraResultCard label="Total Interest" value={`₹${fmt(totalInterest)}`} color="amber" />
                    <UltraResultCard label="Total Payment" value={`₹${fmt(totalPayment)}`} color="purple" />
                    <UltraResultCard label="Principal Amount" value={`₹${fmt(P)}`} color="blue" />
                    <UltraResultCard label="Loan Tenure" value={`${n.toFixed(0)} months`} />
                    <UltraResultCard label="Total Interest %" value={`${(totalInterest / P * 100).toFixed(1)}%`} color="amber" />
                  </UltraResultsGrid>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button type="button" onClick={() => setShowPreview(true)} className="py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-white/[0.06] dark:border-white/[0.12] dark:hover:bg-white/[0.1] rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Eye className="w-4 h-4" /> Show Preview
                    </button>
                    <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating}>
                      <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                    </UltraPrimaryButton>
                  </div>
                </>
              )}
            </UltraCard>
          </UltraGrid>
        </UltraPage>
      </UltraShell>
    </>
  )
}
