"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calculator, RefreshCw, Download } from "lucide-react"
import { generateGSTCalcPDF } from "@/lib/pdf/generate-gst-calc"

const GST_RATES = [0, 5, 12, 18, 28]

export default function GSTCalculatorPage() {
  const [amount, setAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive")
  const [isDownloading, setIsDownloading] = useState(false)

  const numAmount = parseFloat(amount) || 0

  let baseAmount = 0, gstAmount = 0, totalAmount = 0
  if (mode === "exclusive") {
    baseAmount = numAmount
    gstAmount = (numAmount * gstRate) / 100
    totalAmount = numAmount + gstAmount
  } else {
    totalAmount = numAmount
    baseAmount = (numAmount * 100) / (100 + gstRate)
    gstAmount = totalAmount - baseAmount
  }

  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generateGSTCalcPDF({
        amount: numAmount,
        rate: gstRate,
        mode,
        baseAmount,
        gstAmount,
        cgst,
        sgst,
        totalAmount,
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 mb-4">
            <Calculator className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">GST Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate GST amount for any value instantly</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6 shadow-glass">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["exclusive", "inclusive"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === m ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="hidden sm:inline">GST {m === "exclusive" ? "Exclusive" : "Inclusive"}</span>
                <span className="sm:hidden">{m === "exclusive" ? "+ GST" : "Incl. GST"}</span>
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="h-12 text-lg font-semibold"
            />
          </div>

          {/* GST Rate selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">GST Rate</Label>
            <div className="flex gap-2 flex-wrap">
              {GST_RATES.map(rate => (
                <button
                  key={rate}
                  onClick={() => setGstRate(rate)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    gstRate === rate
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-glow-sm"
                      : "border border-border text-muted-foreground hover:border-blue-300 hover:text-foreground"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {numAmount > 0 && (
            <div className="space-y-3 pt-2">
              <div className="h-px bg-border" />
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Amount</span>
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
                  <span className="font-display font-bold">Total Amount</span>
                  <span className="font-display font-bold text-xl text-blue-600 dark:text-blue-400">₹{fmt(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 flex-1" onClick={() => setAmount("")}>
                <RefreshCw className="h-4 w-4" /> Reset
              </Button>
              {numAmount > 0 && (
                <Button disabled={isDownloading} onClick={handleDownloadPDF} variant="outline" className="gap-2 flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                  <Download className="h-4 w-4" /> {isDownloading ? "..." : "Download PDF"}
                </Button>
              )}
            </div>

          </div>
        </div>

        {/* GST info table */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-semibold">Common GST Rates in India</h2>
          </div>
          <div className="divide-y divide-border text-sm">
            {[
              { rate: "0%", items: "Essential food items, books, newspapers" },
              { rate: "5%", items: "Packaged food, footwear under ₹1000, transport" },
              { rate: "12%", items: "Processed food, mobiles, computers" },
              { rate: "18%", items: "IT services, restaurants, most goods" },
              { rate: "28%", items: "Luxury goods, tobacco, automobiles" },
            ].map(row => (
              <div key={row.rate} className="flex gap-4 px-5 py-3">
                <span className="font-display font-bold text-blue-600 w-12 flex-shrink-0">{row.rate}</span>
                <span className="text-muted-foreground">{row.items}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
