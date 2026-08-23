"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
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
  Plus, Trash2, Eye, Save,
  ChevronDown, ChevronUp, Info, Paperclip, FileUp, CheckCircle2,
  RotateCcw, Truck, Loader2
} from "lucide-react"
import {
  computeInvoiceTotals,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { SkeletonDocumentForm } from "@/components/shared/loading"

import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.001, "Quantity is required"),
  unit: z.string().optional().default("Nos"),
  rate: z.coerce.number().min(0).optional().default(0),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(28).default(0),
  gstType: z.enum(["CGST_SGST", "IGST", "EXEMPT"]).default("CGST_SGST"),
})

const deliveryChallanSchema = z.object({
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
  clientGstin: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhoneCode: z.string().optional().default("+91"),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  clientPincode: z.string().optional(),
  
  // Shipping Details
  shippedFromSameAsBusiness: z.boolean().default(true),
  shippedFromAddress: z.string().optional(),
  shippedToSameAsClient: z.boolean().default(true),
  shippedToAddress: z.string().optional(),
  shippedToName: z.string().optional(),
  shippedToGstin: z.string().optional(),

  // Transport details
  transporterName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.string().default("Regular"),
  modeOfTransport: z.string().default("Road"),
  distance: z.string().optional(),
  transportDocNo: z.string().optional(),
  transactionType: z.string().default("Regular"),

  challanNumber: z.string().min(1),
  challanDate: z.string().min(1),
  currency: z.string().default("INR"),
  currencySymbol: z.string().default("₹"),
  gstMode: z.enum(["none", "single", "split"]).default("none"),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
  globalDiscountPercent: z.coerce.number().min(0).max(100).optional().default(0),
  shippingCharge: z.coerce.number().min(0).optional().default(0),
})

export type DeliveryChallanFormData = z.infer<typeof deliveryChallanSchema>

const defaultItem = {
  description: "",
  hsnCode: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  discount: 0,
  taxRate: 0,
  gstType: "CGST_SGST" as const,
}

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States" },
  { code: "EUR", symbol: "€", name: "Euro", country: "European Union" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "UAE" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "Australia" },
]

const TRANSACTION_TYPES = [
  "Regular", "Job Work", "For Own Use", "Line Sales", "SKD/CKD", "Supply on Approval"
]

interface SavedChallan {
  id: string
  challanNumber: string
  date: string
  clientName: string
  itemsCount: number
  data: any
}

function loadChallans(): SavedChallan[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("qf_delivery_challans")
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveChallans(challans: SavedChallan[]) {
  try {
    localStorage.setItem("qf_delivery_challans", JSON.stringify(challans))
  } catch {}
}

export function DeliveryChallanGenerator() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [savedOnce, setSavedOnce] = useState(false)
  const [challans, setChallans] = useState<SavedChallan[]>([])
  const router = useRouter()

  const [logoOriginal, setLogoOriginal] = useState<string>("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [signatureOriginal, setSignatureOriginal] = useState<string>("")
  const [signatureSettings, setSignatureSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setChallans(loadChallans())
  }, [])



  const today = new Date().toISOString().split("T")[0]

  const form = useForm<DeliveryChallanFormData>({
    resolver: zodResolver(deliveryChallanSchema),
    defaultValues: {
      businessLogo: "",
      businessSignature: "",
      businessName: "",
      businessPhoneCode: "+91",
      businessPhone: "",
      clientPhoneCode: "+91",
      clientPhone: "",
      challanNumber: `DC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
      challanDate: today,
      currency: "INR",
      currencySymbol: "₹",
      gstMode: "none",
      shippedFromSameAsBusiness: true,
      shippedToSameAsClient: true,
      vehicleType: "Regular",
      modeOfTransport: "Road",
      transactionType: "Regular",
      items: [{ ...defaultItem }],
      terms: "1. Goods received in good condition.\n2. This challan is only for transport of goods, not for sale.",
      globalDiscountPercent: 0,
      shippingCharge: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  // Single-use restoration ONLY when returning from Preview -> Back
  useEffect(() => {
    const session = consumePreviewSession<DeliveryChallanFormData>("delivery-challan")
    if (session?.formValues) {
      form.reset(session.formValues)
      if (session.extraState) {
        if (session.extraState.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
        if (session.extraState.logoSettings) setLogoSettings(session.extraState.logoSettings)
        if (session.extraState.signatureOriginal) setSignatureOriginal(session.extraState.signatureOriginal)
        if (session.extraState.signatureSettings) setSignatureSettings(session.extraState.signatureSettings)
      }
    }
  }, [form])

  const validateEssentialFields = useCallback(() => {
    const values = form.getValues()
    if (!values.businessName?.trim() || !values.clientName?.trim() || !values.challanNumber?.trim() || !values.challanDate?.trim() || !values.items?.length) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return false
    }
    return true
  }, [form, toast])



  const { totals, invoiceData } = useMemo(() => {
    const isGstActive = watchedValues.gstMode !== "none";
    
    // Prepare shipTo block
    let shipToBlock = undefined;
    if (!watchedValues.shippedToSameAsClient && watchedValues.shippedToName) {
      shipToBlock = {
        name: watchedValues.shippedToName,
        addressLines: watchedValues.shippedToAddress ? watchedValues.shippedToAddress.split('\n') : [],
        gstin: watchedValues.shippedToGstin,
      }
    } else if (watchedValues.clientName) {
      shipToBlock = {
        name: watchedValues.clientName,
        addressLines: watchedValues.clientAddress ? watchedValues.clientAddress.split('\n') : [],
        gstin: watchedValues.clientGstin,
      }
    }

    const templateData: TemplateInvoiceData = {
      invoiceNumber: watchedValues.challanNumber,
      invoiceDate: watchedValues.challanDate,
      documentType: "DELIVERY CHALLAN",
      currencySymbol: watchedValues.currencySymbol || "₹",
      gstMode: watchedValues.gstMode,
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
        gstin: watchedValues.clientGstin,
        phone: watchedValues.clientPhone ? `${watchedValues.clientPhoneCode || "+91"} ${watchedValues.clientPhone}` : undefined,
        email: watchedValues.clientEmail,
      },
      shipTo: shipToBlock,
      items: (watchedValues.items || []).map((item, i) => {
        const gstRate = isGstActive ? (Number(item.taxRate) || 0) : 0;
        return {
          id: String(i),
          description: item.description,
          hsnSac: item.hsnCode,
          quantity: Number(item.quantity) || 0,
          unit: item.unit || "Nos",
          rate: Number(item.rate) || 0,
          cgstPercent: isGstActive && item.gstType === "CGST_SGST" ? gstRate / 2 : 0,
          sgstPercent: isGstActive && item.gstType === "CGST_SGST" ? gstRate / 2 : 0,
          igstPercent: isGstActive && item.gstType === "IGST" ? gstRate : 0,
          discountPercent: Number(item.discount) || 0,
        };
      }),
      notes: watchedValues.notes,
      termsAndConditions: watchedValues.terms,
      transportDetails: {
        transporterName: watchedValues.transporterName,
        vehicleNumber: watchedValues.vehicleNumber,
        vehicleType: watchedValues.vehicleType,
        modeOfTransport: watchedValues.modeOfTransport,
        distance: watchedValues.distance,
        transportDocNo: watchedValues.transportDocNo,
        transactionType: watchedValues.transactionType,
        shippedFromAddress: !watchedValues.shippedFromSameAsBusiness ? watchedValues.shippedFromAddress : undefined,
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
        taxRate: (item.cgstPercent || 0) + (item.sgstPercent || 0) + (item.igstPercent || 0),
        gstType: (item.igstPercent || 0) > 0 ? "IGST" : "CGST_SGST",
        baseAmount: item.quantity * item.rate,
        discountAmount: (item.quantity * item.rate) - item.taxableValue,
        taxableAmount: item.taxableValue,
        taxAmount: item.gstAmount,
        total: item.lineTotal,
      }))
    };
    return { totals: uiTotals, invoiceData: templateData };
  }, [watchedValues]);

  const handleSaveChallan = () => {
    if (!validateEssentialFields()) return
    setSavedOnce(true)
    const saved: SavedChallan = {
      id: watchedValues.challanNumber,
      challanNumber: watchedValues.challanNumber,
      date: watchedValues.challanDate,
      clientName: watchedValues.clientName,
      itemsCount: watchedValues.items.length,
      data: watchedValues
    }
    const updated = [saved, ...challans.filter(c => c.id !== saved.id)].slice(0, 50)
    setChallans(updated)
    saveChallans(updated)
    toast({
      title: "Challan saved as draft!",
      description: `"${watchedValues.challanNumber}" saved locally.`,
    })
  }

  const handleRevertLastSaved = () => {
    if (!challans.length) {
      toast({ title: "No saved challans found", variant: "destructive" })
      return
    }
    const last = challans[0]
    if (last.data) {
      form.reset(last.data)
      toast({ title: `Reverted to "${last.challanNumber}"` })
    }
  }

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    setIsPreviewing(true)
    const currentValues = form.getValues()
    savePreviewSession("delivery-challan", currentValues, {
      logoOriginal,
      logoSettings,
      signatureOriginal,
      signatureSettings,
    })
    const currentChallanNumber = currentValues.challanNumber
    const id = savePreviewData({
      docType: "delivery-challan",
      invoiceData,
      title: "Delivery Challan Preview",
      fileName: `delivery-challan-${currentChallanNumber || "draft"}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, form, invoiceData, router, logoOriginal, logoSettings, signatureOriginal, signatureSettings])

  const handleUseCurrency = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      form.setValue("currency", currency.code)
      form.setValue("currencySymbol", currency.symbol)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("businessLogo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("businessSignature", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!mounted) return <SkeletonDocumentForm />;

  return (
    <div>
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Delivery Challan</h1>
            <p className="text-xs text-muted-foreground">Generate a professional, GST-compliant Delivery Challan</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevertLastSaved} title="Revert to last saved">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSaveChallan}>
              <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6 min-w-0">

            {/* Settings Section */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-600"><Truck className="h-4 w-4" /> Challan Preferences</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Currency</Label>
                  <Select
                    defaultValue="INR"
                    onValueChange={handleUseCurrency}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Currency" /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">GST Mode</Label>
                  <Select
                    defaultValue="none"
                    onValueChange={(v) => form.setValue("gstMode", v as any)}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="GST Details" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Tax columns (Plain Challan)</SelectItem>
                      <SelectItem value="single">Single GST Column</SelectItem>
                      <SelectItem value="split">Split GST (CGST/SGST/IGST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Delivered By (Business) Details */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Delivered By (Consignor / Sender)</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Business Name (Required)</Label>
                  <Input {...form.register("businessName")} placeholder="Your registered company name (e.g. Acme Corp)" className="h-9 text-sm" />
                  {form.formState.errors.businessName && (
                    <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.businessName.message}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">GSTIN (Optional)</Label>
                  <Input {...form.register("businessGstin")} placeholder="22AAAAA0000A1Z5" className="h-9 text-sm uppercase" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">PAN (Optional)</Label>
                  <Input {...form.register("businessPan")} placeholder="ABCDE1234F" className="h-9 text-sm uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone (Optional)</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={watchedValues.businessPhoneCode || "+91"}
                      onChange={(v) => form.setValue("businessPhoneCode", v)}
                    />
                    <Input
                      type="tel"
                      placeholder="9999999999"
                      value={watchedValues.businessPhone || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        form.setValue("businessPhone", val);
                      }}
                      className="h-9 text-sm flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email (Optional)</Label>
                  <Input {...form.register("businessEmail")} placeholder="billing@company.com" className="h-9 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company Address (Optional)</Label>
                <Textarea {...form.register("businessAddress")} placeholder="Street, Building, City, State, Pincode" className="min-h-16 text-sm" />
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <ImageUploadField
                  label="Business Logo (Optional)"
                  assetType="logo"
                  aspectRatio="square"
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

                <ImageUploadField
                  label="Authorized Signature (Optional)"
                  assetType="signature"
                  aspectRatio="signature"
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
              </div>
            </section>

            {/* Delivered To (Consignee / Client) Details */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Delivered To (Consignee / Recipient)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Client / Consignee Name (Required)</Label>
                  <Input {...form.register("clientName")} placeholder="Recipient customer or branch name (e.g. John Doe)" className="h-9 text-sm" />
                  {form.formState.errors.clientName && (
                    <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.clientName.message}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">GSTIN (Optional)</Label>
                  <Input {...form.register("clientGstin")} placeholder="22BBBBB0000B1Z5" className="h-9 text-sm uppercase" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Phone (Optional)</Label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={watchedValues.clientPhoneCode || "+91"}
                      onChange={(v) => form.setValue("clientPhoneCode", v)}
                    />
                    <Input
                      type="tel"
                      placeholder="9999988888"
                      value={watchedValues.clientPhone || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        form.setValue("clientPhone", val);
                      }}
                      className="h-9 text-sm flex-1 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email (Optional)</Label>
                  <Input {...form.register("clientEmail")} placeholder="client@email.com" className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Delivery Address (Optional)</Label>
                <Textarea {...form.register("clientAddress")} placeholder="Full delivery/billing destination address" className="min-h-16 text-sm" />
              </div>
            </section>

            {/* Shipping Addresses (Conditional Options) */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Shipping Locations</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="shippedFromSame"
                    checked={watchedValues.shippedFromSameAsBusiness}
                    onChange={(e) => form.setValue("shippedFromSameAsBusiness", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="shippedFromSame" className="text-xs font-medium text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                    Shipped From address is the same as Business Address
                  </label>
                </div>
                {!watchedValues.shippedFromSameAsBusiness && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-250">
                    <Label className="text-xs font-medium">Custom Shipped From Address</Label>
                    <Textarea {...form.register("shippedFromAddress")} placeholder="Enter different pickup warehouse address" className="min-h-16 text-sm" />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="shippedToSame"
                    checked={watchedValues.shippedToSameAsClient}
                    onChange={(e) => form.setValue("shippedToSameAsClient", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="shippedToSame" className="text-xs font-medium text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                    Shipped To address is the same as Client Address
                  </label>
                </div>
                {!watchedValues.shippedToSameAsClient && (
                  <div className="space-y-3 pt-2 border-t border-border animate-in slide-in-from-top-2 duration-250">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Shipped To Name</Label>
                        <Input {...form.register("shippedToName")} placeholder="Consignee Ship Name" className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Shipped To GSTIN</Label>
                        <Input {...form.register("shippedToGstin")} placeholder="If different destination GSTIN" className="h-9 text-sm uppercase" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Custom Shipped To Address</Label>
                      <Textarea {...form.register("shippedToAddress")} placeholder="Warehouse, Port, or alternate shipping site" className="min-h-16 text-sm" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Transport & Vehicle Details */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Transport & Dispatch Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Transporter Name (Optional)</Label>
                  <Input {...form.register("transporterName")} placeholder="E.g. BlueDart, VRL Logistics" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Vehicle Number (Optional)</Label>
                  <Input
                    {...form.register("vehicleNumber")}
                    placeholder="E.g. KA-01-XX-1234"
                    className="h-9 text-sm font-mono uppercase"
                    value={watchedValues.vehicleNumber || ""}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                      form.setValue("vehicleNumber", val);
                    }}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Mode of Transport (Required)</Label>
                  <Select
                    defaultValue="Road"
                    onValueChange={(v) => form.setValue("modeOfTransport", v)}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select transport mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Road">Road</SelectItem>
                      <SelectItem value="Rail">Rail</SelectItem>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Ship">Ship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Vehicle Type (Required)</Label>
                  <Select
                    defaultValue="Regular"
                    onValueChange={(v) => form.setValue("vehicleType", v)}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular Cargo</SelectItem>
                      <SelectItem value="ODC">Over Dimensional Cargo (ODC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Transaction Type (Required)</Label>
                  <Select
                    defaultValue="Regular"
                    onValueChange={(v) => form.setValue("transactionType", v)}
                  >
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select transaction type" /></SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Distance (KM) (Optional)</Label>
                  <Input {...form.register("distance")} placeholder="Approx distance for E-Way Bill (e.g. 250)" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Transport Doc No. / B/L No. (Optional)</Label>
                  <Input {...form.register("transportDocNo")} placeholder="LR / AWB / Railway Receipt Number (e.g. AWB12345)" className="h-9 text-sm" />
                </div>
              </div>
            </section>

            {/* Challan Info Strip */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Challan Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Challan Number (Required)</Label>
                  <Input {...form.register("challanNumber")} placeholder="DC-2026-0001" className="h-9 text-sm" />
                  {form.formState.errors.challanNumber && (
                    <span className="text-[10px] text-red-500 font-medium">{form.formState.errors.challanNumber.message}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Challan Date (Required)</Label>
                  <Input type="date" {...form.register("challanDate")} className="h-9 text-sm" />
                </div>
              </div>
            </section>

            {/* Line Items Table */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Goods / Products list</h3>
                <Button variant="outline" size="sm" type="button" onClick={() => append({ ...defaultItem })} className="h-8 text-xs gap-1.5 border-dashed">
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase font-medium bg-gray-50/50 dark:bg-gray-950/20">
                      <th className="py-2.5 px-3 w-[45%]">Item Description</th>
                      <th className="py-2.5 px-2 w-[12%]">HSN</th>
                      <th className="py-2.5 px-2 w-[12%]">Qty</th>
                      <th className="py-2.5 px-2 w-[10%]">Unit</th>
                      <th className="py-2.5 px-2 w-[12%]">Rate (Price)</th>
                      {watchedValues.gstMode !== "none" && (
                        <th className="py-2.5 px-2 w-[10%]">GST %</th>
                      )}
                      <th className="py-2.5 px-2 w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fields.map((field, index) => (
                      <tr key={field.id} className="group">
                        <td className="py-2 px-3 align-top">
                          <Input
                            {...form.register(`items.${index}.description` as const)}
                            placeholder="Product name or package details"
                            className="h-8 text-xs"
                          />
                          {form.formState.errors.items?.[index]?.description && (
                            <span className="text-[9px] text-red-500 block mt-0.5">{form.formState.errors.items?.[index]?.description?.message}</span>
                          )}
                        </td>
                        <td className="py-2 px-2 align-top">
                          <Input
                            {...form.register(`items.${index}.hsnCode` as const)}
                            placeholder="HSN Code"
                            className="h-8 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 align-top">
                          <Input
                            type="number"
                            step="any"
                            {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                            className="h-8 text-xs font-mono text-center"
                          />
                        </td>
                        <td className="py-2 px-2 align-top">
                          <Input
                            {...form.register(`items.${index}.unit` as const)}
                            placeholder="Pcs/Bags"
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
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notes & Terms */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Internal Notes (Optional)</Label>
                  <Textarea {...form.register("notes")} placeholder="E.g. Gate pass details, dispatcher comments..." className="min-h-20 text-xs leading-normal" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Terms & Conditions (Optional)</Label>
                  <Textarea {...form.register("terms")} placeholder="E.g. Recipient responsibility clause..." className="min-h-20 text-xs leading-normal" />
                </div>
              </div>
            </section>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 pb-6 mt-6">
              <Button
                className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold flex-1 disabled:opacity-60"
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

          </div>
        </div>
      </div>
    </div>
  )
}
