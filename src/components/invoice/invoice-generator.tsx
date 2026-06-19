"use client"

import { useState, useCallback, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Download,
  Send,
  Share2,
  Eye,
  EyeOff,
  Save,
  Copy,
  Printer,
} from "lucide-react"
import { InvoicePreview } from "./invoice-preview"
import { generateInvoicePDF } from "@/lib/pdf/generate-invoice"
import type { InvoiceItemTotals, InvoiceData } from "@/lib/pdf/types"
import { cn, formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  unit: z.string().optional(),
  rate: z.number().min(0, "Rate must be non-negative"),
  discount: z.number().min(0).max(100).optional().default(0),
  gstRate: z.number().min(0).max(28).default(18),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
})

const invoiceSchema = z.object({
  businessName: z.string().min(1, "Business name required"),
  businessGstin: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  clientName: z.string().min(1, "Client name required"),
  clientGstin: z.string().optional(),
  clientAddress: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number required"),
  invoiceDate: z.string().min(1, "Invoice date required"),
  dueDate: z.string().optional(),
  currency: z.string().default("INR"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  upiId: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

const defaultItem = {
  description: "",
  hsnCode: "",
  quantity: 1,
  unit: "Nos" as const,
  rate: 0,
  discount: 0,
  gstRate: 18,
  gstType: "CGST_SGST" as const,
}

const GST_RATES = [0, 5, 12, 18, 28]

export function InvoiceGenerator() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      businessName: "",
      businessGstin: "",
      businessAddress: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      invoiceDate: today,
      dueDate: defaultDueDate,
      currency: "INR",
      items: [{ ...defaultItem }],
      terms: "Payment is due within 30 days of invoice date.",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedValues = form.watch()

  const { totals, invoiceData } = useMemo(() => {
    const items = watchedValues.items || []
    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0
    let totalDiscount = 0

    const itemsWithTotals: InvoiceItemTotals[] = items.map((item) => {
      const qty = Number(item.quantity) || 0
      const rate = Number(item.rate) || 0
      const discount = Number(item.discount) || 0
      const gstRate = Number(item.gstRate) || 0

      const baseAmount = qty * rate
      const discountAmount = (baseAmount * discount) / 100
      const taxableAmount = baseAmount - discountAmount

      let cgst = 0, sgst = 0, igst = 0, taxAmount = 0

      if (item.gstType === "CGST_SGST") {
        cgst = (taxableAmount * gstRate) / 200
        sgst = cgst
        taxAmount = cgst + sgst
      } else if (item.gstType === "IGST") {
        igst = (taxableAmount * gstRate) / 100
        taxAmount = igst
      }

      const total = taxableAmount + taxAmount

      subtotal += taxableAmount
      totalCgst += cgst
      totalSgst += sgst
      totalIgst += igst
      totalDiscount += discountAmount

      return {
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: qty,
        unit: item.unit,
        rate,
        discount,
        gstRate,
        gstType: item.gstType,
        taxableAmount,
        cgst,
        sgst,
        igst,
        taxAmount,
        total,
        discountAmount,
      }
    })

    const totalTax = totalCgst + totalSgst + totalIgst
    const grandTotal = subtotal + totalTax

    const totals = { subtotal, totalCgst, totalSgst, totalIgst, totalTax, grandTotal, totalDiscount, itemsWithTotals }

    const invoiceData: InvoiceData = {
      ...watchedValues,
      ...totals,
      itemsWithTotals,
    }

    return { totals, invoiceData }
  }, [watchedValues])

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      await generateInvoicePDF(invoiceData)
      toast({ title: "PDF downloaded!", description: "Your invoice has been saved." })
    } catch {
      toast({ title: "Error", description: "Could not generate PDF. Please try again.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hello ${watchedValues.clientName},\n\nPlease find your invoice ${watchedValues.invoiceNumber} for ${formatCurrency(totals.grandTotal)} attached.\n\nThank you for your business!\n\n${watchedValues.businessName}`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Invoice</h1>
          <p className="text-xs text-muted-foreground">Fill in the details and download your PDF</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showPreview ? "Hide" : "Show"} Preview</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            <Download className="h-3.5 w-3.5" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-6", showPreview ? "xl:grid-cols-[1fr_520px]" : "")}>
        {/* Form */}
        <div className="space-y-6 min-w-0">
          {/* Business Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">B</span>
              Your Business Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Name *</Label>
                <Input
                  {...form.register("businessName")}
                  placeholder="Acme Design Studio"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">GSTIN</Label>
                <Input
                  {...form.register("businessGstin")}
                  placeholder="22AAAAA0000A1Z5"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Address</Label>
                <Textarea
                  {...form.register("businessAddress")}
                  placeholder="123, Business Park, City, State - 400001"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input {...form.register("businessPhone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input {...form.register("businessEmail")} placeholder="hello@business.com" className="h-9 text-sm" />
              </div>
            </div>
          </section>

          {/* Client Details */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">C</span>
              Bill To (Client)
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Client Name *</Label>
                <Input {...form.register("clientName")} placeholder="Ravi Enterprises" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Client GSTIN</Label>
                <Input {...form.register("clientGstin")} placeholder="27AAAAA0000A1Z5" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-medium">Billing Address</Label>
                <Textarea
                  {...form.register("clientAddress")}
                  placeholder="456, Client Street, Mumbai - 400002"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email</Label>
                <Input {...form.register("clientEmail")} placeholder="client@company.com" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input {...form.register("clientPhone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
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
                <Input {...form.register("invoiceNumber")} className="h-9 text-sm font-mono" />
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
              <span className="h-5 w-5 rounded-md bg-orange-600 flex items-center justify-center text-white text-xs font-bold">
                {fields.length}
              </span>
              Line Items
            </h2>

            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-[1fr_80px_80px_90px_80px_70px_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Description</span>
                <span>HSN/SAC</span>
                <span>Qty</span>
                <span>Rate (₹)</span>
                <span>Disc %</span>
                <span>GST %</span>
                <span>Amount</span>
                <span></span>
              </div>

              {fields.map((field, index) => {
                const item = totals.itemsWithTotals[index]
                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_90px_80px_70px_80px_32px] gap-2 items-start p-3 sm:p-0 rounded-xl sm:rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-gray-800/20"
                  >
                    <div className="space-y-1">
                      <Label className="sm:hidden text-xs text-muted-foreground">Description</Label>
                      <Input
                        {...form.register(`items.${index}.description`)}
                        placeholder="Service or product description"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">HSN/SAC</Label>
                      <Input
                        {...form.register(`items.${index}.hsnCode`)}
                        placeholder="998314"
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">Qty</Label>
                      <Input
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">Rate (₹)</Label>
                      <Input
                        {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">Discount %</Label>
                      <Input
                        {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        max="100"
                        className="h-9 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="sm:hidden text-xs text-muted-foreground">GST %</Label>
                      <Select
                        defaultValue="18"
                        onValueChange={(v) =>
                          form.setValue(`items.${index}.gstRate`, Number(v))
                        }
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GST_RATES.map((r) => (
                            <SelectItem key={r} value={String(r)}>
                              {r}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-semibold">
                        ₹{(item?.total || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-9 w-8 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-8 border-dashed"
                onClick={() => append({ ...defaultItem })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Line Item
              </Button>
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-600">-₹{totals.totalDiscount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {totals.totalCgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span>₹{totals.totalCgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {totals.totalSgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span>₹{totals.totalSgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {totals.totalIgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGST</span>
                    <span>₹{totals.totalIgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Grand Total</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ₹{totals.grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Notes, Terms, UPI */}
          <section className="form-section">
            <h2 className="font-display font-semibold text-sm mb-4">Additional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Notes to Client</Label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="Thank you for your business!"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Terms & Conditions</Label>
                <Textarea
                  {...form.register("terms")}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">UPI ID (for payment QR)</Label>
                <Input
                  {...form.register("upiId")}
                  placeholder="yourname@upi"
                  className="h-9 text-sm"
                />
                <p className="text-xs text-muted-foreground">A QR code will be auto-generated in the PDF</p>
              </div>
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pb-8">
            <Button
              className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold shadow-glow-sm"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleWhatsAppShare}>
              <Share2 className="h-4 w-4" />
              Share on WhatsApp
            </Button>
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Email Invoice
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="ghost" className="gap-2">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="hidden xl:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  Auto-updating
                </Badge>
              </div>
              <div
                className="rounded-xl shadow-lg border border-border overflow-hidden"
                style={{ height: "calc(100vh - 180px)" }}
              >
                <InvoicePreview data={invoiceData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
