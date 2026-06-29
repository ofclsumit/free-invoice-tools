"use client"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Download, Eye, EyeOff, Export, RotateCcw } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { numToWords } from "@/lib/pdf/shared"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraHeader, UltraCard, UltraToggle, UltraInput, UltraTextInput, UltraRateSelector, UltraPrimaryButton,
  UltraDivider, UltraResultCard, UltraResultsGrid, UltraSplitRow,
  UltraSplitContainer, UltraProgressBar, UltraResetButton, UltraRateTable,
} from "@/components/ultra/ultra-components"

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
      <UltraShell>
        <UltraHeader badge="GST Calculator India" title={<>Instant GST<br/>Calculator</>} subtitle="Real-time GST calculation with automatic CGST & SGST split." />

        {!showPreview ? (
          <>
            <UltraCard>
              <div className="flex items-center justify-between mb-6">
                <div />
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePreview}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/[0.12] rounded-lg text-xs text-[#f1f5f9]/65 hover:text-[#f1f5f9] transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Show Preview</span>
                  </button>
                  <UltraPrimaryButton onClick={() => handleDownloadPDF()} disabled={isGenerating} className="!px-3 !py-1.5 !text-xs !rounded-lg">
                    <Download className="w-3.5 h-3.5" /> {isGenerating ? "Generating..." : "PDF"}
                  </UltraPrimaryButton>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <UltraTextInput placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full bg-black/40 border border-white/[0.12] rounded-xl text-white text-sm outline-none px-4 py-3 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:bg-indigo-500/20 file:text-indigo-300 file:border-0 file:text-xs file:font-semibold"
                    />
                  </div>
                  {companyLogo && (
                    <div className="h-12 w-12 rounded-xl border border-white/[0.12] overflow-hidden flex-shrink-0">
                      <img src={companyLogo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <UltraDivider />

              <UltraToggle
                options={[{ value: "exclusive", label: "+ GST Exclusive" }, { value: "inclusive", label: "Incl. GST" }]}
                value={mode}
                onChange={(v) => setMode(v as "exclusive" | "inclusive")}
              />

              <UltraInput
                type="number"
                placeholder="Enter amount"
                currencySymbol="₹"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />

              <UltraRateSelector
                rates={GST_RATES}
                value={gstRate}
                onChange={setGstRate}
                labels={{ 0: "Exempt", 5: "Basic", 12: "Mid", 18: "Standard", 28: "Luxury" }}
              />

              <UltraDivider />

              {numAmount > 0 && (
                <>
                  <UltraResultsGrid>
                    <UltraResultCard
                      color="main"
                      label="Total Amount"
                      value={`₹${fmt(totalAmount)}`}
                      sub={mode === "exclusive" ? `Base + ${gstRate}% GST` : `Inclusive of ${gstRate}% GST`}
                    />
                    <UltraResultCard color="green" label="Base Amount" value={`₹${fmt(baseAmount)}`} />
                    <UltraResultCard color="purple" label="GST Amount" value={`₹${fmt(gstAmount)}`} />
                  </UltraResultsGrid>

                  <UltraSplitContainer>
                    <UltraSplitRow label={`CGST (${gstRate / 2}%)`} value={`₹${fmt(cgst)}`} dotColor="#6366f1" />
                    <UltraSplitRow label={`SGST (${gstRate / 2}%)`} value={`₹${fmt(sgst)}`} dotColor="#8b5cf6" />
                  </UltraSplitContainer>

                  <div className="mt-5">
                    <UltraProgressBar label="Base amount" value={(baseAmount / totalAmount) * 100} color="indigo" />
                    <UltraProgressBar label="GST portion" value={(gstAmount / totalAmount) * 100} color="emerald" />
                  </div>
                </>
              )}

              <UltraResetButton onClick={() => setAmount("")} />
            </UltraCard>

            <UltraRateTable
              rows={[
                { rate: "0%", label: "Exempt", desc: "Essential food items, books, newspapers" },
                { rate: "5%", label: "Basic", desc: "Packaged food, footwear under ₹1000, transport" },
                { rate: "12%", label: "Mid", desc: "Processed food, mobiles, computers" },
                { rate: "18%", label: "Standard", desc: "IT services, restaurants, most goods" },
                { rate: "28%", label: "Luxury", desc: "Luxury goods, tobacco, automobiles" },
              ]}
              onSelect={(r) => setGstRate(parseInt(r))}
            />
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-[#f1f5f9]">GST Report Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/[0.12] rounded-lg text-xs text-[#f1f5f9]/65 hover:text-[#f1f5f9] transition-all"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="!px-3 !py-1.5 !text-xs !rounded-lg">
                  <Download className="h-3.5 w-3.5" />
                  {isGenerating ? "Generating..." : "Download PDF"}
                </UltraPrimaryButton>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6">
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
      </UltraShell>
    </>
  )
}
