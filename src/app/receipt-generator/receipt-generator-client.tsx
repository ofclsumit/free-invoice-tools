"use client"
import React, { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  MinimalMonoTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"

export function ReceiptGeneratorClient() {
  const [payer, setPayer] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [mode, setMode] = useState("Cash")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [receiptNo, setReceiptNo] = useState("")
  const [receiptDate, setReceiptDate] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })
  const numAmount = parseFloat(amount) || 0

  const { invoiceData } = React.useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: receiptNo || String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
      invoiceDate: receiptDate || new Date().toLocaleDateString("en-IN"),
      status: "Paid",
      currencySymbol: "₹",
      gstMode: "none",
      company: {
        name: companyName || "Your Company Name",
        logoUrl: companyLogo,
        addressLines: [],
      },
      billTo: {
        name: payer || "Payer Name",
        addressLines: [],
      },
      items: [
        {
          id: "1",
          description: `Payment Mode: ${mode}${purpose ? `\nPurpose: ${purpose}` : ""}`,
          quantity: 1,
          rate: numAmount,
        }
      ],
      amountPaid: numAmount,
    };

    return { totals: computeInvoiceTotals(templateData), invoiceData: templateData };
  }, [payer, numAmount, mode, purpose, receiptNo, receiptDate, companyName, companyLogo]);

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `receipt-${receiptNo || "draft"}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

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

  const handleShowPreview = () => {
    if (!receiptNo) {
      setReceiptNo(String(Math.floor(Math.random() * 10000)).padStart(4, "0"))
      setReceiptDate(new Date().toLocaleDateString("en-IN"))
    }
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
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Received From</Label>
        <Input placeholder="Payer name" value={payer} onChange={e => setPayer(e.target.value)} className="h-9 text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Amount (₹)</Label>
        <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-9 text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Purpose</Label>
        <Textarea placeholder="Payment for..." value={purpose} onChange={e => setPurpose(e.target.value)} className="text-sm resize-none" rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Payment Mode</Label>
        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
          {["Cash", "Bank Transfer", "UPI", "Cheque"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`py-2 rounded-xl text-xs font-medium transition-all ${mode === m ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >{m}</button>
          ))}
        </div>
      </div>
      
      <Button onClick={handleShowPreview} className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 font-semibold gap-2">
        <Eye className="h-4 w-4" /> Show Preview
      </Button>
    </div>
  )
}
