"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Trash2, Download, Eye, Save, Printer, FileText,
  X, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Info, Paperclip, FileUp, CheckCircle2,
  RotateCcw
} from "lucide-react"
import {
  InvoicePreview,
  StudioTemplate,
  LedgerTemplate,
  MinimalMonoTemplate,
  VyaparDesiTemplate,
  ClassicBooksTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01),
  unit: z.string().optional(),
  rate: z.coerce.number().min(0).optional().default(0),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(28).default(18),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
})

const invoiceSchema = z.object({
  businessLogo: z.string().optional(),
  businessSignature: z.string().optional(),
  watermarkUrl: z.string().optional(),
  businessName: z.string().min(1, "Business name required"),
  businessGstin: z.string().optional(),
  businessPan: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPincode: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  clientName: z.string().min(1, "Client name required"),
  clientGstin: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientPincode: z.string().optional(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  currency: z.string().default("INR"),
  currencySymbol: z.string().default("₹"),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  attachments: z.string().optional(),
  additionalInfo: z.string().optional(),
  upiId: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  globalDiscountPercent: z.coerce.number().min(0).max(100).optional().default(0),
  shippingCharge: z.coerce.number().min(0).optional().default(0),
  template: z.enum(["StudioTemplate", "LedgerTemplate", "MinimalMonoTemplate", "VyaparDesiTemplate", "ClassicBooksTemplate"]).default("StudioTemplate"),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

const defaultItem = {
  description: "",
  hsnCode: "",
  quantity: 1,
  unit: "Nos",
  rate: undefined as unknown as number,
  discount: undefined as unknown as number,
  taxRate: 18,
  gstType: "CGST_SGST" as const,
}

const GST_RATES = [0, 5, 12, 18, 28]

const TEMPLATES = [
  { id: "StudioTemplate", name: "Modern Studio" },
  { id: "LedgerTemplate", name: "Corporate Ledger" },
  { id: "MinimalMonoTemplate", name: "Minimalist" },
  { id: "VyaparDesiTemplate", name: "GST India" },
  { id: "ClassicBooksTemplate", name: "Freelancer Classic" },
]

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States" },
  { code: "EUR", symbol: "€", name: "Euro", country: "European Union" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "UAE" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "Australia" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "Bangladesh" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", country: "Canada" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", country: "Switzerland" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", country: "Sri Lanka" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "Malaysia" },
  { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", country: "Nepal" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", country: "New Zealand" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", country: "Pakistan" },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", country: "Qatar" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Riyal", country: "Saudi Arabia" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "Singapore" },
]

interface SavedInvoice {
  id: string
  invoiceNumber: string
  date: string
  clientName: string
  total: number
  data: any
}

function loadInvoices(): SavedInvoice[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("qf_invoices")
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveInvoices(invoices: SavedInvoice[]) {
  try {
    localStorage.setItem("qf_invoices", JSON.stringify(invoices))
  } catch {}
}

export function InvoiceGenerator() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showExtras, setShowExtras] = useState(false)
  const [invoices, setInvoices] = useState<SavedInvoice[]>([])
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setInvoices(loadInvoices())
  }, [])

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setZoom(1)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showPreview])

  useEffect(() => {
    const container = previewContainerRef.current
    if (!container || !showPreview) return
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setZoom((prev) => Math.min(Math.max(0.3, prev - e.deltaY * 0.002), 3))
      }
    }
    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [showPreview])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const businessName = params.get("businessName")
    if (businessName) {
      form.setValue("businessName", businessName)
      form.setValue("businessGstin", params.get("businessGstin") || "")
      form.setValue("businessPan", params.get("businessPan") || "")
      form.setValue("businessAddress", params.get("businessAddress") || "")
      form.setValue("businessPhone", params.get("businessPhone") || "")
      form.setValue("businessEmail", params.get("businessEmail") || "")
      form.setValue("clientName", params.get("clientName") || "")
      form.setValue("clientGstin", params.get("clientGstin") || "")
      form.setValue("clientAddress", params.get("clientAddress") || "")
      form.setValue("clientPhone", params.get("clientPhone") || "")
      form.setValue("clientEmail", params.get("clientEmail") || "")
      form.setValue("currencySymbol", params.get("currencySymbol") || "₹")
      const tmpl = params.get("template") as any
      if (tmpl && TEMPLATES.find(t => t.id === tmpl)) {
        form.setValue("template", tmpl)
      }
    }
  }, [])

  const today = new Date().toISOString().split("T")[0]
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      businessLogo: "",
      businessSignature: "",
      businessName: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      invoiceDate: today,
      dueDate: defaultDueDate,
      currency: "INR",
      currencySymbol: "₹",
      items: [{ ...defaultItem }],
      terms: "Payment is due within 30 days of invoice date.",
      globalDiscountPercent: undefined,
      shippingCharge: undefined,
      template: "StudioTemplate",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  const validateEssentialFields = useCallback(() => {
    const values = form.getValues()
    if (!values.businessName?.trim() || !values.clientName?.trim() || !values.invoiceNumber?.trim() || !values.invoiceDate?.trim() || !values.items?.length) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return false
    }
    return true
  }, [form, toast])

  const togglePreview = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }, [showPreview, validateEssentialFields])

  const { totals, invoiceData } = useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: watchedValues.invoiceNumber,
      invoiceDate: watchedValues.invoiceDate,
      dueDate: watchedValues.dueDate,
      documentType: "INVOICE",
      currencySymbol: watchedValues.currencySymbol || "₹",
      gstMode: "split",
      globalDiscountPercent: Number(watchedValues.globalDiscountPercent) || 0,
      shippingCharge: Number(watchedValues.shippingCharge) || 0,
      watermarkUrl: watchedValues.watermarkUrl,
      company: {
        name: watchedValues.businessName,
        logoUrl: watchedValues.businessLogo,
        signatureUrl: watchedValues.businessSignature,
        addressLines: watchedValues.businessAddress ? watchedValues.businessAddress.split('\n') : [],
        gstin: watchedValues.businessGstin,
        pan: watchedValues.businessPan,
        phone: watchedValues.businessPhone,
        email: watchedValues.businessEmail,
      },
      billTo: {
        name: watchedValues.clientName,
        addressLines: watchedValues.clientAddress ? watchedValues.clientAddress.split('\n') : [],
        gstin: watchedValues.clientGstin,
        phone: watchedValues.clientPhone,
        email: watchedValues.clientEmail,
      },
      items: (watchedValues.items || []).map((item, i) => {
        const gstRate = Number(item.taxRate) || 0;
        return {
          id: String(i),
          description: item.description,
          hsnSac: item.hsnCode,
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "Nos",
          rate: Number(item.rate) || 0,
          cgstPercent: item.gstType === "CGST_SGST" ? gstRate / 2 : 0,
          sgstPercent: item.gstType === "CGST_SGST" ? gstRate / 2 : 0,
          igstPercent: item.gstType === "IGST" ? gstRate : 0,
          discountPercent: Number(item.discount) || 0,
        };
      }),
      notes: watchedValues.notes,
      termsAndConditions: watchedValues.terms,
      bankDetails: {
        accountName: watchedValues.bankAccountName,
        accountNumber: watchedValues.bankAccountNumber,
        ifsc: watchedValues.bankIfsc,
        bankName: watchedValues.bankName,
        branch: watchedValues.bankBranch,
        upiId: watchedValues.upiId,
      }
    };

    const computedTotals = computeInvoiceTotals(templateData);
    const uiTotals = {
      subtotal: computedTotals.subTotal,
      totalDiscount: computedTotals.totalDiscount,
      totalCgst: computedTotals.totalCgst,
      totalSgst: computedTotals.totalSgst,
      totalIgst: computedTotals.totalIgst,
      totalTax: computedTotals.totalGst,
      shippingCharge: computedTotals.shippingCharge,
      grandTotal: computedTotals.grandTotal,
      itemsWithTotals: computedTotals.items.map(item => ({
        description: item.description,
        hsnCode: item.hsnSac,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        discount: item.discountPercent,
        taxRate: item.cgstPercent! + item.sgstPercent! + item.igstPercent!,
        gstType: item.igstPercent! > 0 ? "IGST" : "CGST_SGST",
        baseAmount: item.quantity * item.rate,
        discountAmount: (item.quantity * item.rate) - item.taxableValue,
        taxableAmount: item.taxableValue,
        taxAmount: item.gstAmount,
        total: item.lineTotal,
      }))
    };
    return { totals: uiTotals, invoiceData: templateData };
  }, [watchedValues]);

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `invoice-${watchedValues.invoiceNumber}.pdf`);
        toast({ title: "Invoice PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveInvoice = () => {
    if (!validateEssentialFields()) return
    const saved: SavedInvoice = {
      id: watchedValues.invoiceNumber,
      invoiceNumber: watchedValues.invoiceNumber,
      date: watchedValues.invoiceDate,
      clientName: watchedValues.clientName,
      total: totals.grandTotal,
      data: watchedValues
    }
    const updated = [saved, ...invoices.filter(i => i.id !== saved.id)].slice(0, 50)
    setInvoices(updated)
    saveInvoices(updated)
    toast({
      title: "Invoice saved as draft!",
      description: `"${watchedValues.invoiceNumber}" saved locally. Your data persists even if you close the browser.`,
    })
  }

  const handleRevertLastSaved = () => {
    if (!invoices.length) {
      toast({ title: "No saved invoices found", variant: "destructive" })
      return
    }
    const last = invoices[0]
    if (last.data) {
      form.reset(last.data)
      toast({ title: `Reverted to "${last.invoiceNumber}"` })
    }
  }

  const handleUseCurrency = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      form.setValue("currency", currency.code)
      form.setValue("currencySymbol", currency.symbol)
    }
  }

  const handleEmailInvoice = () => {
    if (!validateEssentialFields()) return
    const subject = encodeURIComponent(`Invoice ${watchedValues.invoiceNumber} from ${watchedValues.businessName}`)
    const body = encodeURIComponent(
      `Dear ${watchedValues.clientName},\n\n` +
      `Please find attached the invoice ${watchedValues.invoiceNumber} for ${formatCurrency(totals.grandTotal, watchedValues.currencySymbol)}.\n\n` +
      `Payment is due by ${watchedValues.dueDate || "the specified date"}.\n\n` +
      `You can download the PDF by clicking Preview & Download on our platform.\n\n` +
      `Best regards,\n${watchedValues.businessName}`
    )
    window.open(`mailto:${watchedValues.clientEmail || ""}?subject=${subject}&body=${body}`, "_blank")
    toast({ title: "Email client opened with invoice details" })
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hello ${watchedValues.clientName},\n\nPlease find your invoice ${watchedValues.invoiceNumber} for ${formatCurrency(totals.grandTotal, watchedValues.currencySymbol)} attached.\n\nPayment due by ${watchedValues.dueDate}.\n\nThank you!\n\n${watchedValues.businessName}`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handlePrint = () => {
    window.print()
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const renderTemplate = () => {
    switch (watchedValues.template) {
      case "LedgerTemplate": return <LedgerTemplate invoice={invoiceData} />
      case "MinimalMonoTemplate": return <MinimalMonoTemplate invoice={invoiceData} />
      case "VyaparDesiTemplate": return <VyaparDesiTemplate invoice={invoiceData} />
      case "ClassicBooksTemplate": return <ClassicBooksTemplate invoice={invoiceData} />
      default: return <StudioTemplate invoice={invoiceData} />
    }
  }

  if (!mounted) return null;

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Invoice PDF..." />}

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">

            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Invoice Preview</h2>
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
                <Button variant="outline" size="sm" onClick={handleSaveInvoice} className="hidden sm:flex gap-2">
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-0 sm:p-2 md:p-4 flex flex-col items-center"
              style={{ cursor: "grab" }}
            >
              <div
                className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  margin: "0 auto"
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

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Invoice</h1>
            <p className="text-xs text-muted-foreground">Create a professional invoice for your client</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs hidden sm:flex" onClick={handleRevertLastSaved} title="Revert to last saved">
              <RotateCcw className="h-3.5 w-3.5" /> Revert
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs hidden sm:flex" onClick={handleSaveInvoice}>
              <Save className="h-3.5 w-3.5" /> Save Draft
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6 min-w-0">

            {/* Settings Section */}
            <section className="form-section">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Template</Label>
                  <Select
                    defaultValue="StudioTemplate"
                    onValueChange={(v) => form.setValue("template", v as any)}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select template" /></SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Currency</Label>
                  <Select
                    defaultValue="INR"
                    onValueChange={handleUseCurrency}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{c.symbol}</span>
                            <span>{c.code}</span>
                            <span className="text-muted-foreground">- {c.country}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Business Details */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">B</span>
                Your Business
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0 border-2 border-dashed border-border bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group" style={{ minWidth: "80px", minHeight: "80px", maxWidth: "200px", maxHeight: "200px" }}>
                      {watchedValues.businessLogo ? (
                        <>
                          <img src={watchedValues.businessLogo} alt="Logo" className="max-h-[150px] max-w-full object-contain p-1" />
                          <div
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              form.setValue("businessLogo", "");
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                          <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground font-medium">Add Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  form.setValue("businessLogo", reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <Label className="text-xs font-medium">Business Name *</Label>
                      <Input {...form.register("businessName")} placeholder="e.g. Acme Traders Pvt Ltd" className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">GSTIN (optional)</Label>
                  <Input {...form.register("businessGstin")} placeholder="e.g. 22AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">PAN (optional)</Label>
                  <Input {...form.register("businessPan")} placeholder="e.g. AAAAA0000A" className="h-9 text-sm font-mono uppercase" onChange={(e) => form.setValue("businessPan", e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input {...form.register("businessPhone")} type="tel" inputMode="numeric" placeholder="e.g. 9876543210" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Address</Label>
                  <Textarea {...form.register("businessAddress")} rows={2} className="text-sm resize-none" placeholder="e.g. 42, MG Road, Fort" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Pincode</Label>
                  <Input {...form.register("businessPincode")} inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 400001" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input {...form.register("businessEmail")} placeholder="e.g. hello@acmetraders.com" className="h-9 text-sm" />
                </div>
              </div>
            </section>

            {/* Client Details */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">C</span>
                Client Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Client / Company Name *</Label>
                  <Input {...form.register("clientName")} placeholder="e.g. XYZ Corporation Ltd" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Client GSTIN (optional)</Label>
                  <Input {...form.register("clientGstin")} placeholder="e.g. 27AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input {...form.register("clientEmail")} placeholder="e.g. billing@xyzcorp.com" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input {...form.register("clientPhone")} type="tel" inputMode="numeric" placeholder="e.g. 9876543210" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Address</Label>
                  <Textarea {...form.register("clientAddress")} rows={2} className="text-sm resize-none" placeholder="e.g. 15, BKC, Bandra East" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Pincode</Label>
                  <Input {...form.register("clientPincode")} inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 400051" className="h-9 text-sm" />
                </div>
              </div>
            </section>

            {/* Invoice Meta */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">I</span>
                Invoice Details
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Invoice Number *</Label>
                  <Input {...form.register("invoiceNumber")} placeholder="e.g. INV-2024-0001" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Invoice Date *</Label>
                  <Input {...form.register("invoiceDate")} type="date" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Due Date</Label>
                  <Input {...form.register("dueDate")} type="date" className="h-9 text-sm" />
                </div>
              </div>
            </section>

            {/* Line Items */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-orange-600 flex items-center justify-center text-white text-xs font-bold">{fields.length}</span>
                Items / Services
              </h2>

              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_70px_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Description</span>
                  <span>HSN/SAC</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span>Disc %</span>
                  <span>GST %</span>
                  <span>Amount</span>
                  <span></span>
                </div>

                {fields.map((field, index) => {
                  const item = totals.itemsWithTotals[index]
                  return (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_90px_80px_70px_80px_32px] gap-2 items-start p-3 sm:p-0 rounded-xl sm:rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-gray-800/20">
                      <div className="space-y-1">
                        <Label className="sm:hidden text-xs text-muted-foreground">Description</Label>
                        <Input {...form.register(`items.${index}.description`)} placeholder="e.g. Website Design Service" className="h-9 text-xs" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">HSN/SAC</Label>
                        <Input {...form.register(`items.${index}.hsnCode`)} placeholder="e.g. 998314" className="h-9 text-xs font-mono" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">Qty</Label>
                        <Input {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" placeholder="1" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">Rate</Label>
                        <Input {...form.register(`items.${index}.rate`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" placeholder="0.00" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">Discount %</Label>
                        <Input {...form.register(`items.${index}.discount`, { valueAsNumber: true })} type="number" min="0" max="100" className="h-9 text-xs" placeholder="0" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">GST %</Label>
                        <Select
                          defaultValue="18"
                          onValueChange={(v) => form.setValue(`items.${index}.taxRate`, Number(v))}
                        >
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="GST" /></SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map(r => (
                              <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-semibold">{watchedValues.currencySymbol}{fmt(item?.total || 0)}</span>
                      </div>
                      <button type="button" onClick={() => remove(index)} disabled={fields.length === 1}
                        className="h-9 w-8 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}

                <Button type="button" variant="outline" size="sm" className="gap-2 text-xs h-8 border-dashed"
                  onClick={() => append({ ...defaultItem })}>
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </Button>
              </div>

              {/* Additional Charges & Totals */}
              <div className="mt-6 pt-4 border-t border-dashed border-border flex flex-col md:flex-row justify-between gap-6">
                <div className="max-w-xs space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Overall Discount (%)</Label>
                    <Input {...form.register("globalDiscountPercent", { valueAsNumber: true })} type="number" min="0" max="100" className="h-9 text-sm" placeholder="e.g. 5" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Processing Charge</Label>
                    <Input {...form.register("shippingCharge", { valueAsNumber: true })} type="number" min="0" className="h-9 text-sm" placeholder="e.g. 500" />
                  </div>
                </div>

                <div className="md:ml-auto w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{watchedValues.currencySymbol}{fmt(totals.subtotal)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600">-{watchedValues.currencySymbol}{fmt(totals.totalDiscount)}</span>
                    </div>
                  )}
                  {totals.totalCgst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST</span>
                      <span>{watchedValues.currencySymbol}{fmt(totals.totalCgst)}</span>
                    </div>
                  )}
                  {totals.totalSgst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST</span>
                      <span>{watchedValues.currencySymbol}{fmt(totals.totalSgst)}</span>
                    </div>
                  )}
                  {totals.totalIgst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IGST</span>
                      <span>{watchedValues.currencySymbol}{fmt(totals.totalIgst)}</span>
                    </div>
                  )}
                  {totals.shippingCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{watchedValues.currencySymbol}{fmt(totals.shippingCharge)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-display font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">{watchedValues.currencySymbol}{fmt(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Optional Extras */}
            <section className="form-section">
              <button
                type="button"
                onClick={() => setShowExtras(!showExtras)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="font-display font-semibold text-sm flex items-center gap-2">
                  <span className="h-5 w-5 rounded-md bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    <Plus className="h-3 w-3" />
                  </span>
                  Optional Extras
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                    {showExtras ? "Hide" : "Show"}
                  </Badge>
                </h2>
                {showExtras ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {showExtras && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Terms & Conditions
                    </Label>
                    <Textarea {...form.register("terms")} rows={3} className="text-sm resize-none" placeholder="e.g. Payment due within 30 days. Late payment may incur interest at 2% per month." />
                    <p className="text-[11px] text-muted-foreground">These terms will appear at the bottom of the invoice PDF.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      Attachments / References
                    </Label>
                    <Textarea {...form.register("attachments")} rows={2} className="text-sm resize-none" placeholder="e.g. Scope of work document attached, Reference: PO-2024-089" />
                    <p className="text-[11px] text-muted-foreground">List any documents, references, or purchase order numbers.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      Additional Information
                    </Label>
                    <Textarea {...form.register("additionalInfo")} rows={2} className="text-sm resize-none" placeholder="e.g. Delivery timeline: 2 weeks from payment confirmation. Warranty: 1 year." />
                    <p className="text-[11px] text-muted-foreground">Any other details the client should know about this invoice.</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">$</span>
                      Bank Details (for payment)
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Account Holder Name</Label>
                        <Input {...form.register("bankAccountName")} placeholder="e.g. John Doe" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Account Number</Label>
                        <Input {...form.register("bankAccountNumber")} placeholder="e.g. 12345678901" className="h-9 text-sm font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">IFSC Code</Label>
                        <Input {...form.register("bankIfsc")} placeholder="e.g. SBIN0001234" className="h-9 text-sm font-mono uppercase" onChange={(e) => form.setValue("bankIfsc", e.target.value.toUpperCase())} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Bank Name</Label>
                        <Input {...form.register("bankName")} placeholder="e.g. State Bank of India" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Branch</Label>
                        <Input {...form.register("bankBranch")} placeholder="e.g. Andheri East" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">UPI ID</Label>
                        <Input {...form.register("upiId")} placeholder="e.g. yourname@upi" className="h-9 text-sm" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">Bank details appear in the PDF for client payment reference.</p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">W</span>
                      Watermark (optional)
                    </p>
                    <div className="relative h-24 w-full max-w-sm shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group">
                      {watchedValues.watermarkUrl ? (
                        <>
                          <img src={watchedValues.watermarkUrl} alt="Watermark" className="h-full w-full object-contain p-2 opacity-50" />
                          <div
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={(e) => { e.preventDefault(); form.setValue("watermarkUrl", "") }}
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                          <FileUp className="h-5 w-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground font-medium">Upload Watermark Image</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">PNG with transparency works best</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  form.setValue("watermarkUrl", reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">A faint watermark will appear across the document background. Best with a transparent PNG logo or text.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Signature */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4">Authorized Signature (optional)</h2>
              <div className="space-y-1.5">
                <div className="relative h-28 w-full max-w-sm shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group">
                  {watchedValues.businessSignature ? (
                    <>
                      <img src={watchedValues.businessSignature} alt="Signature" className="h-full w-full object-contain p-2" />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={(e) => {
                          e.preventDefault();
                          form.setValue("businessSignature", "");
                        }}
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                      <FileUp className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground font-medium">Upload Signature Image</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">PNG or JPG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              form.setValue("businessSignature", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Appears at the bottom of the invoice document.</p>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pb-4">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold" onClick={togglePreview}>
                <Eye className="h-4 w-4" /> Preview & Download
              </Button>
              <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent transition-colors">
                <img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" />
              </button>
              <button onClick={handleEmailInvoice} title="Email Invoice" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent transition-colors">
                <img src="/email.svg" alt="Email" className="h-5 w-5" />
              </button>
              <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>

            {/* Template Showpiece at Bottom */}
            <section className="form-section overflow-hidden">
              <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  <Eye className="h-3 w-3" />
                </span>
                Live Preview — <span className="text-muted-foreground font-normal text-xs">{TEMPLATES.find(t => t.id === watchedValues.template)?.name}</span>
              </h2>
              <div className="relative rounded-xl border border-border/50 bg-white dark:bg-gray-900 overflow-hidden shadow-inner">
                <div className="max-h-[500px] overflow-auto p-2 sm:p-4">
                  <div className="transform origin-top scale-[0.45] sm:scale-[0.6] lg:scale-[0.7] origin-top-left w-[calc(100%_/_0.45)] sm:w-[calc(100%_/_0.6)] lg:w-[calc(100%_/_0.7)]">
                    <InvoicePreview hideToolbar={true}>
                      {renderTemplate()}
                    </InvoicePreview>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                This is how your invoice will look. Data updates in real-time.
              </p>
            </section>

            {/* Save Draft Info */}
            <section className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-display font-semibold">How Save Draft Works</h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Click the <strong>Save Draft</strong> button anytime — your invoice is saved to your browser&apos;s local storage instantly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Saved drafts <strong>persist even if you close the browser</strong> or tab. They won&apos;t be lost on refresh.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Drafts are stored <strong>locally on your device only</strong>. No data is sent to any server.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>To view your saved invoices, return to the dashboard. You can edit, download, or delete them anytime.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Tip: Save before previewing to avoid losing changes if you accidentally close the tab.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  )
}
