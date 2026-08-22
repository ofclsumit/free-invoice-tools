"use client"
import { useState } from "react"
import { Download, Eye, EyeOff } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraCardHeader, UltraSectionLabel, UltraEmptyState, UltraInput,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraResetButton
} from "@/components/ultra/ultra-components"

export function BreakEvenCalculatorClient() {
  const { toast } = useToast()
  const [fixedCost, setFixedCost] = useState("")
  const [variableCost, setVariableCost] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [calculated, setCalculated] = useState(false)

  const FC = parseFloat(fixedCost) || 0
  const VC = parseFloat(variableCost) || 0
  const SP = parseFloat(sellingPrice) || 0
  const contribution = SP - VC

  const breakEvenUnits = contribution > 0 ? FC / contribution : 0
  const breakEvenRevenue = breakEvenUnits * SP

  const sampleVolumes = contribution > 0
    ? [Math.round(breakEvenUnits * 0.5), Math.round(breakEvenUnits * 0.75), Math.round(breakEvenUnits * 1), Math.round(breakEvenUnits * 1.25), Math.round(breakEvenUnits * 1.5)]
      .filter(v => v > 0)
      .map(v => ({ units: v, profit: (contribution * v) - FC }))
    : []

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtUnits = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 })

  const handleCalculate = () => {
    if (FC > 0 || VC > 0 || SP > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({
        title: "Enter at least one value",
        description: "Please enter fixed cost, variable cost, or selling price.",
        variant: "destructive"
      })
    }
  }

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false)
    } else if (calculated) {
      setShowPreview(true)
    } else {
      toast({ title: "Calculate first", description: "Please calculate before viewing the preview.", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setFixedCost(""); setVariableCost(""); setSellingPrice(""); setCalculated(false)
  }

  const handleDownloadPDF = async () => {
    if (!showPreview) {
      toast({ title: "Preview required", description: "Click 'Show Preview' first before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `break-even-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const previewContent = (
    <div
      className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
      style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
    >
      <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
        <div className="text-right w-full">
          <h1 className="text-3xl font-light text-rose-600 uppercase tracking-widest mb-2">Break-Even Report</h1>
          <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
        </div>
      </div>

      <div className="mb-12 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Break-Even Analysis</h3>
        <p className="text-gray-500 text-sm">A detailed breakdown of costs, revenues, and break-even point.</p>
      </div>

      <div className="space-y-6 mb-12">
        <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-6">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Fixed Costs</p>
            <p className="text-xl font-medium text-gray-900">₹{fmt(FC)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Variable Cost/Unit</p>
            <p className="text-xl font-medium text-gray-900">₹{fmt(VC)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Selling Price/Unit</p>
            <p className="text-xl font-medium text-gray-900">₹{fmt(SP)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-50 p-6 rounded-xl text-center col-span-2">
            <p className="text-3xl font-display font-bold text-rose-600">{fmtUnits(breakEvenUnits)} units</p>
            <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Break-Even Point (Units)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
          <div className="bg-emerald-50 p-4 rounded-xl text-center">
            <p className="text-lg font-display font-bold text-emerald-700">₹{fmt(contribution)}</p>
            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Contribution Margin/Unit</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <p className="text-lg font-display font-bold text-blue-700">₹{fmt(breakEvenRevenue)}</p>
            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Break-Even Revenue</p>
          </div>
        </div>

        {sampleVolumes.length > 0 && (
          <div className="pt-8">
            <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Profit / Loss at Different Volumes</p>
            <div className="space-y-2">
              {sampleVolumes.map(v => (
                <div key={v.units} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-4 py-3">
                  <span className="text-gray-600 font-medium">{fmtUnits(v.units)} units</span>
                  <span className={`font-semibold ${v.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {v.profit >= 0 ? "+" : ""}₹{fmt(v.profit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs italic">
          This report was generated using the Turnivo Break-Even Calculator.
        </p>
      </div>
    </div>
  )

  const canShowResults = calculated && (FC > 0 || VC > 0 || SP > 0)

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">
        {isGenerating && <LoadingScreen message="Generating Break-Even Report PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <div id="invoice-print-root">
                <InvoicePreview hideToolbar={true}>
                  {previewContent}
                </InvoicePreview>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview ? (
        <UltraShell>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={togglePreview}
              className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-200 hover:text-slate-900 dark:bg-white/[0.06] dark:border-white/[0.12] dark:text-white/80 dark:hover:text-white transition-all shadow-xs"
            >
              <EyeOff className="h-4 w-4" />
              Back to Edit
            </button>
            <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating}>
              <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
            </UltraPrimaryButton>
          </div>
          <InvoicePreview hideToolbar={true}>
            {previewContent}
          </InvoicePreview>
        </UltraShell>
      ) : (
        <UltraShell>
          <UltraNav />
          <UltraPage>
            <UltraHeader
              badge="Calculator"
              title={"Break-Even\nCalculator"}
              subtitle="Find out how many units you need to sell to cover your fixed and variable costs"
            />

            <UltraGrid>
              <UltraCard>
                <UltraCardHeader title="Calculate Break-Even" />

                <UltraInput
                  type="number"
                  placeholder="Fixed Costs"
                  currencySymbol="₹"
                  value={fixedCost}
                  onChange={e => { setFixedCost(e.target.value); setCalculated(false) }}
                />
                <UltraInput
                  type="number"
                  step="0.01"
                  placeholder="Variable Cost Per Unit"
                  currencySymbol="₹"
                  value={variableCost}
                  onChange={e => { setVariableCost(e.target.value); setCalculated(false) }}
                />
                <UltraInput
                  type="number"
                  step="0.01"
                  placeholder="Selling Price Per Unit"
                  currencySymbol="₹"
                  value={sellingPrice}
                  onChange={e => { setSellingPrice(e.target.value); setCalculated(false) }}
                />

                <div className="flex gap-3 mt-6">
                  <UltraPrimaryButton onClick={handleCalculate} className="flex-[2]">
                    Calculate
                  </UltraPrimaryButton>
                  <UltraResetButton onClick={handleReset} />
                </div>
              </UltraCard>

              <UltraCard>
                <UltraCardHeader title="Results" />

                {!canShowResults ? (
                  <UltraEmptyState actionText="Calculate" />
                ) : contribution > 0 ? (
                  <>
                    <UltraResultsGrid>
                      <UltraResultCard label="Break-Even Point" value={`${fmtUnits(breakEvenUnits)} units`} color="main" />
                      <UltraResultCard label="Break-Even Revenue" value={`₹${fmt(breakEvenRevenue)}`} color="blue" />
                      <UltraResultCard label="Contribution Per Unit" value={`₹${fmt(contribution)}`} color="green" />
                    </UltraResultsGrid>

                    {sampleVolumes.length > 0 && (
                      <div className="mt-5">
                        <UltraSectionLabel>Profit / Loss at Different Volumes</UltraSectionLabel>
                        <div className="bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/[0.06] p-4">
                          {sampleVolumes.map(v => (
                            <div key={v.units} className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-white/[0.04] last:border-b-0">
                              <span className="text-sm font-semibold text-slate-800 dark:text-white/80">{fmtUnits(v.units)} units</span>
                              <span className={`font-mono text-sm font-bold ${v.profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                                {v.profit >= 0 ? "+" : ""}₹{fmt(v.profit)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button type="button" onClick={togglePreview} className="py-3 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-white/[0.06] dark:border-white/[0.12] dark:hover:bg-white/[0.1] rounded-xl text-sm font-semibold text-slate-800 dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                        <Eye className="h-4 w-4" />
                        Show Preview
                      </button>

                      <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating}>
                        <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                      </UltraPrimaryButton>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 dark:text-white/60 text-sm text-center py-8">
                      Selling price must exceed variable cost to calculate break-even.
                    </p>
                    <UltraResetButton onClick={handleReset} />
                  </>
                )}
              </UltraCard>
            </UltraGrid>
          </UltraPage>
        </UltraShell>
      )}
    </>
  )
}
