"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Plus, Trash2, Download, Eye, X, ZoomIn, ZoomOut, Save, RotateCcw
} from "lucide-react"
import {
  InvoicePreview,
  MinimalMonoTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { ShareButton } from "@/components/shared/share-button"

const CURRENCIES = [
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee" },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee" },
  { code: "BDT", symbol: "\u09F3", name: "Bangladeshi Taka" },
]

const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cash", "Cheque", "Credit Card", "Debit Card", "PayPal", "Other"]

const PHONE_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+60", "+94", "+977", "+880"]

const itemSchema = z.object({
  description: z.string().min(1, "Required"),
  hsn: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Min 0.01"),
  unit: z.string().optional(),
  rate: z.coerce.number().min(0, "Min 0"),
  taxRate: z.coerce.number().min(0).max(28).default(0),
})

const receiptSchema = z.object({
  businessLogo: z.string().optional(),
  businessSignature: z.string().optional(),
  businessName: z.string().min(1, "Business name required"),
  businessPhoneCode: z.string().default("+91"),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessAddress: z.string().optional(),
  businessGstin: z.string().optional(),
  businessPan: z.string().optional(),
  payerName: z.string().min(1, "Payer name required"),
  payerPhoneCode: z.string().default("+91"),
  payerPhone: z.string().optional(),
  payerEmail: z.string().email().optional().or(z.literal("")),
  payerAddress: z.string().optional(),
  receiptNumber: z.string().min(1, "Receipt number required"),
  receiptDate: z.string().min(1, "Date required"),
  currency: z.string().default("INR"),
  paymentMethod: z.string().default("Bank Transfer"),
  transactionId: z.string().optional(),
  invoiceReference: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item required"),
  gstMode: z.enum(["none", "single"]).default("none"),
  notes: z.string().optional(),
})

type ReceiptFormData = z.infer<typeof receiptSchema>

export function PaymentReceiptClient() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const defaultItem = { description: "", hsn: "", quantity: 1, unit: "Nos", rate: 0, taxRate: 0 }

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      businessLogo: "",
      businessSignature: "",
      businessName: "",
      businessPhoneCode: "+91",
      businessPhone: "",
      businessEmail: "",
      businessAddress: "",
      businessGstin: "",
      businessPan: "",
      payerName: "",
      payerPhoneCode: "+91",
      payerPhone: "",
      payerEmail: "",
      payerAddress: "",
      receiptNumber: `RCPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      receiptDate: new Date().toISOString().split("T")[0],
      currency: "INR",
      paymentMethod: "Bank Transfer",
      transactionId: "",
      invoiceReference: "",
      items: [defaultItem],
      gstMode: "none",
      notes: "",
    },
  })

  const watchedValues = form.watch()
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const currencySymbol = CURRENCIES.find(c => c.code === watchedValues.currency)?.symbol || "\u20B9"

  const totals = useMemo(() => {
    const data: TemplateInvoiceData = {
      invoiceNumber: watchedValues.receiptNumber,
      invoiceDate: watchedValues.receiptDate,
      documentType: "RECEIPT",
      status: "Paid",
      currencySymbol,
      gstMode: watchedValues.gstMode,
      company: {
        name: watchedValues.businessName || "Your Business",
        logoUrl: watchedValues.businessLogo,
        signatureUrl: watchedValues.businessSignature,
        addressLines: watchedValues.businessAddress ? watchedValues.businessAddress.split("\n") : [],
        gstin: watchedValues.businessGstin,
        pan: watchedValues.businessPan,
        email: watchedValues.businessEmail,
        phone: watchedValues.businessPhone ? `${watchedValues.businessPhoneCode} ${watchedValues.businessPhone}` : undefined,
      },
      billTo: {
        name: watchedValues.payerName || "Payer Name",
        addressLines: watchedValues.payerAddress ? watchedValues.payerAddress.split("\n") : [],
        email: watchedValues.payerEmail,
        phone: watchedValues.payerPhone ? `${watchedValues.payerPhoneCode} ${watchedValues.payerPhone}` : undefined,
      },
      items: watchedValues.items.map((item, idx) => ({
        id: String(idx + 1),
        description: item.description,
        hsnSac: item.hsn,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        gstPercent: watchedValues.gstMode === "single" ? item.taxRate : undefined,
      })),
      notes: watchedValues.notes,
      amountPaid: watchedValues.items.reduce((sum, item) => sum + (item.rate * item.quantity), 0),
    }
    return computeInvoiceTotals(data)
  }, [watchedValues, currencySymbol])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => form.setValue("businessLogo", reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => form.setValue("businessSignature", reader.result as string)
      reader.readAsDataURL(file)
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
    const { businessName, payerName, receiptNumber, receiptDate, items } = watchedValues
    if (!businessName) { toast({ title: "Business name is required", variant: "destructive" }); return false }
    if (!payerName) { toast({ title: "Payer name is required", variant: "destructive" }); return false }
    if (!receiptNumber) { toast({ title: "Receipt number is required", variant: "destructive" }); return false }
    if (!receiptDate) { toast({ title: "Receipt date is required", variant: "destructive" }); return false }
    if (!items?.length || items.every(i => !i.description || !i.rate)) {
      toast({ title: "At least one item with description and rate is required", variant: "destructive" })
      return false
    }
    return true
  }, [watchedValues, toast])

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
        await exportNodeToPdf(node, `receipt-${watchedValues.receiptNumber}.pdf`)
        toast({ title: "Receipt PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWhatsAppShare = async () => {
    if (!validateEssentialFields()) return
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root")
      if (!node) throw new Error("Receipt not found")
      const fileName = `receipt-${watchedValues.receiptNumber}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)

      const file = new File([blob], fileName, { type: "application/pdf" })
      const message = `Hello ${watchedValues.payerName},\n\nPlease find your payment receipt ${watchedValues.receiptNumber} for ${formatCurrency(totals.grandTotal, currencySymbol)} attached.\n\nThank you!\n\n${watchedValues.businessName}`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Receipt ${watchedValues.receiptNumber}`,
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
      const fileName = `receipt-${watchedValues.receiptNumber}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)

      const file = new File([blob], fileName, { type: "application/pdf" })
      const subject = `Receipt ${watchedValues.receiptNumber} from ${watchedValues.businessName}`
      const body = `Dear ${watchedValues.payerName},\n\nPlease find attached the receipt ${watchedValues.receiptNumber} for ${formatCurrency(totals.grandTotal, currencySymbol)}.\n\nBest regards,\n${watchedValues.businessName}`

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
        window.open(`mailto:${watchedValues.payerEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + "\n\n(Note: Please attach the downloaded PDF manually)")}`, "_blank")
      }
    } catch {
      toast({ title: "Failed to share receipt", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const invoiceData: TemplateInvoiceData = useMemo(() => ({
    invoiceNumber: watchedValues.receiptNumber,
    invoiceDate: watchedValues.receiptDate,
    documentType: "RECEIPT",
    status: "Paid",
    currencySymbol,
    gstMode: watchedValues.gstMode,
    company: {
      name: watchedValues.businessName || "Your Business",
      logoUrl: watchedValues.businessLogo,
      signatureUrl: watchedValues.businessSignature,
      addressLines: watchedValues.businessAddress ? watchedValues.businessAddress.split("\n") : [],
      gstin: watchedValues.businessGstin,
      pan: watchedValues.businessPan,
      email: watchedValues.businessEmail,
      phone: watchedValues.businessPhone ? `${watchedValues.businessPhoneCode} ${watchedValues.businessPhone}` : undefined,
    },
    billTo: {
      name: watchedValues.payerName || "Payer Name",
      addressLines: watchedValues.payerAddress ? watchedValues.payerAddress.split("\n") : [],
      email: watchedValues.payerEmail,
      phone: watchedValues.payerPhone ? `${watchedValues.payerPhoneCode} ${watchedValues.payerPhone}` : undefined,
    },
    items: watchedValues.items.map((item, idx) => ({
      id: String(idx + 1),
      description: item.description,
      hsnSac: item.hsn,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      gstPercent: watchedValues.gstMode === "single" ? item.taxRate : undefined,
    })),
    notes: watchedValues.notes,
    amountPaid: totals.grandTotal,
  }), [watchedValues, currencySymbol, totals])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}

      {/* Hidden print root */}
      <div id="invoice-print-root" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <InvoicePreview hideToolbar={true}>
          <MinimalMonoTemplate invoice={invoiceData} />
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
                <h2 className="text-lg font-display font-semibold hidden sm:block">Receipt Preview</h2>
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
                <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
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
                  <MinimalMonoTemplate invoice={invoiceData} />
                </InvoicePreview>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-6">

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pb-2">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-semibold" onClick={togglePreview}>
            <Eye className="h-4 w-4" /> SHOW PREVIEW
          </Button>
          <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
            <img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" />
          </button>
          <button onClick={handleEmailReceipt} title="Email Receipt" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
            <img src="/email.svg" alt="Email" className="h-5 w-5" />
          </button>
          <ShareButton invoiceData={invoiceData} template="MinimalMonoTemplate" title={`Receipt ${watchedValues.receiptNumber}`} />
        </div>

        {/* From Section */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-violet-500" />
            From (Your Business)
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Business Name (Required)</Label>
              <Input {...form.register("businessName")} placeholder="Your registered company name" className="h-9 text-sm" />
              {form.formState.errors.businessName && (
                <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.businessName.message}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Business Logo (Optional)</Label>
              <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                {watchedValues.businessLogo ? (
                  <>
                    <img src={watchedValues.businessLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      onClick={(e) => { e.preventDefault(); form.setValue("businessLogo", "") }}
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
              <Input type="email" {...form.register("businessEmail")} placeholder="billing@company.com" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone (Optional)</Label>
              <div className="flex gap-2">
                <Select value={watchedValues.businessPhoneCode || "+91"} onValueChange={(v) => form.setValue("businessPhoneCode", v)}>
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
                  value={watchedValues.businessPhone || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    form.setValue("businessPhone", val)
                  }}
                  className="h-9 text-sm flex-1 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address (Optional)</Label>
            <Textarea {...form.register("businessAddress")} placeholder="Street, Building, City, State, Pincode" className="min-h-16 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">GSTIN (Optional)</Label>
              <Input {...form.register("businessGstin")} placeholder="22AAAAA0000A1Z5" className="h-9 text-sm uppercase" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">PAN (Optional)</Label>
              <Input {...form.register("businessPan")} placeholder="ABCDE1234F" className="h-9 text-sm uppercase" />
            </div>
          </div>
        </section>

        {/* Bill To Section */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-indigo-500" />
            Bill To (Payer)
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payer Name (Required)</Label>
            <Input {...form.register("payerName")} placeholder="Name of person or company" className="h-9 text-sm" />
            {form.formState.errors.payerName && (
              <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.payerName.message}</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email (Optional)</Label>
              <Input type="email" {...form.register("payerEmail")} placeholder="payer@email.com" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone (Optional)</Label>
              <div className="flex gap-2">
                <Select value={watchedValues.payerPhoneCode || "+91"} onValueChange={(v) => form.setValue("payerPhoneCode", v)}>
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
                  value={watchedValues.payerPhone || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "")
                    form.setValue("payerPhone", val)
                  }}
                  className="h-9 text-sm flex-1 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address (Optional)</Label>
            <Textarea {...form.register("payerAddress")} placeholder="Full address of payer" className="min-h-16 text-sm" />
          </div>
        </section>

        {/* Receipt Details */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-emerald-500" />
            Receipt Details
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Receipt Number (Required)</Label>
              <Input {...form.register("receiptNumber")} placeholder="RCPT-2026-0001" className="h-9 text-sm" />
              {form.formState.errors.receiptNumber && (
                <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.receiptNumber.message}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date (Required)</Label>
              <Input type="date" {...form.register("receiptDate")} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Currency</Label>
              <Select value={watchedValues.currency || "INR"} onValueChange={(v) => form.setValue("currency", v)}>
                <SelectTrigger className="h-9 text-xs text-foreground bg-background">
                  <SelectValue placeholder="INR" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-500" />
            Payment Details
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
              {PAYMENT_METHODS.map(m => (
                <button key={m} type="button" onClick={() => form.setValue("paymentMethod", m)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${watchedValues.paymentMethod === m ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
                >{m}</button>
              ))}
            </div>
          </div>
          {watchedValues.paymentMethod !== "Cash" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Transaction ID (Optional)</Label>
              <Input placeholder="TXN123456789" value={watchedValues.transactionId || ""} onChange={(e) => form.setValue("transactionId", e.target.value)} className="h-9 text-sm" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Invoice / Order Reference (Optional)</Label>
            <Input placeholder="INV-001 or Order #123" value={watchedValues.invoiceReference || ""} onChange={(e) => form.setValue("invoiceReference", e.target.value)} className="h-9 text-sm" />
          </div>
        </section>

        {/* Line Items */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-blue-500" />
              Items
            </h3>
            <div className="flex items-center gap-2">
              <Select value={watchedValues.gstMode} onValueChange={(v: "none" | "single") => form.setValue("gstMode", v)}>
                <SelectTrigger className="h-8 text-xs w-28 bg-background">
                  <SelectValue placeholder="Tax Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tax</SelectItem>
                  <SelectItem value="single">With GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 px-2 text-left w-[30%]">Description</th>
                  <th className="py-2 px-2 text-left w-[10%]">HSN</th>
                  <th className="py-2 px-2 text-right w-[10%]">Qty</th>
                  <th className="py-2 px-2 text-left w-[8%]">Unit</th>
                  <th className="py-2 px-2 text-right w-[12%]">Rate ({currencySymbol})</th>
                  {watchedValues.gstMode !== "none" && (
                    <th className="py-2 px-2 text-right w-[8%]">GST %</th>
                  )}
                  <th className="py-2 px-2 text-right w-[12%]">Amount ({currencySymbol})</th>
                  <th className="py-2 px-2 w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const item = watchedValues.items[index]
                  const lineTotal = (item?.rate || 0) * (item?.quantity || 0)
                  return (
                    <tr key={field.id} className="border-b border-border/50">
                      <td className="py-2 px-2 align-top">
                        <Input
                          placeholder="Item description"
                          {...form.register(`items.${index}.description` as const)}
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 align-top">
                        <Input
                          placeholder="HSN"
                          {...form.register(`items.${index}.hsn` as const)}
                          className="h-8 text-xs uppercase"
                        />
                      </td>
                      <td className="py-2 px-2 align-top">
                        <Input
                          type="number"
                          step="any"
                          placeholder="1"
                          {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                          className="h-8 text-xs font-mono text-right"
                        />
                      </td>
                      <td className="py-2 px-2 align-top">
                        <Input
                          placeholder="Nos"
                          {...form.register(`items.${index}.unit` as const)}
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 align-top">
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          {...form.register(`items.${index}.rate` as const, { valueAsNumber: true })}
                          className="h-8 text-xs font-mono text-right"
                        />
                      </td>
                      {watchedValues.gstMode !== "none" && (
                        <td className="py-2 px-2 align-top">
                          <select
                            {...form.register(`items.${index}.taxRate` as const, { valueAsNumber: true })}
                            className="h-8 w-full text-xs rounded-md border border-input bg-transparent px-2 shadow-sm focus-visible:outline-none"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                      )}
                      <td className="py-2 px-2 align-top text-right">
                        <span className="text-xs font-semibold font-mono">{currencySymbol}{lineTotal.toFixed(2)}</span>
                      </td>
                      <td className="py-2 px-2 align-top text-right">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => append({ description: "", hsn: "", quantity: 1, unit: "Nos", rate: 0, taxRate: 0 })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono font-medium">{currencySymbol}{totals.subTotal.toFixed(2)}</span>
            </div>
            {totals.totalGst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total GST</span>
                <span className="font-mono font-medium">{currencySymbol}{totals.totalGst.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold border-t border-border pt-1.5">
              <span>Grand Total</span>
              <span className="font-mono">{currencySymbol}{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Notes (Optional)</h3>
          <Textarea {...form.register("notes")} placeholder="Additional notes or payment details..." className="min-h-[80px] text-sm" />
        </section>

        {/* Signature */}
        <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Authorized Signature (Optional)</h3>
          <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
            {watchedValues.businessSignature ? (
              <>
                <img src={watchedValues.businessSignature} alt="Signature" className="max-h-full max-w-full object-contain p-2" />
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={(e) => { e.preventDefault(); form.setValue("businessSignature", "") }}
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
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-wrap gap-3 pb-6">
          <Button type="button" onClick={togglePreview} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-semibold flex-1">
            <Eye className="h-4 w-4" /> SHOW PREVIEW
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => {
            form.reset()
          }}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </>
  )
}
