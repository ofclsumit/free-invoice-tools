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

const COMPOUND_FREQUENCIES = [
  { value: 1, label: "Yearly" },
  { value: 2, label: "Half-Yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
]

export function InterestCalculatorClient() {
  const [mode, setMode] = useState<"simple" | "compound">("simple")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState(12)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const P = parseFloat(principal) || 0
  const r = parseFloat(rate) || 0
  const t = parseFloat(time) || 0

  let maturity = 0, interest = 0
  if (mode === "simple") {
    interest = (P * r * t) / 100
    maturity = P + interest
  } else {
    maturity = P * Math.pow(1 + r / 100 / frequency, frequency * t)
    interest = maturity - P
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleReset = () => {
    setPrincipal(""); setRate(""); setTime("")
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `interest-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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
                      <h1 className="text-3xl font-light text-purple-600 uppercase tracking-widest mb-2">Interest Report</h1>
                      <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                    </div>
                  </div>

                  <div className="mb-12 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{mode === "simple" ? "Simple" : "Compound"} Interest Calculation Report</h3>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Principal Amount</p>
                        <p className="text-2xl font-medium text-gray-900">₹{fmt(P)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Interest Rate</p>
                        <p className="text-2xl font-medium text-gray-900">{rate}% p.a.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-6 rounded-xl text-center col-span-2 sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-emerald-600">₹{fmt(interest)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Total Interest</p>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-xl text-center sm:col-span-1">
                        <p className="text-3xl font-display font-bold text-purple-600">₹{fmt(maturity)}</p>
                        <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">Maturity Amount</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 text-xs italic">
                      This report was generated using the QuoteFlow Interest Calculator.
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
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(["simple", "compound"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              mode === m ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "simple" ? "Simple" : "Compound"}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Principal Amount (₹)</Label>
        <Input
          type="number"
          placeholder="Enter principal amount"
          value={principal}
          onChange={e => setPrincipal(e.target.value)}
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
        <Label className="text-xs font-medium">Time Period (Years)</Label>
        <Input
          type="number"
          step="0.5"
          placeholder="Enter time in years"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="h-12 text-lg font-semibold"
        />
      </div>

      {mode === "compound" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Compounding Frequency</Label>
          <div className="flex gap-2 flex-wrap">
            {COMPOUND_FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  frequency === f.value
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow-sm"
                    : "border border-border text-muted-foreground hover:border-purple-300 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {P > 0 && (
        <div className="space-y-3 pt-2">
          <div className="h-px bg-border" />
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Maturity Amount</span>
              <span className="font-display font-bold text-xl text-purple-600 dark:text-purple-400">₹{fmt(maturity)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Interest Earned</span>
              <span className="font-semibold text-emerald-600">₹{fmt(interest)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="font-display font-bold">Principal Invested</span>
              <span className="font-display font-bold text-blue-600 dark:text-blue-400">₹{fmt(P)}</span>
            </div>
          </div>
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 font-semibold gap-2">
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
