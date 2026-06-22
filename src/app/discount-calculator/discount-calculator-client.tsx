"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download, Eye, ArrowLeft } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

export function DiscountCalculatorClient() {
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountRate, setDiscountRate] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  const price = parseFloat(originalPrice) || 0
  const rate = parseFloat(discountRate) || 0

  const discountAmount = (price * rate) / 100
  const finalPrice = price - discountAmount

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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

  const handleReset = () => {
    setOriginalPrice(""); setDiscountRate("")
  }

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Back to Edit
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
      </>
    )
  

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>

    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Original Price (₹)</Label>
        <Input
          type="number"
          placeholder="Enter original price"
          value={originalPrice}
          onChange={e => setOriginalPrice(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Discount Rate (%)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="Enter discount percentage"
          value={discountRate}
          onChange={e => setDiscountRate(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      {price > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Original Price</span>
              <span className="font-semibold">₹{fmt(price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Discount ({rate}%)</span>
              <span className="font-semibold text-green-600">-₹{fmt(discountAmount)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-display font-bold">Final Price</span>
              <span className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">₹{fmt(finalPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">You Save</span>
              <span className="font-semibold text-green-600">₹{fmt(discountAmount)} ({rate}%)</span>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 font-semibold gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      )}

      <Button variant="outline" className="gap-2 w-full" onClick={handleReset}>
        <RefreshCw className="h-4 w-4" /> Reset
      </Button>
    </div>
  </>
  )
}
