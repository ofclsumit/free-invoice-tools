"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
  Plus, Trash2, Download, Share2, Eye, Save, Send, Copy, Printer, FileText, X
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
import { cn, formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useQuotationStorage } from "@/hooks/use-quotation-storage"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01),
  unit: z.string().optional(),
  rate: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(28).default(18),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
})

const quotationSchema = z.object({
  businessLogo: z.string().optional(),
  businessName: z.string().min(1, "Business name required"),
  businessGstin: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  clientName: z.string().min(1, "Client name required"),
  clientGstin: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  quoteNumber: z.string().min(1),
  quoteDate: z.string().min(1),
  validUntil: z.string().optional(),
  currency: z.string().default("INR"),
  currencySymbol: z.string().default("₹"),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  upiId: z.string().optional(),
  globalDiscountPercent: z.number().min(0).max(100).optional().default(0),
  shippingCharge: z.number().min(0).optional().default(0),
  template: z.enum(["StudioTemplate", "LedgerTemplate", "MinimalMonoTemplate", "VyaparDesiTemplate", "ClassicBooksTemplate"]).default("StudioTemplate"),
  status: z.enum(["Draft", "Sent", "Accepted", "Rejected", "Expired"]).default("Draft"),
})

export type QuotationFormData = z.infer<typeof quotationSchema>

const defaultItem = {
  description: "",
  hsnCode: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  discount: 0,
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

export function QuotationGenerator() {
  const { toast } = useToast()
  const { saveQuotation } = useQuotationStorage()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const today = new Date().toISOString().split("T")[0]
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      businessLogo: "",
      businessName: "",
      quoteNumber: `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      quoteDate: today,
      validUntil,
      currency: "INR",
      currencySymbol: "₹",
      items: [{ ...defaultItem }],
      terms: "This quotation is valid for 15 days from the date of issue.",
      globalDiscountPercent: 0,
      shippingCharge: 0,
      template: "StudioTemplate",
      status: "Draft",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  const validateEssentialFields = useCallback(() => {
    const values = form.getValues()
    if (!values.businessName?.trim() || !values.clientName?.trim() || !values.quoteNumber?.trim() || !values.quoteDate?.trim() || !values.items?.length) {
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
      invoiceNumber: watchedValues.quoteNumber,
      invoiceDate: watchedValues.quoteDate,
      dueDate: watchedValues.validUntil,
      currencySymbol: watchedValues.currencySymbol || "₹",
      gstMode: "split",
      globalDiscountPercent: Number(watchedValues.globalDiscountPercent) || 0,
      shippingCharge: Number(watchedValues.shippingCharge) || 0,
      company: {
        name: watchedValues.businessName,
        logoUrl: watchedValues.businessLogo,
        addressLines: watchedValues.businessAddress ? watchedValues.businessAddress.split('\n') : [],
        gstin: watchedValues.businessGstin,
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
        await exportNodeToPdf(node, `quotation-${watchedValues.quoteNumber}.pdf`);
        toast({ title: "Quotation PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuotation = () => {
    if (!validateEssentialFields()) return
    saveQuotation({
      id: watchedValues.quoteNumber,
      quoteNumber: watchedValues.quoteNumber,
      date: watchedValues.quoteDate,
      clientName: watchedValues.clientName,
      total: totals.grandTotal,
      status: watchedValues.status as any,
      data: watchedValues
    })
    toast({ title: "Quotation saved locally!" })
  }

  const handleConvertToInvoice = () => {
    toast({ title: "Converting to Invoice..." })
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hello ${watchedValues.clientName},\n\nPlease find your quotation ${watchedValues.quoteNumber} for ${formatCurrency(totals.grandTotal, watchedValues.currencySymbol)} attached.\n\nThis quote is valid until ${watchedValues.validUntil}.\n\nThank you!\n\n${watchedValues.businessName}`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
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
      {isGenerating && <LoadingScreen message="Generating Quotation PDF..." />}
      
      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4 sm:p-6 lg:p-12 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden flex flex-col">
            
            {/* Header / Actions */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Quotation Preview</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveQuotation} className="hidden sm:flex gap-2">
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            {/* Preview Document */}
            <div className="p-4 sm:p-8 bg-gray-100/50 dark:bg-gray-900/50 flex justify-center overflow-x-auto">
              {/* Visible Preview */}
              <div className="shadow-lg rounded-sm overflow-hidden border border-border/50 bg-white min-w-[800px] transform origin-top sm:scale-100 scale-[0.4] sm:mb-0 -mb-[60%]">
                <InvoicePreview hideToolbar={true}>
                  {renderTemplate()}
                </InvoicePreview>
              </div>
              
              {/* Hidden Print Root for actual PDF export */}
              <div className="absolute -left-[9999px] -top-[9999px]">
                <div id="invoice-print-root">
                  <InvoicePreview hideToolbar={true}>
                    {renderTemplate()}
                  </InvoicePreview>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Quotation</h1>
          <p className="text-xs text-muted-foreground">Create a professional quotation for your client</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs hidden sm:flex" onClick={handleSaveQuotation}>
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 font-semibold"
            onClick={togglePreview}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="space-y-6 min-w-0">
          
          {/* Settings Section (New) */}
          <section className="form-section">
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Template</Label>
                <Select
                  defaultValue="StudioTemplate"
                  onValueChange={(v) => form.setValue("template", v as any)}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Currency Symbol</Label>
                <Input {...form.register("currencySymbol")} placeholder="₹" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  defaultValue="Draft"
                  onValueChange={(v) => form.setValue("status", v as any)}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Draft", "Sent", "Accepted", "Rejected", "Expired"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Business Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">B</span>
              Your Business
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group">
                    {watchedValues.businessLogo ? (
                      <>
                        <img src={watchedValues.businessLogo} alt="Logo" className="h-full w-full object-contain p-1" />
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
                    <Input {...form.register("businessName")} placeholder="Your Company" className="h-9 text-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">GSTIN</Label>
                <Input {...form.register("businessGstin")} placeholder="22AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input {...form.register("businessPhone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Address</Label>
                <Textarea {...form.register("businessAddress")} rows={2} className="text-sm resize-none" placeholder="Your business address" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Email</Label>
                <Input {...form.register("businessEmail")} placeholder="hello@business.com" className="h-9 text-sm" />
              </div>
            </div>
          </section>

          {/* Client Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-purple-600 flex items-center justify-center text-white text-xs font-bold">C</span>
              Client Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Client / Company Name *</Label>
                <Input {...form.register("clientName")} placeholder="Client Company Ltd" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Client GSTIN</Label>
                <Input {...form.register("clientGstin")} placeholder="27AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input {...form.register("clientEmail")} placeholder="client@company.com" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input {...form.register("clientPhone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Address</Label>
                <Textarea {...form.register("clientAddress")} rows={2} className="text-sm resize-none" placeholder="Client address" />
              </div>
            </div>
          </section>

          {/* Quote Meta */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-fuchsia-600 flex items-center justify-center text-white text-xs font-bold">Q</span>
              Quotation Details
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quote Number *</Label>
                <Input {...form.register("quoteNumber")} className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quote Date *</Label>
                <Input {...form.register("quoteDate")} type="date" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Valid Until</Label>
                <Input {...form.register("validUntil")} type="date" className="h-9 text-sm" />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-pink-600 flex items-center justify-center text-white text-xs font-bold">{fields.length}</span>
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
                      <Input {...form.register(`items.${index}.description`)} placeholder="Service description" className="h-9 text-xs" />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">HSN/SAC</Label>
                      <Input {...form.register(`items.${index}.hsnCode`)} placeholder="998314" className="h-9 text-xs font-mono" />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">Qty</Label>
                      <Input {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" />
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
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
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
                  <Input {...form.register("globalDiscountPercent", { valueAsNumber: true })} type="number" min="0" max="100" className="h-9 text-sm" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Shipping Charges</Label>
                  <Input {...form.register("shippingCharge", { valueAsNumber: true })} type="number" min="0" className="h-9 text-sm" placeholder="0" />
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
                  <span className="text-violet-600 dark:text-violet-400">{watchedValues.currencySymbol}{fmt(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4">Additional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea {...form.register("notes")} rows={3} className="text-sm resize-none" placeholder="Any additional notes for the client..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Terms & Conditions</Label>
                <Textarea {...form.register("terms")} rows={3} className="text-sm resize-none" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">UPI ID (for payment QR)</Label>
                <Input {...form.register("upiId")} placeholder="yourname@upi" className="h-9 text-sm" />
                <p className="text-xs text-muted-foreground">A QR code will be auto-generated in the PDF</p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pb-8">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 font-semibold" onClick={togglePreview}>
              <Eye className="h-4 w-4" /> Preview
            </Button>

            <Button variant="outline" className="gap-2" onClick={handleConvertToInvoice}>
              <FileText className="h-4 w-4" /> Convert to Invoice
            </Button>

            <Button variant="outline" className="gap-2" onClick={handleWhatsAppShare}>
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </Button>
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" /> Email Quotation
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="ghost" className="gap-2">
              <Copy className="h-4 w-4" /> Duplicate
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
