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

    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Loan Amount (₹)</Label>
        <Input
          type="number"
          placeholder="Enter loan amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Annual Interest Rate (%)</Label>
        <Input
          type="number"
          step="0.1"
          placeholder="Enter interest rate"
          value={rate}
          onChange={e => setRate(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Loan Tenure (Months)</Label>
        <Input
          type="number"
          placeholder="Enter tenure in months"
          value={tenure}
          onChange={e => setTenure(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      {emi > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly EMI</span>
              <span className="font-display font-bold text-xl text-blue-600 dark:text-blue-400">₹{fmt(emi)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Interest Payable</span>
              <span className="font-semibold text-amber-600">₹{fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Cost (Principal + Interest)</span>
              <span className="font-semibold">₹{fmt(totalCost)}</span>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Principal</p>
              <p className="text-lg font-display font-bold text-blue-600">₹{fmt(P)}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Interest % of Total</p>
              <p className="text-lg font-display font-bold text-amber-600">{(totalInterest / totalCost * 100).toFixed(1)}%</p>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 font-semibold gap-2">
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
