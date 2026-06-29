"use client"
import { useState, useRef } from "react"
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
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function ProfitMarginClient() {
  const [cost, setCost] = useState("")
  const [selling, setSelling] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  const c = parseFloat(cost) || 0
  const s = parseFloat(selling) || 0
  const profit = s - c
  const margin = s > 0 ? (profit / s) * 100 : 0
  const markup = c > 0 ? (profit / c) * 100 : 0

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handleCalculate = () => {
    if (c > 0 && s > 0) setCalculated(true)
    else {
      setCalculated(false)
      const btn = document.getElementById("calc-btn")
      if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "shake .4s ease" }
    }
  }

  const handleReset = () => {
    setCost(""); setSelling(""); setCompanyName(""); setCompanyLogo(""); setCalculated(false)
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

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `profit-margin-${new Date().toISOString().split('T')[0]}.pdf`);
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
                    <div className="max-w-[50%]">
                      {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16 object-contain mb-3" />}
                      <h2 className="text-2xl font-display font-bold text-gray-900">{companyName || "Your Company Name"}</h2>
                    </div>
                    <div className="text-right">
                      <h1 className="text-3xl font-light text-amber-600 uppercase tracking-widest mb-2">Analysis</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Profit Margin Report</h3>
                    <p className="text-gray-500 text-sm">A detailed breakdown of costs, revenue, and margins.</p>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Cost Price</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(c)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Selling Price</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(s)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 p-6 rounded-xl text-center col-span-2 sm:col-span-1">
                        <p className={`text-3xl font-display font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {profit >= 0 ? "+" : ""}₹{fmt(profit)}
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Profit / Loss</p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-xl text-center">
                        <p className="text-3xl font-display font-bold text-emerald-600">{margin.toFixed(1)}%</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Profit Margin</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-xl text-center sm:col-span-2">
                        <p className="text-3xl font-display font-bold text-blue-600">{markup.toFixed(1)}%</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Markup Percentage</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Profit Margin Calculator.
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
            badge="Profit Margin"
            title={"Profit\nMargin"}
            subtitle="Calculate your profit margin, markup, and see how your business is performing."
          />

          <UltraGrid>
            {/* ─── CALCULATE CARD ─── */}
            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Calculate</span>
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">Company Name</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.12] rounded-xl text-white text-sm outline-none transition-all duration-300 focus:border-indigo-500/60 px-4 py-3"
                />
              </div>

              <div className="space-y-2 mb-4">
                <label className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#f1f5f9]/65 block">Company Logo</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1 bg-black/40 border border-white/[0.12] rounded-xl text-white text-sm outline-none transition-all duration-300 focus:border-indigo-500/60 px-4 py-3 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 file:cursor-pointer cursor-pointer" />
                  {companyLogo && (
                    <div className="h-11 w-11 rounded-xl border border-white/[0.12] overflow-hidden flex-shrink-0 bg-black/40">
                      <img src={companyLogo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <UltraInput
                type="number"
                placeholder="Cost Price"
                currencySymbol="₹"
                value={cost}
                onChange={e => { setCost(e.target.value); setCalculated(false) }}
              />

              <UltraInput
                type="number"
                placeholder="Selling Price"
                currencySymbol="₹"
                value={selling}
                onChange={e => { setSelling(e.target.value); setCalculated(false) }}
              />

              <div className="mt-4 bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
                <p className="text-xs text-[#f1f5f9]/65 space-y-1.5 leading-relaxed">
                  <span className="font-semibold text-[#f1f5f9]">Profit Margin</span> = (Selling Price - Cost) &divide; Selling Price &times; 100
                </p>
                <p className="text-xs text-[#f1f5f9]/65 space-y-1.5 leading-relaxed mt-1">
                  <span className="font-semibold text-[#f1f5f9]">Markup</span> = (Selling Price - Cost) &divide; Cost &times; 100
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  id="calc-btn"
                  onClick={handleCalculate}
                  className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
                >
                  Calculate Margin
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

              {!calculated || !(c > 0 && s > 0) ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[.88rem] leading-relaxed">Enter cost &amp; selling price and tap<br /><strong className="text-[#a78bfa]/70">Calculate Margin</strong></p>
                </div>
              ) : (
                <>
                  <UltraResultsGrid>
                    <UltraResultCard
                      label="Profit / Loss"
                      value={<span className={profit >= 0 ? "text-emerald-400" : "text-rose-400"}>{profit >= 0 ? "+" : ""}₹{fmt(profit)}</span>}
                      color="amber"
                    />
                    <UltraResultCard label="Profit Margin" value={`${margin.toFixed(1)}%`} color="green" />
                    <UltraResultCard label="Markup Percentage" value={`${markup.toFixed(1)}%`} color="blue" />
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
