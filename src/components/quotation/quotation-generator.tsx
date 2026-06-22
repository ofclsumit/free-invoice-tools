






























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
  Plus, Trash2, Download, Share2, Eye, EyeOff, Save,
} from "lucide-react"
import {
  InvoicePreview,
  StudioTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(0.01),
  unit: z.string().optional(),
  rate: z.number().min(0),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(28).default(18),
})

const quotationSchema = z.object({
  businessName: z.string().min(1, "Business name required"),
  businessGstin: z.string().optional(),
  businessAddress: z.string().optional(),
  clientName: z.string().min(1, "Client name required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  quoteNumber: z.string().min(1),
  quoteDate: z.string().min(1),
  validUntil: z.string().optional(),
  currency: z.string().default("INR"),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

export type QuotationFormData = z.infer<typeof quotationSchema>

const defaultItem = {
  description: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  discount: 0,
  taxRate: 18,
}

export function QuotationGenerator() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const validateEssentialFields = useCallback(() => {
    const values = form?.getValues()
    if (!values) return false
    if (!values.businessName?.trim()) {
      toast({ title: "Business name is required", variant: "destructive" })
      return false
    }
    if (!values.clientName?.trim()) {
      toast({ title: "Client name is required", variant: "destructive" })
      return false
    }
    if (!values.quoteNumber?.trim()) {
      toast({ title: "Quote number is required", variant: "destructive" })
      return false
    }
    if (!values.quoteDate?.trim()) {
      toast({ title: "Quote date is required", variant: "destructive" })
      return false
    }
    if (!values.items?.length) {
      toast({ title: "Add at least one item", variant: "destructive" })
      return false
    }
    for (const item of values.items) {
      if (!item.description?.trim()) {
        toast({ title: "All items need a description", variant: "destructive" })
        return false
      }
      if (!item.quantity || item.quantity <= 0) {
        toast({ title: "All items need a valid quantity", variant: "destructive" })
        return false
      }
      if (item.rate === undefined || item.rate < 0) {
        toast({ title: "All items need a valid rate", variant: "destructive" })
        return false
      }
    }
    return true
  }, [toast])

  const togglePreview = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }, [showPreview, validateEssentialFields])

  const today = new Date().toISOString().split("T")[0]
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      businessName: "",
      quoteNumber: `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      quoteDate: today,
      validUntil,
      currency: "INR",
      items: [{ ...defaultItem }],
      terms: "This quotation is valid for 15 days from the date of issue.",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  const { totals, invoiceData } = useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: watchedValues.quoteNumber,
      invoiceDate: watchedValues.quoteDate,
      dueDate: watchedValues.validUntil,
      currencySymbol: "₹",
      gstMode: "single",
      company: {
        name: watchedValues.businessName,
        addressLines: watchedValues.businessAddress ? watchedValues.businessAddress.split('\n') : [],
        gstin: watchedValues.businessGstin,
      },
      billTo: {
        name: watchedValues.clientName,
        addressLines: watchedValues.clientAddress ? watchedValues.clientAddress.split('\n') : [],
        email: watchedValues.clientEmail,
        phone: watchedValues.clientPhone,
      },
      items: (watchedValues.items || []).map((item, i) => ({
        id: String(i),
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "Nos",
        rate: Number(item.rate) || 0,
        gstPercent: Number(item.taxRate) || 0,
        discountPercent: Number(item.discount) || 0,
      })),
      notes: watchedValues.notes,
      termsAndConditions: watchedValues.terms,
    };

    const computedTotals = computeInvoiceTotals(templateData);

    const uiTotals = {
      subtotal: computedTotals.subTotal,
      totalTax: computedTotals.totalGst,
      grandTotal: computedTotals.grandTotal,
      totalDiscount: computedTotals.totalDiscount,
      itemsWithTotals: computedTotals.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        discount: item.discountPercent,
        taxRate: item.gstPercent,
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
    if (!showPreview) {
      toast({ title: "Preview required", description: "Click 'Show Preview' first before downloading.", variant: "destructive" })
      return
    }
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

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hello ${watchedValues.clientName},\n\nPlease find your quotation ${watchedValues.quoteNumber} for ${totals.grandTotal.toLocaleString("en-IN", { style: "currency", currency: "INR" })} attached.\n\nThis quote is valid until ${watchedValues.validUntil}.\n\nThank you!\n\n${watchedValues.businessName}`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (!mounted) return null;

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Quotation PDF..." />}
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Quotation</h1>
          <p className="text-xs text-muted-foreground">Create a professional quotation for your client</p>
        </div>
        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={togglePreview}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showPreview ? "Hide Preview" : "Show Preview"}</span>
          </Button>

          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 font-semibold"
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
        <div className="flex-1 min-w-0 overflow-y-auto pb-8">
        <div className="max-w-2xl mx-auto space-y-6 min-w-0">
          {/* Business Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">B</span>
              Your Business
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Name *</Label>
                <Input {...form.register("businessName")} placeholder="Your Company" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">GSTIN</Label>
                <Input {...form.register("businessGstin")} placeholder="22AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Address</Label>
                <Textarea {...form.register("businessAddress")} rows={2} className="text-sm resize-none" placeholder="Your business address" />
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
                <Label className="text-xs font-medium">Email</Label>
                <Input {...form.register("clientEmail")} placeholder="client@company.com" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input {...form.register("clientPhone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Address</Label>
                <Input {...form.register("clientAddress")} placeholder="City, State" className="h-9 text-sm" />
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
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_70px_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit</span>
                <span>Rate (₹)</span>
                <span>Disc %</span>
                <span>Tax %</span>
                <span></span>
              </div>

              {fields.map((field, index) => {
                const item = totals.itemsWithTotals[index]
                return (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_90px_70px_80px_32px] gap-2 items-start p-3 sm:p-0 rounded-xl sm:rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-gray-800/20">
                    <Input {...form.register(`items.${index}.description`)} placeholder="Service description" className="h-9 text-xs" />
                    <Input {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" />
                    <Select defaultValue="Nos" onValueChange={(v) => form.setValue(`items.${index}.unit`, v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Nos", "Kg", "L", "m", "m²", "Box", "Pcs", "Hr", "Day", "Month"].map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input {...form.register(`items.${index}.rate`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" placeholder="0.00" />
                    <Input {...form.register(`items.${index}.discount`, { valueAsNumber: true })} type="number" min="0" max="100" className="h-9 text-xs" placeholder="0" />
                    <Select defaultValue="18" onValueChange={(v) => form.setValue(`items.${index}.taxRate`, Number(v))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[0, 5, 12, 18, 28].map(r => (
                          <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center">
                      <span className="text-xs font-semibold">₹{fmt(item?.total || 0)}</span>
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

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{fmt(totals.subtotal)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-600">-₹{fmt(totals.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{fmt(totals.totalTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-violet-600 dark:text-violet-400">₹{fmt(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Notes & Terms */}
          <section className="form-section">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea {...form.register("notes")} rows={3} className="text-sm resize-none" placeholder="Any additional notes for the client..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Terms & Conditions</Label>
                <Textarea {...form.register("terms")} rows={3} className="text-sm resize-none" />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pb-8">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
              <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
            </Button>

            <Button variant="outline" className="gap-2" onClick={handleWhatsAppShare}>
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-full lg:w-1/2 min-w-0 overflow-y-auto pb-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border mt-6 lg:mt-0 lg:pl-6">
          <div className="max-w-2xl mx-auto">
            <div id="invoice-print-root">
              <InvoicePreview hideToolbar={true}>
                <StudioTemplate invoice={invoiceData} />
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
