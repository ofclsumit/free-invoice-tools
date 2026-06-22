"use client"
import React, { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  MinimalMonoTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  numberToWords,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"

export function CashReceiptClient() {
  const [receivedFrom, setReceivedFrom] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [receiptNo, setReceiptNo] = useState("")
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0])
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })
  const numAmount = parseFloat(amount) || 0

  const { invoiceData } = React.useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: receiptNo || String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
      invoiceDate: receiptDate,
      status: "Paid",
      currencySymbol: "₹",
      gstMode: "none",
      company: {
        name: companyName || "Your Company Name",
        logoUrl: companyLogo,
        addressLines: [],
      },
      billTo: {
        name: receivedFrom || "Name",
        addressLines: [],
      },
      items: [
        {
          id: "1",
          description: `Purpose: ${purpose || "-"}\nPayment Mode: ${paymentMode}`,
          quantity: 1,
          rate: numAmount,
        }
      ],
      amountPaid: numAmount,
    };

    return { totals: computeInvoiceTotals(templateData), invoiceData: templateData };
  }, [receivedFrom, numAmount, purpose, paymentMode, receiptNo, receiptDate, companyName, companyLogo]);

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `cash-receipt-${receiptNo || "draft"}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleShowPreview = () => {
    if (!receiptNo) setReceiptNo(String(Math.floor(Math.random() * 10000)).padStart(4, "0"))
    setShowPreview(true)
  }

  if (showPreview) {
    return (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Receipt
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <MinimalMonoTemplate invoice={invoiceData} />
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
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
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Received From</Label>
        <Input placeholder="Name of person/entity" value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} className="h-9 text-sm" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Receipt Number</Label>
          <Input placeholder="Auto-generated" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input type="date" className="h-9 text-sm" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Amount (₹)</Label>
        <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-9 text-sm" />
        {numAmount > 0 && (
          <p className="text-[10px] text-muted-foreground italic mt-1">{numberToWords(numAmount)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Purpose</Label>
        <Textarea placeholder="Payment for..." value={purpose} onChange={e => setPurpose(e.target.value)} className="text-sm resize-none" rows={2} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Payment Mode</Label>
        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
          {["Cash", "Cheque", "UPI", "Bank Transfer"].map(m => (
            <button key={m} onClick={() => setPaymentMode(m)}
              className={`py-2 rounded-xl text-xs font-medium transition-all ${paymentMode === m ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >{m}</button>
          ))}
        </div>
      </div>

      <Button onClick={handleShowPreview} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-semibold gap-2">
        <Eye className="h-4 w-4" /> Show Preview
      </Button>
    </div>
  )
}
