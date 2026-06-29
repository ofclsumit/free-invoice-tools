"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraInput, UltraPrimaryButton,
  UltraResultsGrid, UltraResultCard, UltraResetButton
} from "@/components/ultra/ultra-components"

export function LoanCalculatorClient() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(amount) || 0
  const annualRate = parseFloat(rate) || 0
  const months = parseFloat(tenure) || 0
  const monthlyRate = annualRate / 12 / 100

  let emi = 0, totalInterest = 0, totalCost = 0
  if (P > 0 && monthlyRate > 0 && months > 0) {
    emi = (P * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    totalCost = emi * months
    totalInterest = totalCost - P
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setAmount(""); setRate(""); setTenure("")
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

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Analysis
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
                      <h1 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2">Loan Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Loan Calculation Report</h3>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Loan Amount</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p>
                        <p className="text-2xl font-medium text-gray-900">{annualRate}% p.a.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-6 rounded-xl text-center col-span-2">
                        <p className="text-3xl font-display font-bold text-blue-600">₹{fmt(emi)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Monthly EMI</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                      <div className="bg-amber-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-amber-700">₹{fmt(totalInterest)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Interest</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-emerald-700">₹{fmt(totalCost)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Cost</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Loan Calculator.
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
        <UltraHeader
          badge="Loan Calculator"
          title={"Loan\nCalculator"}
          subtitle="Calculate your monthly payments and total loan costs instantly."
        />

        <UltraCard>
          <UltraInput
            type="number"
            placeholder="Loan Amount"
            currencySymbol="₹"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <UltraInput
            type="number"
            step="0.1"
            placeholder="Annual Interest Rate"
            value={rate}
            onChange={e => setRate(e.target.value)}
          />

          <UltraInput
            type="number"
            placeholder="Loan Tenure (Months)"
            value={tenure}
            onChange={e => setTenure(e.target.value)}
          />

          {emi > 0 && (
            <>
              <UltraResultsGrid>
                <UltraResultCard label="Monthly EMI" value={`₹${fmt(emi)}`} color="main" />
                <UltraResultCard label="Total Interest" value={`₹${fmt(totalInterest)}`} color="amber" />
                <UltraResultCard label="Total Cost" value={`₹${fmt(totalCost)}`} color="purple" />
                <UltraResultCard label="Principal" value={`₹${fmt(P)}`} color="blue" />
                <UltraResultCard label="Interest % of Total" value={`${(totalInterest / totalCost * 100).toFixed(1)}%`} color="amber" />
              </UltraResultsGrid>

              <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-2">
                <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </UltraPrimaryButton>
            </>
          )}

          <UltraResetButton onClick={handleReset} />
        </UltraCard>
      </UltraShell>
    </>
  )
}
