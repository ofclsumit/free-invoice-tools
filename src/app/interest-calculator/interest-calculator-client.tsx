"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraToggle, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

const COMPOUND_FREQUENCIES = [
  { value: 1, label: "Yearly" },
  { value: 2, label: "Half-Yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
]

export function InterestCalculatorClient() {
  const [mode, setMode] = useState<"simple" | "compound">("simple")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState(12)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const t = parseFloat(time) || 0

  let maturity = 0, interest = 0
  if (mode === "simple") {
    interest = (P * r * t) / 100
    maturity = P + interest
  } else {
    maturity = P * Math.pow(1 + r / 100 / frequency, frequency * t)
    interest = maturity - P
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setPrincipal(""); setRate(""); setTime("")
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `interest-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
                  style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                >
                  <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                    <div className="text-right w-full">
                      <h1 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2">Interest Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{mode === "simple" ? "Simple" : "Compound"} Interest Calculation Report</h3>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Principal Amount</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p>
                        <p className="text-2xl font-medium text-gray-900">{rate}% p.a.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-6 rounded-xl text-center col-span-2 sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-emerald-600">₹{fmt(interest)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Total Interest</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-xl text-center sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-blue-600">₹{fmt(maturity)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Maturity Amount</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Interest Calculator.
                    </p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>

      <UltraShell>
        <UltraHeader
          badge="Interest Calculator"
          title={"Interest\nCalculator"}
          subtitle="Calculate simple and compound interest for any investment."
        />

        <UltraCard>
          <UltraToggle
            options={[{value:"simple",label:"Simple Interest"},{value:"compound",label:"Compound Interest"}]}
            value={mode}
            onChange={(v) => setMode(v as "simple" | "compound")}
          />

          <UltraInput
            type="number"
            placeholder="Principal Amount"
            currencySymbol="₹"
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Annual Interest Rate"
            suffix="% p.a."
            value={rate}
            onChange={e => setRate(e.target.value)}
          />

          <UltraInput
            type="number"
            step="0.5"
            placeholder="Time Period"
            suffix="Years"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          {mode === "compound" && (
            <div className="space-y-2 mb-6">
              <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">Compounding Frequency</label>
              <div className="flex gap-2 flex-wrap">
                {COMPOUND_FREQUENCIES.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={`flex-1 min-w-[80px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      frequency === f.value
                        ? "border border-indigo-500/70 text-white bg-indigo-500/15 shadow-lg shadow-indigo-500/25"
                        : "bg-black/40 border border-white/[0.12] text-[#f1f5f9]/65 hover:border-white/20 hover:text-[#f1f5f9]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {P > 0 && (
            <>
              <UltraResultsGrid>
                <UltraResultCard label="Maturity Amount" value={`₹${fmt(maturity)}`} color="main" />
                <UltraResultCard label="Total Interest Earned" value={`₹${fmt(interest)}`} color="green" />
                <UltraResultCard label="Principal Invested" value={`₹${fmt(P)}`} color="blue" />
              </UltraResultsGrid>

              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-2">
                <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
            </>
          )}

          <UltraResetButton onClick={handleReset} />
        </UltraCard>
      </UltraShell>
    </>
  )
}
