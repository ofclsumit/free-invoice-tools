"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Download, Eye, X, ZoomIn, ZoomOut, RotateCcw, LayoutTemplate, Printer, Plus, Trash2
} from "lucide-react"
import {
  InvoicePreview,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { ShareButton } from "@/components/shared/share-button"
import {
  VelvetReceipt,
  SageReceipt,
  CarbonReceipt,
  SaffronReceipt,
  TEMPLATES,
  TemplateSelectorDialog,
} from "@/components/cash-receipt-templates"
import type { CashReceiptTemplateId } from "@/components/cash-receipt-templates"

const PHONE_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+60", "+94", "+977", "+880"]
const PAYMENT_MODES = ["Cash", "Cheque", "UPI", "Bank Transfer"]

export function CashReceiptClient() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [businessSignature, setBusinessSignature] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessPhoneCode, setBusinessPhoneCode] = useState("+91")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessGstin, setBusinessGstin] = useState("")
  const [businessPan, setBusinessPan] = useState("")
  const [receivedFrom, setReceivedFrom] = useState("")
  const [payerEmail, setPayerEmail] = useState("")
  const [payerPhoneCode, setPayerPhoneCode] = useState("+91")
  const [payerPhone, setPayerPhone] = useState("")
  const [payerAddress, setPayerAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [purpose, setPurpose] = useState("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [transactionId, setTransactionId] = useState("")
  const [invoiceReference, setInvoiceReference] = useState("")
  const [receiptNo, setReceiptNo] = useState(`CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`)
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0])
  const [template, setTemplate] = useState<CashReceiptTemplateId>("VelvetReceipt")
  const [notes, setNotes] = useState("")

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })
  const numAmount = parseFloat(amount) || 0

  const notesPayload = useMemo(() => {
    const parts: string[] = []
    parts.push(`Payment Method: ${paymentMode}`)
    if (purpose) parts.push(`Purpose: ${purpose}`)
    parts.push(`Received By: ${companyName || "Your Company"}`)
    if (transactionId) parts.push(`Transaction ID: ${transactionId}`)
    if (invoiceReference) parts.push(`Reference: ${invoiceReference}`)
    if (notes) parts.push(notes)
    return parts.join(" | ")
  }, [paymentMode, purpose, companyName, transactionId, invoiceReference, notes])

  const invoiceData: TemplateInvoiceData = useMemo(() => ({
    invoiceNumber: receiptNo,
    invoiceDate: receiptDate,
    documentType: "RECEIPT",
    status: "Paid",
    currencySymbol: "\u20B9",
    gstMode: "none",
    company: {
      name: companyName || "Your Company",
      logoUrl: companyLogo,
      signatureUrl: businessSignature,
      addressLines: businessAddress ? businessAddress.split("\n") : [],
      gstin: businessGstin,
      pan: businessPan,
      email: businessEmail,
      phone: businessPhone ? `${businessPhoneCode} ${businessPhone}` : undefined,
    },
    billTo: {
      name: receivedFrom || "Received From",
      addressLines: payerAddress ? payerAddress.split("\n") : [],
      email: payerEmail,
      phone: payerPhone ? `${payerPhoneCode} ${payerPhone}` : undefined,
    },
    items: [
      {
        id: "1",
        description: purpose || "Payment Received",
        quantity: 1,
        rate: numAmount,
      },
    ],
    notes: notesPayload,
    amountPaid: numAmount,
  }), [receiptNo, receiptDate, companyName, companyLogo, businessSignature, businessEmail, businessPhoneCode, businessPhone, businessAddress, businessGstin, businessPan, receivedFrom, payerEmail, payerPhoneCode, payerPhone, payerAddress, numAmount, purpose, notesPayload])

  const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])

  const renderTemplate = () => {
    switch (template) {
      case "SageReceipt": return <SageReceipt invoice={invoiceData} />
      case "CarbonReceipt": return <CarbonReceipt invoice={invoiceData} />
      case "SaffronReceipt": return <SaffronReceipt invoice={invoiceData} />
      default: return <VelvetReceipt invoice={invoiceData} />
    }
  }

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      document.body.style.touchAction = "none"
      document.documentElement.style.touchAction = "none"
    } else {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""
      document.documentElement.style.touchAction = ""
      setZoom(1)
    }
    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""
      document.documentElement.style.touchAction = ""
    }
  }, [showPreview])

  const validateEssentialFields = useCallback(() => {
    if (!receivedFrom) { toast({ title: "Received From is required", variant: "destructive" }); return false }
    if (!numAmount || numAmount <= 0) { toast({ title: "Valid amount is required", variant: "destructive" }); return false }
    if (!receiptNo) { toast({ title: "Receipt number is required", variant: "destructive" }); return false }
    if (!receiptDate) { toast({ title: "Receipt date is required", variant: "destructive" }); return false }
    return true
  }, [receivedFrom, numAmount, receiptNo, receiptDate, toast])

  const togglePreview = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }, [showPreview, validateEssentialFields])

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root")
      if (node) {
        await exportNodeToPdf(node, `cash-receipt-${receiptNo}.pdf`)
        toast({ title: "Cash receipt PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = async () => {
    if (!validateEssentialFields()) return
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root")
      if (!node) throw new Error("Receipt not found")
      const fileName = `cash-receipt-${receiptNo}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)

      const file = new File([blob], fileName, { type: "application/pdf" })
      const message = `Hello ${receivedFrom},\n\nPlease find your cash receipt ${receiptNo} for ${formatCurrency(totals.grandTotal, "\u20B9")} attached.\n\nThank you!\n\n${companyName || "Your Company"}`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Cash Receipt ${receiptNo}`,
          text: message,
          files: [file],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
        window.open(`https://wa.me/?text=${encodeURIComponent(message + "\n\n(Note: Please attach the downloaded PDF manually)")}`, "_blank")
      }
    } catch {
      toast({ title: "Failed to share via WhatsApp", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEmailReceipt = async () => {
    if (!validateEssentialFields()) return
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root")
      if (!node) throw new Error("Receipt not found")
      const fileName = `cash-receipt-${receiptNo}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)

      const file = new File([blob], fileName, { type: "application/pdf" })
      const subject = `Cash Receipt ${receiptNo} from ${companyName || "Your Company"}`
      const body = `Dear ${receivedFrom},\n\nPlease find attached the cash receipt ${receiptNo} for ${formatCurrency(totals.grandTotal, "\u20B9")}.\n\nBest regards,\n${companyName || "Your Company"}`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: subject,
          text: body,
          files: [file],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
        window.open(`mailto:${payerEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + "\n\n(Note: Please attach the downloaded PDF manually)")}`, "_blank")
      }
    } catch {
      toast({ title: "Failed to share receipt", variant: "destructive" })
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

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setBusinessSignature(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setCompanyName(""); setCompanyLogo(""); setBusinessSignature(""); setBusinessEmail(""); setBusinessPhoneCode("+91"); setBusinessPhone(""); setBusinessAddress(""); setBusinessGstin(""); setBusinessPan(""); setReceivedFrom(""); setPayerEmail(""); setPayerPhoneCode("+91"); setPayerPhone(""); setPayerAddress(""); setAmount(""); setPurpose(""); setPaymentMode("Cash"); setTransactionId(""); setInvoiceReference(""); setReceiptNo(`CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`); setReceiptDate(new Date().toISOString().split("T")[0]); setTemplate("VelvetReceipt"); setNotes("")
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}

      {/* Hidden print root */}
      <div id="invoice-print-root" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <InvoicePreview hideToolbar={true}>
          {renderTemplate()}
        </InvoicePreview>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300" style={{ overscrollBehavior: "contain" }}>
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">

            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Cash Receipt Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 ml-4 border border-border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            <div
              ref={previewContainerRef}
              className="flex-1 overflow-y-auto p-0 sm:p-2 md:p-4 flex flex-col items-center"
              style={{ cursor: "grab", overscrollBehavior: "contain" }}
            >
              <div
                className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  margin: "0 auto",
                }}
              >
                <InvoicePreview hideToolbar={true}>
                  {renderTemplate()}
                </InvoicePreview>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Dialog */}
      {showTemplateDialog && (
        <TemplateSelectorDialog
          selected={template}
          onSelect={(id) => setTemplate(id)}
          onClose={() => setShowTemplateDialog(false)}
        />
      )}

      {/* Main Form */}
      <div className="space-y-6">

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pb-2">
          <Button className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 font-semibold" onClick={togglePreview}>
            <Eye className="h-4 w-4" /> SHOW PREVIEW
          </Button>
          <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
            <img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" />
          </button>
          <button onClick={handleEmailReceipt} title="Email Receipt" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
            <img src="/email.svg" alt="Email" className="h-5 w-5" />
          </button>
          <ShareButton invoiceData={invoiceData} template={template} title={`Cash Receipt ${receiptNo}`} />
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Template Selector */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-500" />
            Template
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Current: <span className="font-semibold text-foreground">{TEMPLATES.find(t => t.id === template)?.name}</span>
            </span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTemplateDialog(true)}>
              <LayoutTemplate className="h-4 w-4" /> Change Template
            </Button>
          </div>
        </section>

        {/* From (Your Business) */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-500" />
            From (Your Business)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Name (Required)</Label>
              <Input placeholder="Your company name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Logo (Optional)</Label>
              <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                {companyLogo ? (
                  <>
                    <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={(e) => { e.preventDefault(); setCompanyLogo("") }}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                    <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground font-medium">Upload Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email (Optional)</Label>
              <Input type="email" placeholder="billing@company.com" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone (Optional)</Label>
              <div className="flex gap-2">
                <Select value={businessPhoneCode} onValueChange={setBusinessPhoneCode}>
                  <SelectTrigger className="h-9 w-20 text-xs text-foreground bg-background">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_CODES.map(code => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="9999999999"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-9 text-sm flex-1 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address (Optional)</Label>
            <Textarea placeholder="Street, Building, City, State, Pincode" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="min-h-16 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">GSTIN (Optional)</Label>
              <Input placeholder="22AAAAA0000A1Z5" value={businessGstin} onChange={e => setBusinessGstin(e.target.value.toUpperCase())} className="h-9 text-sm uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">PAN (Optional)</Label>
              <Input placeholder="ABCDE1234F" value={businessPan} onChange={e => setBusinessPan(e.target.value.toUpperCase())} className="h-9 text-sm uppercase" />
            </div>
          </div>
        </section>

        {/* Received From */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-orange-500" />
            Received From (Payer)
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payer Name (Required)</Label>
            <Input placeholder="Name of person or entity" value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email (Optional)</Label>
              <Input type="email" placeholder="payer@email.com" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone (Optional)</Label>
              <div className="flex gap-2">
                <Select value={payerPhoneCode} onValueChange={setPayerPhoneCode}>
                  <SelectTrigger className="h-9 w-20 text-xs text-foreground bg-background">
                    <SelectValue placeholder="+91" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_CODES.map(code => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="9999988888"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-9 text-sm flex-1 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address (Optional)</Label>
            <Textarea placeholder="Full address of payer" value={payerAddress} onChange={e => setPayerAddress(e.target.value)} className="min-h-16 text-sm" />
          </div>
        </section>

        {/* Receipt Details */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-emerald-500" />
            Receipt Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Receipt Number (Required)</Label>
              <Input placeholder="CR-2026-0001" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date (Required)</Label>
              <Input type="date" className="h-9 text-sm" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-blue-500" />
            Payment Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount (\u20B9) (Required)</Label>
              <Input type="number" step="any" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Payment Mode</Label>
              <div className="flex gap-2">
                {PAYMENT_MODES.map(m => (
                  <button key={m} type="button" onClick={() => setPaymentMode(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${paymentMode === m ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
                  >{m}</button>
                ))}
              </div>
            </div>
          </div>

          {paymentMode !== "Cash" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Transaction ID (Optional)</Label>
              <Input placeholder="TXN123456789" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="h-9 text-sm" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Invoice / Order Reference (Optional)</Label>
            <Input placeholder="INV-001 or Order #123" value={invoiceReference} onChange={e => setInvoiceReference(e.target.value)} className="h-9 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Purpose</Label>
            <Textarea placeholder="Payment for..." value={purpose} onChange={e => setPurpose(e.target.value)} className="text-sm resize-none" rows={2} />
          </div>

          {numAmount > 0 && (
            <p className="text-[10px] text-muted-foreground italic">
              Amount in words: {numAmount.toLocaleString("en-IN")} Rupees
            </p>
          )}
        </section>

        {/* Notes / Signature */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notes (Optional)</Label>
              <Textarea placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px] text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Authorized Signature (Optional)</Label>
              <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                {businessSignature ? (
                  <>
                    <img src={businessSignature} alt="Signature" className="max-h-full max-w-full object-contain p-2" />
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={(e) => { e.preventDefault(); setBusinessSignature("") }}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                    <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground font-medium">Upload Signature</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-wrap gap-3 pb-6">
          <Button type="button" onClick={togglePreview} className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 font-semibold flex-1">
            <Eye className="h-4 w-4" /> SHOW PREVIEW
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={resetForm}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </>
  )
}
