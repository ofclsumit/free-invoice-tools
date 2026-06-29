"use client"
import { useState } from "react"
import { Download, ArrowLeft, Export, RotateCcw } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraInput, UltraRateSelector, UltraPrimaryButton,
  UltraDivider, UltraResultCard, UltraResultsGrid, UltraResetButton,
} from "@/components/ultra/ultra-components"

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
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium border border-border transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </button>
              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="!px-4 !py-2">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
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

      <UltraShell>
        <UltraHeader badge="Reverse GST" title={<>Reverse GST<br/>Calculator</>} subtitle="Calculate the original base amount and GST from a total inclusive price." />

        <UltraCard>
          <UltraInput
            type="number"
            placeholder="Total Amount (Inclusive of GST)"
            currencySymbol="₹"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
          />

          <UltraRateSelector
            rates={GST_RATES}
            value={gstRate}
            onChange={setGstRate}
            labels={{ 0: "Exempt", 5: "Basic", 12: "Mid", 18: "Standard", 28: "Luxury" }}
          />

          <UltraDivider />

          {total > 0 && (
            <>
              <UltraResultsGrid>
                <UltraResultCard color="main" label="Total (Inclusive)" value={`₹${fmt(total)}`} sub={`Including ${gstRate}% GST`} />
                <UltraResultCard color="green" label="Base Amount" value={`₹${fmt(baseAmount)}`} sub="Without GST" />
                <UltraResultCard color="amber" label="GST Amount" value={`₹${fmt(gstAmount)}`} sub={`${gstRate}% GST`} />
              </UltraResultsGrid>

              <div className="mt-4 p-4 sm:p-5 bg-black/30 rounded-xl border border-white/[0.06]">
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-[#f1f5f9]/65">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#6366f1" }} />
                    CGST ({gstRate / 2}%)
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold text-indigo-400">₹{fmt(cgst)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-[#f1f5f9]/65">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#8b5cf6" }} />
                    SGST ({gstRate / 2}%)
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-semibold text-purple-400">₹{fmt(sgst)}</span>
                </div>
              </div>

              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-6">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
            </>
          )}

          <UltraResetButton onClick={handleReset} />
        </UltraCard>
      </UltraShell>
    </>
  )
}
