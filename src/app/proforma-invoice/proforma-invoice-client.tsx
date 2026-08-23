"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountryCodeSelect } from "@/components/shared/country-code-select"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Trash2, Eye, Save, FileText,
  ChevronDown, ChevronUp, Info, Paperclip, FileUp, CheckCircle2,
  RotateCcw, Loader2
} from "lucide-react"
import {
  computeInvoiceTotals,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { SkeletonDocumentForm } from "@/components/shared/loading"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(0.01, "Quantity is required"),
  unit: z.string().optional(),
  rate: z.coerce.number({ invalid_type_error: "Rate is required" }).min(0, "Rate is required"),
})

const proformaSchema = z.object({
  businessLogo: z.string().optional(),
  businessSignature: z.string().optional(),
  watermarkUrl: z.string().optional(),
  businessName: z.string().min(1, "Business name required"),
  businessGstin: z.string().optional(),
  businessPan: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPincode: z.string().optional(),
  businessPhoneCode: z.string().optional().default("+91"),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  clientName: z.string().min(1, "Client name required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhoneCode: z.string().optional().default("+91"),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientPincode: z.string().optional(),
  proformaNumber: z.string().min(1),
  proformaDate: z.string().min(1),
  validUntil: z.string().optional(),
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
})

export type ProformaFormData = z.infer<typeof proformaSchema>

const defaultItem = {
  description: "",
  quantity: 1,
  unit: "Nos",
  rate: "" as unknown as number,
}

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

interface SavedProforma {
  id: string
  proformaNumber: string
  date: string
  clientName: string
  total: number
  data: any
}

function loadProformas(): SavedProforma[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("qf_proformas")
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveProformas(proformas: SavedProforma[]) {
  try {
    localStorage.setItem("qf_proformas", JSON.stringify(proformas))
  } catch {}
}

export function ProformaInvoiceClient() {
  const { toast } = useToast()
  const router = useRouter()
  const [showExtras, setShowExtras] = useState(false)
  const [savedOnce, setSavedOnce] = useState(false)
  const [proformas, setProformas] = useState<SavedProforma[]>([])
  const [mounted, setMounted] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const [logoOriginal, setLogoOriginal] = useState<string>("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [signatureOriginal, setSignatureOriginal] = useState<string>("")
  const [signatureSettings, setSignatureSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [watermarkOriginal, setWatermarkOriginal] = useState<string>("")
  const [watermarkSettings, setWatermarkSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setProformas(loadProformas())
  }, [])



  const today = new Date().toISOString().split("T")[0]
  const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const form = useForm<ProformaFormData>({
    resolver: zodResolver(proformaSchema),
    defaultValues: {
      businessLogo: "",
      businessSignature: "",
      businessName: "",
      businessPhoneCode: "+91",
      clientPhoneCode: "+91",
      proformaNumber: `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      proformaDate: today,
      validUntil,
      currency: "INR",
      currencySymbol: "₹",
      items: [{ ...defaultItem }],
      globalDiscountPercent: undefined,
      shippingCharge: undefined,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  // Single-use restoration ONLY when returning from Preview -> Back
  useEffect(() => {
    const session = consumePreviewSession<ProformaFormData>("proforma-invoice")
    if (session?.formValues) {
      form.reset(session.formValues)
      if (session.extraState) {
        if (session.extraState.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
        if (session.extraState.logoSettings) setLogoSettings(session.extraState.logoSettings)
        if (session.extraState.signatureOriginal) setSignatureOriginal(session.extraState.signatureOriginal)
        if (session.extraState.signatureSettings) setSignatureSettings(session.extraState.signatureSettings)
        if (session.extraState.watermarkOriginal) setWatermarkOriginal(session.extraState.watermarkOriginal)
        if (session.extraState.watermarkSettings) setWatermarkSettings(session.extraState.watermarkSettings)
      }
    }
  }, [form])

  const validateEssentialFields = useCallback(() => {
    const values = form.getValues()
    if (!values.businessName?.trim() || !values.clientName?.trim() || !values.proformaNumber?.trim() || !values.proformaDate?.trim() || !values.items?.length) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return false
    }
    return true
  }, [form, toast])



  const { totals, invoiceData } = useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: watchedValues.proformaNumber,
      invoiceDate: watchedValues.proformaDate,
      dueDate: watchedValues.validUntil,
      documentType: "PROFORMA",
      currencySymbol: watchedValues.currencySymbol || "₹",
      gstMode: "none",
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
        phone: watchedValues.businessPhone ? `${watchedValues.businessPhoneCode || "+91"} ${watchedValues.businessPhone}` : undefined,
        email: watchedValues.businessEmail,
      },
      billTo: {
        name: watchedValues.clientName,
        addressLines: watchedValues.clientAddress ? watchedValues.clientAddress.split('\n') : [],
        phone: watchedValues.clientPhone ? `${watchedValues.clientPhoneCode || "+91"} ${watchedValues.clientPhone}` : undefined,
        email: watchedValues.clientEmail,
      },
      items: (watchedValues.items || []).map((item, i) => ({
        id: String(i),
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "Nos",
        rate: Number(item.rate) || 0,
      })),
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
      shippingCharge: computedTotals.shippingCharge,
      grandTotal: computedTotals.grandTotal,
      itemsWithTotals: computedTotals.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        total: item.lineTotal,
      }))
    };
    return { totals: uiTotals, invoiceData: templateData };
  }, [watchedValues]);



  const handleSaveProforma = () => {
    if (!validateEssentialFields()) return
    setSavedOnce(true)
    const saved: SavedProforma = {
      id: watchedValues.proformaNumber,
      proformaNumber: watchedValues.proformaNumber,
      date: watchedValues.proformaDate,
      clientName: watchedValues.clientName,
      total: totals.grandTotal,
      data: watchedValues
    }
    const updated = [saved, ...proformas.filter(i => i.id !== saved.id)].slice(0, 50)
    setProformas(updated)
    saveProformas(updated)
    toast({
      title: "Proforma saved as draft!",
      description: `"${watchedValues.proformaNumber}" saved locally.`,
    })
  }

  const handleRevertLastSaved = () => {
    if (!proformas.length) {
      toast({ title: "No saved proformas found", variant: "destructive" })
      return
    }
    const last = proformas[0]
    if (last.data) {
      form.reset(last.data)
      toast({ title: `Reverted to "${last.proformaNumber}"` })
    }
  }

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    setIsPreviewing(true)
    const currentValues = form.getValues()
    savePreviewSession("proforma-invoice", currentValues, {
      logoOriginal,
      logoSettings,
      signatureOriginal,
      signatureSettings,
      watermarkOriginal,
      watermarkSettings,
    })
    const currentProformaNumber = currentValues.proformaNumber
    const id = savePreviewData({
      docType: "proforma-invoice",
      invoiceData,
      title: "Proforma Invoice Preview",
      fileName: `proforma-invoice-${currentProformaNumber || "draft"}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, form, invoiceData, router, logoOriginal, logoSettings, signatureOriginal, signatureSettings, watermarkOriginal, watermarkSettings])

  const handleUseCurrency = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      form.setValue("currency", currency.code)
      form.setValue("currencySymbol", currency.symbol)
    }
  }





  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (!mounted) return <SkeletonDocumentForm />;

  return (
    <div>

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Proforma Invoice</h1>
            <p className="text-xs text-muted-foreground">Create a professional proforma invoice for your client</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevertLastSaved} title="Revert to last saved">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSaveProforma}>
              <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6 min-w-0">

            {/* Settings Section */}
            <section className="form-section">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Currency</Label>
                  <Select defaultValue="INR" onValueChange={handleUseCurrency}>
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
                  <div className="flex items-start gap-4">
                    <ImageUploadField
                      assetType="logo"
                      compact={true}
                      value={watchedValues.businessLogo}
                      originalValue={logoOriginal}
                      settings={logoSettings}
                      onChange={(editedUrl, orig, newSettings) => {
                        form.setValue("businessLogo", editedUrl);
                        setLogoOriginal(orig);
                        setLogoSettings(newSettings);
                      }}
                      onRemove={() => {
                        form.setValue("businessLogo", "");
                        setLogoOriginal("");
                        setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                      }}
                    />
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
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={watchedValues.businessPhoneCode || "+91"}
                      onChange={(v) => form.setValue("businessPhoneCode", v)}
                    />
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="e.g. 9876543210"
                      className="h-9 text-sm flex-1"
                      value={watchedValues.businessPhone || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        form.setValue("businessPhone", val);
                      }}
                    />
                  </div>
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
                  <Label className="text-xs font-medium">Email</Label>
                  <Input {...form.register("clientEmail")} placeholder="e.g. billing@xyzcorp.com" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={watchedValues.clientPhoneCode || "+91"}
                      onChange={(v) => form.setValue("clientPhoneCode", v)}
                    />
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="e.g. 9876543210"
                      className="h-9 text-sm flex-1"
                      value={watchedValues.clientPhone || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        form.setValue("clientPhone", val);
                      }}
                    />
                  </div>
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

            {/* Proforma Meta */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">P</span>
                Proforma Details
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Proforma Number *</Label>
                  <Input {...form.register("proformaNumber")} placeholder="e.g. PRO-2024-0001" className="h-9 text-sm font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Date *</Label>
                  <Input {...form.register("proformaDate")} type="date" className="h-9 text-sm" />
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
                <span className="h-5 w-5 rounded-md bg-orange-600 flex items-center justify-center text-white text-xs font-bold">{fields.length}</span>
                Items / Services
              </h2>

              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-[1fr_80px_90px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span></span>
                </div>

                {fields.map((field, index) => {
                  const item = totals.itemsWithTotals[index]
                  return (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_90px_32px] gap-2 items-start p-3 sm:p-0 rounded-xl sm:rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-gray-800/20">
                      <div className="space-y-1">
                        <Label className="sm:hidden text-xs text-muted-foreground">Description</Label>
                        <Input {...form.register(`items.${index}.description`)} placeholder="e.g. Product or service" className="h-9 text-xs" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">Qty</Label>
                        <Input {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" placeholder="1" />
                      </div>
                      <div>
                        <Label className="sm:hidden text-xs text-muted-foreground">Rate</Label>
                        <Input {...form.register(`items.${index}.rate`, { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-9 text-xs" placeholder="0.00" />
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-semibold hidden sm:block">{watchedValues.currencySymbol}{fmt(item?.total || 0)}</span>
                        <button type="button" onClick={() => remove(index)} disabled={fields.length === 1}
                          className="h-9 w-8 flex items-center justify-center text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors ml-auto">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
                  {totals.shippingCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing</span>
                      <span>{watchedValues.currencySymbol}{fmt(totals.shippingCharge)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-display font-bold text-lg">
                    <span>Total</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{watchedValues.currencySymbol}{fmt(totals.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Optional Extras */}
            <section className="form-section">
              <button type="button" onClick={() => setShowExtras(!showExtras)} className="w-full flex items-center justify-between text-left">
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
                    <Textarea {...form.register("terms")} rows={3} className="text-sm resize-none" placeholder="e.g. This proforma is valid for 15 days." />
                    <p className="text-[11px] text-muted-foreground">These terms will appear at the bottom of the proforma PDF.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      Attachments / References
                    </Label>
                    <Textarea {...form.register("attachments")} rows={2} className="text-sm resize-none" placeholder="e.g. Scope of work document attached." />
                    <p className="text-[11px] text-muted-foreground">List any documents, references, or purchase order numbers.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      Additional Information
                    </Label>
                    <Textarea {...form.register("additionalInfo")} rows={2} className="text-sm resize-none" placeholder="e.g. Estimated delivery timeline." />
                    <p className="text-[11px] text-muted-foreground">Any other details the client should know.</p>
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
                    <ImageUploadField
                      assetType="watermark"
                      aspectRatio="wide"
                      title="Upload Watermark Image"
                      helpText="PNG with transparency works best"
                      value={watchedValues.watermarkUrl}
                      originalValue={watermarkOriginal}
                      settings={watermarkSettings}
                      onChange={(editedUrl, orig, newSettings) => {
                        form.setValue("watermarkUrl", editedUrl);
                        setWatermarkOriginal(orig);
                        setWatermarkSettings(newSettings);
                      }}
                      onRemove={() => {
                        form.setValue("watermarkUrl", "");
                        setWatermarkOriginal("");
                        setWatermarkSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                      }}
                    />
                    <p className="text-[11px] text-muted-foreground mt-2">A faint watermark will appear across the document background.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Signature */}
            <section className="form-section">
              <h2 className="font-display font-semibold text-sm mb-4">Authorized Signature (optional)</h2>
              <ImageUploadField
                assetType="signature"
                aspectRatio="signature"
                title="Upload Signature Image"
                helpText="PNG or JPG"
                value={watchedValues.businessSignature}
                originalValue={signatureOriginal}
                settings={signatureSettings}
                onChange={(editedUrl, orig, newSettings) => {
                  form.setValue("businessSignature", editedUrl);
                  setSignatureOriginal(orig);
                  setSignatureSettings(newSettings);
                }}
                onRemove={() => {
                  form.setValue("businessSignature", "");
                  setSignatureOriginal("");
                  setSignatureSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                }}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Appears at the bottom of the proforma document.</p>
            </section>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pb-4">
              <Button
                className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 font-semibold disabled:opacity-60"
                onClick={handleShowPreview}
                disabled={isPreviewing}
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> GENERATING PREVIEW...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" /> SHOW PREVIEW
                  </>
                )}
              </Button>
            </div>

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
                      <span>Click the <strong>Save Draft</strong> button anytime — your proforma is saved to your browser&apos;s local storage instantly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Saved drafts <strong>persist even if you close the browser</strong> or tab.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>Drafts are stored <strong>locally on your device only</strong>. No data is sent to any server.</span>
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
    </div>
  )
}
