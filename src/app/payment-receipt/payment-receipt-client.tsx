"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CountryCodeSelect } from "@/components/shared/country-code-select"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Eye, RotateCcw, LayoutTemplate, Plus, Trash2, Save
} from "lucide-react"
import {
  computeInvoiceTotals,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { useToast } from "@/hooks/use-toast"
import {
  TEMPLATES,
  TemplateSelectorDialog,
} from "@/components/cash-receipt-templates"
import type { CashReceiptTemplateId } from "@/components/cash-receipt-templates"
import { savePreviewData } from "@/lib/preview-store"

const PHONE_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+60", "+94", "+977", "+880"]
const PAYMENT_MODES = ["Cash", "Cheque", "UPI", "Bank Transfer"]

export function PaymentReceiptClient() {
  const { toast } = useToast()
  const router = useRouter()
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

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

  const getState = useCallback(() => ({
    companyName, companyLogo, businessSignature, businessEmail, businessPhoneCode, businessPhone, businessAddress, businessGstin, businessPan,
    receivedFrom, payerEmail, payerPhoneCode, payerPhone, payerAddress,
    amount, purpose, paymentMode, transactionId, invoiceReference,
    receiptNo, receiptDate, template, notes,
  }), [companyName, companyLogo, businessSignature, businessEmail, businessPhoneCode, businessPhone, businessAddress, businessGstin, businessPan, receivedFrom, payerEmail, payerPhoneCode, payerPhone, payerAddress, amount, purpose, paymentMode, transactionId, invoiceReference, receiptNo, receiptDate, template, notes])

  const setState = useCallback((d: any) => {
    setCompanyName(d.companyName || ""); setCompanyLogo(d.companyLogo || ""); setBusinessSignature(d.businessSignature || ""); setBusinessEmail(d.businessEmail || ""); setBusinessPhoneCode(d.businessPhoneCode || "+91"); setBusinessPhone(d.businessPhone || ""); setBusinessAddress(d.businessAddress || ""); setBusinessGstin(d.businessGstin || ""); setBusinessPan(d.businessPan || "")
    setReceivedFrom(d.receivedFrom || ""); setPayerEmail(d.payerEmail || ""); setPayerPhoneCode(d.payerPhoneCode || "+91"); setPayerPhone(d.payerPhone || ""); setPayerAddress(d.payerAddress || "")
    setAmount(d.amount || ""); setPurpose(d.purpose || ""); setPaymentMode(d.paymentMode || "Cash"); setTransactionId(d.transactionId || ""); setInvoiceReference(d.invoiceReference || "")
    setReceiptNo(d.receiptNo || `CR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`); setReceiptDate(d.receiptDate || new Date().toISOString().split("T")[0]); setTemplate(d.template || "VelvetReceipt"); setNotes(d.notes || "")
  }, [])

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

  const validateEssentialFields = useCallback(() => {
    if (!receivedFrom) { toast({ title: "Received From is required", variant: "destructive" }); return false }
    if (!numAmount || numAmount <= 0) { toast({ title: "Valid amount is required", variant: "destructive" }); return false }
    if (!receiptNo) { toast({ title: "Receipt number is required", variant: "destructive" }); return false }
    if (!receiptDate) { toast({ title: "Receipt date is required", variant: "destructive" }); return false }
    return true
  }, [receivedFrom, numAmount, receiptNo, receiptDate, toast])

  const handleSave = useCallback(() => {
    if (!validateEssentialFields()) return
    try {
      localStorage.setItem("qf_payment_receipt", JSON.stringify(getState()))
      toast({ title: "Payment receipt saved as draft!", description: "Saved to your browser." })
    } catch {}
  }, [getState, validateEssentialFields, toast])

  const handleRevert = useCallback(() => {
    try {
      const stored = localStorage.getItem("qf_payment_receipt")
      if (!stored) { toast({ title: "No saved payment receipt found", variant: "destructive" }); return }
      setState(JSON.parse(stored))
      toast({ title: "Reverted to saved draft" })
    } catch {}
  }, [setState, toast])

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

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    const id = savePreviewData({
      docType: "payment-receipt",
      templateName: template,
      invoiceData,
      title: "Payment Receipt Preview",
      fileName: `receipt-${receiptNo || "draft"}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, template, invoiceData, receiptNo, router])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div>
      {/* Template Selector Dialog */}
      {showTemplateDialog && (
        <TemplateSelectorDialog
          selected={template}
          onSelect={(id) => setTemplate(id)}
          onClose={() => setShowTemplateDialog(false)}
        />
      )}

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Payment Receipt</h1>
            <p className="text-xs text-muted-foreground">Generate an official payment receipt with amount in words</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={resetForm}>
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">

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
                <CountryCodeSelect value={businessPhoneCode} onChange={setBusinessPhoneCode} />
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
                <CountryCodeSelect value={payerPhoneCode} onChange={setPayerPhoneCode} />
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
          <Button onClick={handleShowPreview} className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 font-semibold flex-1">
            <Eye className="h-4 w-4" /> SHOW PREVIEW
          </Button>
        </div>

          </div>
        </div>
      </div>
    </div>
  )
}
