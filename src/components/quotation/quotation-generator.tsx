






























"use client"

import { useState, useCallback } from "react"
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
import { QuotationPreview } from "./quotation-preview"
import { generateQuotationPDF } from "@/lib/pdf/generate-quotation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
  const [showPreview, setShowPreview] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

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

  const calculateTotals = useCallback(() => {
    const items = watchedValues.items || []
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    const itemsWithTotals = items.map((item) => {
      const qty = Number(item.quantity) || 0
      const rate = Number(item.rate) || 0
      const discount = Number(item.discount) || 0
      const taxRate = Number(item.taxRate) || 0
      const baseAmount = qty * rate
      const discountAmount = (baseAmount * discount) / 100
      const taxableAmount = baseAmount - discountAmount
      const taxAmount = (taxableAmount * taxRate) / 100
      const total = taxableAmount + taxAmount

      subtotal += taxableAmount
      totalTax += taxAmount
      totalDiscount += discountAmount
      return { ...item, baseAmount, discountAmount, taxableAmount, taxAmount, total }
    })

    return { subtotal, totalTax, grandTotal: subtotal + totalTax, totalDiscount, itemsWithTotals }
  }, [watchedValues.items])

  const totals = calculateTotals()

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      await generateQuotationPDF({ ...watchedValues, ...totals })
      toast({ title: "Quotation PDF downloaded!" })
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Quotation</h1>
          <p className="text-xs text-muted-foreground">Create a professional quotation for your client</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs hidden sm:flex">
            <Save className="h-3.5 w-3.5" /> Save Draft
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

      <div className={cn("grid gap-6", showPreview ? "xl:grid-cols-[1fr_420px]" : "")}>
        <div className="space-y-6 min-w-0">
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

        {/* Live Preview */}
        {showPreview && (
          <div className="hidden xl:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">Auto-updating</Badge>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-160px)] rounded-xl shadow-lg border border-border">
                <div className="transform scale-[0.65] origin-top-left w-[154%]">
                  <QuotationPreview data={watchedValues} totals={totals} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
