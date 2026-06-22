"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Download, Eye, EyeOff } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { numToWords } from "@/lib/pdf/shared"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

const GST_RATES = [0, 5, 12, 18, 28]

export function GstCalculatorClient() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive")
  const [isDownloading, setIsDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  const printRef = useRef<HTMLDivElement>(null)

  const validateEssentialFields = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Valid amount is required", variant: "destructive" })
      return false
    }
    return true
  }

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownloadPDF = async () => {
    if (!showPreview) {
      toast({ title: "Preview required", description: "Click 'Show Preview' first before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    setIsDownloading(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `gst-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsDownloading(false)
      setIsGenerating(false)
    }
  }


return (
    <>
      {isGenerating && <LoadingScreen message="Generating GST Report PDF..." />}
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold">
            {showPreview ? "GST Report Preview" : "GST Calculator"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={togglePreview}
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{showPreview ? "Edit" : "Show Preview"}</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              <Download className="h-3.5 w-3.5" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden">
          {/* Form Panel */}
          {!showPreview && (
            <div className="flex-1 min-w-0 overflow-y-auto pb-8">
              <div className="max-w-2xl mx-auto space-y-6">

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Company Name</Label>
        <Input placeholder="Your Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Company Logo</Label>
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*" onChange={handleLogoUpload} className="h-9 text-sm flex-1" />
          {companyLogo && <div className="h-9 w-9 rounded border border-border overflow-hidden flex-shrink-0"><img src={companyLogo} alt="Logo" className="h-full w-full object-cover" /></div>}
        </div>
      </div>
      <div className="h-px bg-border" />
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
        <Label className="text-xs font-medium">Amount (₹) *</Label>
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

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 flex-1" onClick={() => setAmount("")}>
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* GST info table */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-semibold">Common GST Rates in India</h3>
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
          )}

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-full min-w-0 overflow-y-auto pb-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border mt-6 lg:mt-0 lg:pl-6">
              <div className="max-w-2xl mx-auto">
                <div id="invoice-print-root">
                  <InvoicePreview hideToolbar={true}>
                    <div
                      className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-8 print:rounded-none w-full border-gray-100"
                      style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box", minHeight: "297mm" }}
                    >
                      <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                        <div className="max-w-[50%]">
                          {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16 object-contain mb-3" />}
                          <h2 className="text-2xl font-display font-bold text-gray-900">{companyName || "Your Company Name"}</h2>
                        </div>
                        <div className="text-right">
                          <h1 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2">GST Report</h1>
                          <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{new Date().toLocaleDateString("en-IN")}</span></p>
                        </div>
                      </div>

                      <div className="mb-12 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">GST Calculation Report</h3>
                        <p className="text-gray-500 text-sm">Mode: {mode === "exclusive" ? "GST Exclusive" : "GST Inclusive"}</p>
                      </div>

                      <div className="space-y-6 mb-12">
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-6">
                          <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Base Amount</p>
                            <p className="text-2xl font-medium text-gray-900">₹{fmt(baseAmount)}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">GST Rate</p>
                            <p className="text-2xl font-medium text-gray-900">{gstRate}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-6 rounded-xl text-center col-span-2">
                            <p className="text-3xl font-display font-bold text-amber-600">₹{fmt(gstAmount)}</p>
                            <p className="text-sm font-medium text-gray-600 mt-2 uppercase tracking-wider">GST Amount</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                          <div className="bg-cyan-50 p-4 rounded-xl text-center">
                            <p className="text-lg font-display font-bold text-cyan-700">₹{fmt(cgst)}</p>
                            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">CGST ({gstRate / 2}%)</p>
                          </div>
                          <div className="bg-cyan-50 p-4 rounded-xl text-center">
                            <p className="text-lg font-display font-bold text-cyan-700">₹{fmt(sgst)}</p>
                            <p className="text-xs font-medium text-gray-600 mt-1 uppercase tracking-wider">SGST ({gstRate / 2}%)</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-6 text-center text-white">
                          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Total Amount</p>
                          <p className="text-4xl font-display font-bold">₹{fmt(totalAmount)}</p>
                        </div>

                        <div className="text-center pt-2">
                          <p className="text-gray-500 text-xs">Amount in Words</p>
                          <p className="text-gray-700 font-medium text-sm mt-1">{numToWords(totalAmount)}</p>
                        </div>
                      </div>

                      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-xs italic">
                          This report was generated using the QuoteFlow GST Calculator.
                        </p>
                      </div>
                    </div>
                  </InvoicePreview>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
