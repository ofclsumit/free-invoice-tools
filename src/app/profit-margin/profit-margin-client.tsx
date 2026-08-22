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
  UltraHeader, UltraCard, UltraCardHeader, UltraSectionLabel, UltraEmptyState, UltraInput, UltraTextInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function ProfitMarginClient() {
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
                      This report was generated using the Turnivo Profit Margin Calculator.
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
          <UltraCardHeader title="Calculate Margin & Markup" />

          <div className="space-y-3 mb-4">
            <UltraTextInput
              placeholder="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />

            <div>
              <UltraSectionLabel>Company Logo</UltraSectionLabel>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1 bg-white dark:bg-black/30 border border-slate-300 dark:border-white/[0.12] rounded-xl text-slate-800 dark:text-white text-sm outline-none px-4 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-100 dark:file:bg-indigo-500/20 file:text-violet-700 dark:file:text-indigo-300 file:cursor-pointer cursor-pointer"
                />
                {companyLogo && (
                  <div className="h-11 w-11 rounded-xl border border-slate-200 dark:border-white/[0.12] overflow-hidden flex-shrink-0 bg-white p-1">
                    <img src={companyLogo} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
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

          <div className="mt-4 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl p-4">
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-medium">
              <strong className="text-slate-900 dark:text-white">Profit Margin</strong> = (Selling Price - Cost) &divide; Selling Price &times; 100
            </p>
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed mt-1 font-medium">
              <strong className="text-slate-900 dark:text-white">Markup</strong> = (Selling Price - Cost) &divide; Cost &times; 100
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <UltraPrimaryButton id="calc-btn" onClick={handleCalculate} className="flex-[2]">
              Calculate Margin
            </UltraPrimaryButton>
            <UltraResetButton onClick={handleReset} />
          </div>
        </UltraCard>

        {/* ─── RESULTS CARD ─── */}
        <UltraCard>
          <UltraCardHeader title="Results" />

          {!calculated || !(c > 0 && s > 0) ? (
            <UltraEmptyState message="Enter cost & selling price and tap" actionText="Calculate Margin" />
          ) : (
            <>
              <UltraResultsGrid>
                <UltraResultCard
                  label="Net Profit / Loss"
                  value={<span className={profit >= 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-700 dark:text-rose-400 font-bold"}>{profit >= 0 ? "+" : ""}₹{fmt(profit)}</span>}
                  color="main"
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
    </>
  )
}
