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
  UltraHeader, UltraCard, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton
} from "@/components/ultra/ultra-components"

export function LoanCalculatorClient() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(amount) || 0
  const annualRate = parseFloat(rate) || 0
  const months = parseFloat(tenure) || 0
  const monthlyRate = annualRate / 12 / 100

  let emi = 0, totalInterest = 0, totalCost = 0
  if (calculated && P > 0 && monthlyRate > 0 && months > 0) {
    emi = (P * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    totalCost = emi * months
    totalInterest = totalCost - P
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCalculate = () => {
    if (P > 0 && annualRate > 0 && months > 0) setCalculated(true)
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
        await exportNodeToPdf(node, `loan-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
                <div className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100" style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}>
                  <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                    <div className="text-right w-full">
                      <h1 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2">Loan Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>
                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Loan Calculation Report</h3>
                  </div>
                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Loan Amount</p><p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p></div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p><p className="text-2xl font-medium text-gray-900">{annualRate}% p.a.</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-6 rounded-xl text-center col-span-2"><p className="text-3xl font-display font-bold text-blue-600">₹{fmt(emi)}</p><p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Monthly EMI</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                      <div className="bg-amber-50 p-4 rounded-xl text-center"><p className="text-lg font-display font-bold text-amber-700">₹{fmt(totalInterest)}</p><p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Interest</p></div>
                      <div className="bg-emerald-50 p-4 rounded-xl text-center"><p className="text-lg font-display font-bold text-emerald-700">₹{fmt(totalCost)}</p><p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Cost</p></div>
                    </div>
                  </div>
                  <div className="mt-16 pt-8 border-t border-gray-100 text-center"><p className="text-gray-400 text-xs italic">This report was generated using the QuoteFlow Loan Calculator.</p></div>
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
            badge="Loan Calculator"
            title={"Loan\nCalculator"}
            subtitle="Calculate your monthly payments and total loan costs instantly."
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

              <UltraInput
                type="number"
                placeholder="Loan Tenure"
                suffix="Months"
                value={tenure}
                onChange={e => { setTenure(e.target.value); setCalculated(false) }}
              />

              <div className="flex gap-3 mt-6">
                <button
                  id="calc-btn"
                  onClick={handleCalculate}
                  className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
                >
                  Calculate EMI
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

              {!calculated || !(P > 0 && annualRate > 0 && months > 0) ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[.88rem] leading-relaxed">Enter your values and tap<br /><strong className="text-[#a78bfa]/70">Calculate EMI</strong></p>
                </div>
              ) : (
                <>
                  <UltraResultsGrid>
                    <UltraResultCard label="Monthly EMI" value={`₹${fmt(emi)}`} color="main" />
                    <UltraResultCard label="Total Interest" value={`₹${fmt(totalInterest)}`} color="amber" />
                    <UltraResultCard label="Total Cost" value={`₹${fmt(totalCost)}`} color="purple" />
                    <UltraResultCard label="Principal" value={`₹${fmt(P)}`} color="blue" />
                    <UltraResultCard label="Interest % of Total" value={`${(totalInterest / totalCost * 100).toFixed(1)}%`} color="amber" />
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
