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

export function EmiCalculatorClient() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [tenure, setTenure] = useState("")
  const [tenureUnit, setTenureUnit] = useState<"months" | "years">("years")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(amount) || 0
  const r = (parseFloat(rate) || 0) / 12 / 100
  const n = tenureUnit === "years" ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0

  let emi = 0, totalInterest = 0, totalPayment = 0
  if (P > 0 && r > 0 && n > 0) {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    totalPayment = emi * n
    totalInterest = totalPayment - P
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
        await exportNodeToPdf(node, `emi-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (showPreview) {
    return (
      <>
        {isGenerating && <LoadingScreen message="Generating EMI Report PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Back to Edit
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
                  style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                >
                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">EMI Calculation Report</h3>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Loan Amount</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p>
                        <p className="text-2xl font-medium text-gray-900">{rate}% p.a.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-6 rounded-xl text-center col-span-2">
                        <p className="text-3xl font-display font-bold text-emerald-600">₹{fmt(emi)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Monthly EMI</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                      <div className="bg-amber-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-amber-700">₹{fmt(totalInterest)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Interest</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-display font-bold text-blue-700">₹{fmt(totalPayment)}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">Total Payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow EMI Calculator.
                    </p>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
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
        <Label className="text-xs font-medium">Loan Tenure</Label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Enter tenure"
              value={tenure}
              onChange={e => setTenure(e.target.value)}
              className="h-12 text-lg font-semibold"
            />
          </div>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["years", "months"] as const).map(u => (
              <button
                key={u}
                onClick={() => setTenureUnit(u)}
                className={`px-4 py-2.5 text-sm font-medium transition-all ${
                  tenureUnit === u ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u === "years" ? "Yrs" : "Mon"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {emi > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly EMI</span>
              <span className="font-display font-bold text-xl text-emerald-600 dark:text-emerald-400">₹{fmt(emi)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Interest Payable</span>
              <span className="font-semibold text-amber-600">₹{fmt(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Payment (Principal + Interest)</span>
              <span className="font-semibold">₹{fmt(totalPayment)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-display font-bold">Principal Amount</span>
              <span className="font-display font-bold text-blue-600 dark:text-blue-400">₹{fmt(P)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Loan Tenure</p>
              <p className="text-lg font-display font-bold text-emerald-600">{n.toFixed(0)} months</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Interest %</p>
              <p className="text-lg font-display font-bold text-amber-600">{(totalInterest / P * 100).toFixed(1)}%</p>
            </div>
          </div>
          <Button onClick={() => setShowPreview(true)} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 font-semibold gap-2">
            <Eye className="h-4 w-4" /> Show Preview
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 flex-1" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  )
}
