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

const GST_RATES = [0, 5, 12, 18, 28]

export function ReverseGstCalculatorClient() {
  const [totalAmount, setTotalAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const total = parseFloat(totalAmount) || 0
  const baseAmount = (total * 100) / (100 + gstRate)
  const gstAmount = total - baseAmount
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setTotalAmount(""); setGstRate(18)
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `reverse-gst-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
                      <h1 className="text-3xl font-light text-teal-600 uppercase tracking-widest mb-2">Reverse GST Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reverse GST Calculation</h3>
                    <p className="text-gray-500 text-sm">A detailed breakdown of Base Amount and GST components from the Total Amount.</p>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Total (Inclusive)</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(total)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">GST Rate</p>
                        <p className="text-2xl font-medium text-gray-900">{gstRate}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-teal-50 p-6 rounded-xl text-center col-span-2 sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-teal-600">₹{fmt(baseAmount)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Base Amount</p>
                      </div>
                      <div className="bg-amber-50 p-6 rounded-xl text-center sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-amber-600">₹{fmt(gstAmount)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Total GST</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-gray-700">₹{fmt(cgst)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">CGST ({gstRate/2}%)</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-gray-700">₹{fmt(sgst)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">SGST ({gstRate/2}%)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Reverse GST Calculator.
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
        <Label className="text-xs font-medium">Total Amount (Inclusive of GST) (₹)</Label>
        <Input
          type="number"
          placeholder="Enter total amount including GST"
          value={totalAmount}
          onChange={e => setTotalAmount(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">GST Rate</Label>
        <div className="flex gap-2 flex-wrap">
          {GST_RATES.map(rate => (
            <button
              key={rate}
              onClick={() => setGstRate(rate)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                gstRate === rate
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-glow-sm"
                  : "border border-border text-muted-foreground hover:border-teal-300 hover:text-foreground"
              }`}
            >
              {rate}%
            </button>
          ))}
        </div>
      </div>

      {total > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Base Amount (without GST)</span>
              <span className="font-semibold">₹{fmt(baseAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">GST ({gstRate}%)</span>
              <span className="font-semibold text-amber-600">₹{fmt(gstAmount)}</span>
            </div>
            <div className="pl-4 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">↳ CGST ({gstRate / 2}%)</span>
                <span className="text-xs text-muted-foreground">₹{fmt(cgst)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">↳ SGST ({gstRate / 2}%)</span>
                <span className="text-xs text-muted-foreground">₹{fmt(sgst)}</span>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-display font-bold">Total (Inclusive)</span>
              <span className="font-display font-bold text-xl text-teal-600 dark:text-teal-400">₹{fmt(total)}</span>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 font-semibold gap-2">
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
