"use client"
import { useState } from "react"
import { Download } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import { numToWords } from "@/lib/pdf/shared"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import { UltraShell } from "@/components/ultra/ultra-shell"
import {
  UltraNav, UltraPage, UltraGrid,
  UltraHeader, UltraCard, UltraToggle, UltraInput, UltraTextInput,
  UltraRateSelector,
  UltraResultsGrid, UltraResultCard, UltraPrimaryButton, UltraProgressBar
} from "@/components/ultra/ultra-components"

const GST_RATES = [0, 5, 12, 18, 28]

export function GstCalculatorClient() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive")
  const [calculated, setCalculated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  const numAmount = parseFloat(amount) || 0

  let baseAmount = 0, gstAmount = 0, totalAmount = 0
  if (calculated && numAmount > 0) {
    if (mode === "exclusive") {
      baseAmount = numAmount
      gstAmount = (numAmount * gstRate) / 100
      totalAmount = numAmount + gstAmount
    } else {
      totalAmount = numAmount
      baseAmount = (numAmount * 100) / (100 + gstRate)
      gstAmount = totalAmount - baseAmount
    }
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

  const handleCalculate = () => {
    if (numAmount > 0) {
      setCalculated(true)
    } else {
      setCalculated(false)
      toast({ title: "Valid amount is required", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setAmount("")
    setCalculated(false)
  }

  const handleDownloadPDF = async () => {
    if (!calculated) {
      toast({ title: "Calculate first", description: "Please calculate GST before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `gst-report-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const gstPct = calculated && totalAmount > 0 ? (gstAmount / totalAmount) * 100 : 0
  const basePct = calculated && totalAmount > 0 ? 100 - gstPct : 0

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating GST Report PDF..." />}
      <div className="absolute -left-[9999px] -top-[9999px]">
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div id="invoice-print-root">
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
                        This report was generated using the Turnivo GST Calculator.
                      </p>
                    </div>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </div>

      <UltraShell>
        <UltraNav />
        <UltraPage>
          <UltraHeader
            badge="GST Calculator India"
            title={"Instant GST\nCalculator"}
            subtitle="Real-time GST calculation with automatic CGST & SGST split."
          />

          <UltraGrid>
            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Calculate</span>
              </div>

              <div className="space-y-3 mb-4">
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
                onChange={e => { setAmount(e.target.value); setCalculated(false) }}
              />

              <UltraRateSelector
                rates={GST_RATES}
                value={gstRate}
                onChange={setGstRate}
                labels={{ 0: "Exempt", 5: "Basic", 12: "Mid", 18: "Standard", 28: "Luxury" }}
              />

              <div className="flex gap-3 mt-6">
                <button
                  id="calc-btn"
                  onClick={handleCalculate}
                  className="flex-[2] py-[.82rem] px-5 bg-gradient-to-r from-[#8b5cf6]/75 to-[#3b82f6]/60 border border-[#a78bfa]/45 rounded-[.9rem] text-white text-[.93rem] font-bold cursor-pointer font-['Inter'] transition-all duration-300 shadow-[0_4px_20px_rgba(139,92,246,.35)] hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(139,92,246,.55)] hover:from-[#8b5cf6]/90 hover:to-[#3b82f6]/75"
                >
                  Calculate GST
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-[.82rem] bg-white/[.08] border border-white/[.15] rounded-[.9rem] text-white/60 text-[.9rem] cursor-pointer font-['Inter'] transition-all duration-300 hover:bg-white/[.14] hover:text-white"
                >
                  ↺ Reset
                </button>
              </div>
            </UltraCard>

            <UltraCard>
              <div className="flex items-center gap-2 mb-[1.35rem]">
                <span className="w-[3px] h-[1.05rem] rounded-full shrink-0 bg-gradient-to-b from-[#a78bfa] to-[#60a5fa]" />
                <span className="text-[1rem] font-bold text-white/90">Results</span>
              </div>

              {!calculated || !(numAmount > 0) ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] text-white/35 text-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[.88rem] leading-relaxed">Enter your values and tap<br /><strong className="text-[#a78bfa]/70">Calculate GST</strong></p>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center gap-[.35rem] px-3 py-[.22rem] bg-[#8b5cf6]/20 border border-[#8b5cf6]/45 rounded-[2rem] text-[.7rem] font-bold tracking-[.07em] uppercase text-[#c4a8ff]/95 mb-[.55rem] w-fit">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#a78bfa]/90 shrink-0" />
                    {mode === "exclusive" ? "GST Exclusive" : "GST Inclusive"}
                  </div>

                  <UltraResultsGrid>
                    <UltraResultCard label="Base Amount" value={`₹${fmt(baseAmount)}`} color="blue" />
                    <UltraResultCard label="GST Rate" value={`${gstRate}%`} color="blue" />
                    <UltraResultCard label="GST Amount" value={`₹${fmt(gstAmount)}`} color="green" />
                    <UltraResultCard label="Total Amount" value={`₹${fmt(totalAmount)}`} color="main" />
                  </UltraResultsGrid>

                  <div className="flex justify-between items-center text-[.78rem] text-white/50 mt-4 pb-2 border-b border-white/[.06]">
                    <span>CGST ({gstRate / 2}%)</span>
                    <span className="text-white/80 font-semibold">₹{fmt(cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[.78rem] text-white/50 pb-3">
                    <span>SGST ({gstRate / 2}%)</span>
                    <span className="text-white/80 font-semibold">₹{fmt(sgst)}</span>
                  </div>

                  <UltraProgressBar label="Base vs GST" value={basePct} />

                  <UltraPrimaryButton onClick={handleDownloadPDF} disabled={isGenerating} className="w-full mt-4">
                    <Download className="w-4 h-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                  </UltraPrimaryButton>
                </>
              )}
            </UltraCard>
          </UltraGrid>
        </UltraPage>
      </UltraShell>
    </>
  )
}
