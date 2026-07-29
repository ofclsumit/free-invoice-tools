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
  UltraHeader, UltraCard, UltraToggle, UltraInput,
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

      <UltraShell>
        <UltraNav />
        <UltraPage>
          <UltraHeader
            badge="Financial Tools"
            title={"Interest\nCalculator"}
            subtitle="Simple &amp; compound interest — instant results for any amount"
          />

          <UltraGrid>
            {/* ─── CALCULATE CARD ─── */}
            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Calculate</span>
              </div>

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
                suffix="% p.a."
                value={rate}
                onChange={e => { setRate(e.target.value); setCalculated(false) }}
              />

              <UltraInput
                type="number"
                step="0.5"
                placeholder="Time Period"
                suffix="Years"
                value={time}
                onChange={e => { setTime(e.target.value); setCalculated(false) }}
              />

              {mode === "compound" && (
                <div className="mb-4">
                  <label className="block text-[.72rem] font-bold tracking-[.07em] uppercase text-[#a78bfa]/90 mb-[.4rem]">Compounding Frequency</label>
                  <div className="flex gap-[.25rem] bg-black/30 rounded-[.9rem] p-[.28rem]">
                    {COMPOUND_FREQUENCIES.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFrequency(f.value)}
                        className={`flex-1 py-[.55rem] px-[.6rem] border-none bg-transparent rounded-[.65rem] text-[.8rem] font-semibold cursor-pointer font-['Inter'] transition-all duration-300 whitespace-nowrap ${
                          frequency === f.value
                            ? "bg-gradient-to-r from-[#8b5cf6]/60 to-[#3b82f6]/45 text-white shadow-[0_2px_12px_rgba(139,92,246,.35)]"
                            : "text-white/45 hover:text-white/70 hover:bg-white/[.06]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  id="calc-btn"
                  onClick={handleCalculate}
                  className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
                >
                  Calculate Interest
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-[.82rem] bg-white/[.08] border border-white/[.15] rounded-[.9rem] text-white/60 text-[.9rem] cursor-pointer font-['Inter'] transition-all duration-300 hover:bg-white/[.14] hover:text-white"
                >
                  ↺ Reset
                </button>
              </div>
            </UltraCard>

            {/* ─── RESULTS CARD ─── */}
            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Results</span>
              </div>

              {!calculated || !(P > 0 && r > 0 && t > 0) ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[.88rem] leading-relaxed">Enter your values and tap<br /><strong className="text-[#a78bfa]/70">Calculate Interest</strong></p>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-[#8b5cf6]/20 border border-[#8b5cf6]/45 rounded-[2rem] text-[.7rem] font-bold tracking-[.07em] uppercase text-[#c4a8ff]/95 mb-[.55rem] w-fit">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa]/90 shrink-0" />
                    {mode === "simple" ? "Simple Interest" : "Compound Interest"}
                  </div>

                  <UltraResultsGrid>
                    <UltraResultCard label="Principal Amount" value={`₹${fmt(P)}`} color="blue" />
                    <UltraResultCard label="Rate &amp; Duration" value={`${rate}% × ${t} ${t === 1 ? "Year" : "Years"}`} color="blue" />
                    <UltraResultCard label="Interest Earned" value={`₹${fmt(interest)}`} color="green" />
                    <UltraResultCard label="Maturity Amount" value={`₹${fmt(maturity)}`} color="main" />
                  </UltraResultsGrid>

                  <UltraProgressBar label="Interest vs Principal" value={iPct} />

                  <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4">
                    <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                  </UltraPrimaryButton>
                </>
              )}
            </UltraCard>
          </UltraGrid>
        </UltraPage>
      </UltraShell>
    </>
  )
}
