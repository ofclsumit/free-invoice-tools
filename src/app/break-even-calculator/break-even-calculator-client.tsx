"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download, Eye, ArrowLeft } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

export function BreakEvenCalculatorClient() {
  const [fixedCost, setFixedCost] = useState("")
  const [variableCost, setVariableCost] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

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

  const handleReset = () => {
    setFixedCost(""); setVariableCost(""); setSellingPrice("")
  }

  const handleDownloadPDF = async () => {
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
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
                      This report was generated using the QuoteFlow Break-Even Calculator.
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

    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Fixed Costs (₹)</Label>
        <Input
          type="number"
          placeholder="Enter total fixed costs"
          value={fixedCost}
          onChange={e => setFixedCost(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Variable Cost Per Unit (₹)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Enter variable cost per unit"
          value={variableCost}
          onChange={e => setVariableCost(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Selling Price Per Unit (₹)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Enter selling price per unit"
          value={sellingPrice}
          onChange={e => setSellingPrice(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      {contribution > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Break-Even Point (Units)</span>
              <span className="font-display font-bold text-xl text-rose-600 dark:text-rose-400">{fmtUnits(breakEvenUnits)} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Break-Even Revenue</span>
              <span className="font-semibold">₹{fmt(breakEvenRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Contribution Per Unit</span>
              <span className="font-semibold text-emerald-600">₹{fmt(contribution)}</span>
            </div>
          </div>

          {sampleVolumes.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Profit / Loss at Different Volumes</p>
              <div className="space-y-1.5">
                {sampleVolumes.map(v => (
                  <div key={v.units} className="flex justify-between items-center text-sm bg-muted/30 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">{fmtUnits(v.units)} units</span>
                    <span className={`font-semibold ${v.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {v.profit >= 0 ? "+" : ""}₹{fmt(v.profit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white border-0 font-semibold gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 flex-1" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  </>
  )
}
