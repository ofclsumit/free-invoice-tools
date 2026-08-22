"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Download } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraEmptyState, UltraInput,
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
                      This report was generated using the Turnivo Discount Calculator.
                    </p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </div>

      <UltraGrid>
        {/* ─── CALCULATE CARD ─── */}
        <UltraCard>
          <UltraCardHeader title="Calculate Discount" />

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
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Discount
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* ─── RESULTS CARD ─── */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(price > 0 && rate > 0) ? (
            <UltraEmptyState actionText="Calculate Discount" />
          ) : (
            <>
              <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-violet-50 border border-violet-200 dark:bg-[#8b5cf6]/20 dark:border-[#8b5cf6]/45 rounded-full text-[.72rem] font-bold tracking-[.08em] uppercase text-violet-700 dark:text-[#c4a8ff] mb-[.55rem] w-fit">
                <span className="w-[6px] h-[6px] rounded-full bg-violet-600 dark:bg-[#a78bfa] shrink-0" />
                Discount Details
              </div>

              <UltraResultsGrid>
                <UltraResultCard label="Original Price" value={`₹${fmt(price)}`} color="blue" />
                <UltraResultCard label={`Discount (${rate}%)`} value={`-₹${fmt(discountAmount)}`} color="amber" />
                <UltraResultCard label="Final Price" value={`₹${fmt(finalPrice)}`} color="main" />
                <UltraResultCard label="You Save" value={`₹${fmt(discountAmount)} (${rate}%)`} color="green" />
              </UltraResultsGrid>

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
