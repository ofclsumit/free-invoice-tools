"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function DiscountCalculatorClient() {
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  const price = parseFloat(originalPrice) || 0
  const rate = parseFloat(discountRate) || 0

  const discountAmount = (price * rate) / 100
  const finalPrice = price - discountAmount

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (price > 0 && rate > 0) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setOriginalPrice(""); setDiscountRate(""); setCalculated(false)
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `discount-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
                  style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                >
                  <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                    <div className="text-right w-full">
                      <h1 className="text-3xl font-light text-emerald-600 uppercase tracking-widest mb-2">Discount Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Discount Calculation Report</h3>
                    <p className="text-gray-500 text-sm">A detailed breakdown of the discount applied.</p>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                      <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Original Price</p>
                      <p className="text-3xl font-display font-bold text-gray-900">₹{fmt(price)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-6 rounded-xl text-center">
                        <p className="text-xl font-display font-bold text-red-600">-₹{fmt(discountAmount)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Discount ({rate}%)</p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-xl text-center">
                        <p className="text-xl font-display font-bold text-emerald-600">₹{fmt(finalPrice)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Final Price</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-center text-white">
                      <p className="text-sm uppercase tracking-widest opacity-80 mb-2">You Save</p>
                      <p className="text-3xl font-display font-bold">₹{fmt(discountAmount)} ({rate}%)</p>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Discount Calculator.
                    </p>
                  </div>
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
            badge="Calculator"
            title="Discount\nCalculator"
            subtitle="Calculate savings and final price after discount"
          />

          <UltraGrid>
            {/* ─── CALCULATE CARD ─── */}
            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Calculate</span>
              </div>

              <UltraInput
                type="number"
                placeholder="Original Price"
                currencySymbol="₹"
                value={originalPrice}
                onChange={e => { setOriginalPrice(e.target.value); setCalculated(false) }}
              />
              <UltraInput
                type="number"
                step="0.1"
                placeholder="Discount Rate"
                suffix="%"
                value={discountRate}
                onChange={e => { setDiscountRate(e.target.value); setCalculated(false) }}
              />

              <div className="flex gap-3 mt-6">
                <button
                  id="calc-btn"
                  onClick={handleCalculate}
                  className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
                >
                  Calculate Discount
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

              {!calculated || !(price > 0 && rate > 0) ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[.88rem] leading-relaxed">Enter your values and tap<br /><strong className="text-[#a78bfa]/70">Calculate Discount</strong></p>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-[#8b5cf6]/20 border border-[#8b5cf6]/45 rounded-[2rem] text-[.7rem] font-bold tracking-[.07em] uppercase text-[#c4a8ff]/95 mb-[.55rem] w-fit">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa]/90 shrink-0" />
                    Discount Details
                  </div>

                  <UltraResultsGrid>
                    <UltraResultCard label="Original Price" value={`₹${fmt(price)}`} color="blue" />
                    <UltraResultCard label={`Discount (${rate}%)`} value={`-₹${fmt(discountAmount)}`} color="amber" />
                    <UltraResultCard label="Final Price" value={`₹${fmt(finalPrice)}`} color="green" />
                    <UltraResultCard label="You Save" value={`₹${fmt(discountAmount)} (${rate}%)`} color="green" />
                  </UltraResultsGrid>

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
