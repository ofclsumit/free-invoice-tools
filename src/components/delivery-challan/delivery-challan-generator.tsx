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
  RotateCcw, Share2, Loader2, Truck, HelpCircle
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
import { ShareButton } from "@/components/shared/share-button"

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
  template: z.enum(["StudioTemplate", "LedgerTemplate", "MinimalMonoTemplate", "VyaparDesiTemplate", "ClassicBooksTemplate"]).default("StudioTemplate"),
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
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [savedOnce, setSavedOnce] = useState(false)
  const [challans, setChallans] = useState<SavedChallan[]>([])
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setChallans(loadChallans())
  }, [])

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
      template: "StudioTemplate",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedValues = form.watch()

  const validateEssentialFields = useCallback(() => {
    const values = form.getValues()
    if (!values.businessName?.trim() || !values.clientName?.trim() || !values.challanNumber?.trim() || !values.challanDate?.trim() || !values.items?.length) {
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

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `delivery-challan-${watchedValues.challanNumber}.pdf`);
        toast({ title: "Delivery Challan PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

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

  const handleUseCurrency = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code)
    if (currency) {
      form.setValue("currency", currency.code)
      form.setValue("currencySymbol", currency.symbol)
    }
  }

  const renderTemplate = () => {
    switch (watchedValues.template) {
      case "LedgerTemplate": return <LedgerTemplate invoice={invoiceData} />
      case "MinimalMonoTemplate": return <MinimalMonoTemplate invoice={invoiceData} />
      case "VyaparDesiTemplate": return <VyaparDesiTemplate invoice={invoiceData} />
      case "ClassicBooksTemplate": return <ClassicBooksTemplate invoice={invoiceData} />
      default: return <StudioTemplate invoice={invoiceData} />
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

  if (!mounted) return null;

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating Delivery Challan PDF..." />}

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300" style={{ overscrollBehavior: "contain" }}>
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">

            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Challan Preview</h2>
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
                <Button variant="outline" size="sm" onClick={handleSaveChallan} className="hidden sm:flex gap-2">
                  <Save className="h-4 w-4" /> Save Draft
                </Button>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 font-semibold" onClick={handleDownloadPDF} disabled={isGenerating}>
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

      {/* Hidden print root */}
      <div id="invoice-print-wrapper" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <div id="invoice-print-root">
          <InvoicePreview hideToolbar={true}>
            {renderTemplate()}
          </InvoicePreview>
        </div>
      </div>

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
              <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-600"><Truck className="h-4 w-4" /> Challan Design & Preferences</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Template Design</Label>
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
                    <Select
                      value={watchedValues.businessPhoneCode || "+91"}
                      onValueChange={(v) => form.setValue("businessPhoneCode", v)}
                    >
                      <SelectTrigger className="h-9 w-20 text-xs text-foreground bg-background">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+971">+971</SelectItem>
                        <SelectItem value="+61">+61</SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Business Logo (Optional)</Label>
                  <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                    {watchedValues.businessLogo ? (
                      <>
                        <img src={watchedValues.businessLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            form.setValue("businessLogo", "");
                          }}
                        >
                          <Trash2 className="h-5 w-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                        <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground font-medium">Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Authorized Signature (Optional)</Label>
                  <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                    {watchedValues.businessSignature ? (
                      <>
                        <img src={watchedValues.businessSignature} alt="Signature" className="max-h-full max-w-full object-contain p-2" />
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
                        <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground font-medium">Upload Signature</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
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
                    <Select
                      value={watchedValues.clientPhoneCode || "+91"}
                      onValueChange={(v) => form.setValue("clientPhoneCode", v)}
                    >
                      <SelectTrigger className="h-9 w-20 text-xs text-foreground bg-background">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                        <SelectItem value="+971">+971</SelectItem>
                        <SelectItem value="+61">+61</SelectItem>
                      </SelectContent>
                    </Select>
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
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-12">
              <Button
                variant="outline"
                type="button"
                onClick={handleSaveChallan}
                className="gap-2"
              >
                <Save className="h-4 w-4" /> Save Draft
              </Button>
              <Button
                type="button"
                onClick={togglePreview}
                className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 font-semibold"
              >
                <Eye className="h-4 w-4" /> SHOW PREVIEW
              </Button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
