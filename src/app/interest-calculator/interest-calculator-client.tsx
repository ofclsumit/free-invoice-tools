"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraSectionLabel, UltraEmptyState, UltraToggle, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton, UltraProgressBar
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
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const t = parseFloat(time) || 0

  let maturity = 0, interest = 0
  if (calculated && P > 0 && r > 0 && t > 0) {
    if (mode === "simple") {
      interest = (P * r * t) / 100
      maturity = P + interest
    } else {
      maturity = P * Math.pow(1 + r / 100 / frequency, frequency * t)
      interest = maturity - P
    }
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && r > 0 && t > 0) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setPrincipal(""); setRate(""); setTime(""); setCalculated(false)
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

  const iPct = calculated && maturity > 0 ? ((interest / maturity) * 100) : 0
  const pPct = calculated && maturity > 0 ? (100 - iPct) : 0

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100" style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}>
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
                      <div className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Principal Amount</p><p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p></div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p><p className="text-2xl font-medium text-gray-900">{rate}% p.a.</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-6 rounded-xl text-center col-span-2 sm:col-span-1"><p className="text-3xl font-display font-bold text-emerald-600">₹{fmt(interest)}</p><p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Total Interest</p></div>
                      <div className="bg-blue-50 p-6 rounded-xl text-center sm:col-span-1"><p className="text-3xl font-display font-bold text-blue-600">₹{fmt(maturity)}</p><p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Maturity Amount</p></div>
                    </div>
                  </div>
                  <div className="mt-16 pt-8 border-t border-gray-100 text-center"><p className="text-gray-400 text-xs italic">This report was generated using the Turnivo Interest Calculator.</p></div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </div>

      <UltraGrid>
        {/* ─── CALCULATE CARD ─── */}
        <UltraCard>
          <UltraCardHeader title="Calculate Interest" />

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
            onChange={e => { setPrincipal(e.target.value); setCalculated(false) }}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Annual Interest Rate"
            suffix="%"
            value={rate}
            onChange={e => { setRate(e.target.value); setCalculated(false) }}
          />

          <UltraInput
            type="number"
            placeholder="Time Period (Years)"
            value={time}
            onChange={e => { setTime(e.target.value); setCalculated(false) }}
          />

          {mode === "compound" && (
            <div>
              <UltraSectionLabel>Compounding Frequency</UltraSectionLabel>
              <UltraToggle
                options={COMPOUND_FREQUENCIES}
                value={frequency}
                onChange={setFrequency}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Interest
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* ─── RESULTS CARD ─── */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(P > 0 && r > 0 && t > 0) ? (
            <UltraEmptyState actionText="Calculate Interest" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                {mode === "simple" ? "Simple Interest" : "Compound Interest"}
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Principal Amount" value={`₹${fmt(P)}`} color="blue" />
                <UltraResultCard label="Rate & Duration" value={`${rate}% × ${t} ${t === 1 ? "Year" : "Years"}`} color="blue" />
                <UltraResultCard label="Interest Earned" value={`₹${fmt(interest)}`} color="green" />
                <UltraResultCard label="Maturity Amount" value={`₹${fmt(maturity)}`} color="main" />
              </UltraResultsGrid>

              <UltraProgressBar label="Interest vs Principal" percent={iPct} />

              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4">
                <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
            </>
          )}
        </UltraCard>
      </UltraGrid>
    </>
  )
}
