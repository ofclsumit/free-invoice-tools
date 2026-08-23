"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save,
  Building2, Truck, FileSpreadsheet, PackagePlus, Receipt, FileSignature
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { computeInvoiceTotals, type InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { numberToWords } from "@/components/invoice-templates/data/invoiceTypes"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

interface DebitLineItem {
  id: string
  description: string
  hsnSac?: string
  quantity: number
  unit?: string
  rate: number
  gstPercent?: number
}

const STORAGE_KEY = "qf_debit_note"

export interface DebitNoteData {
  companyName: string
  companyLogo: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGstin?: string
  companyPan?: string

  supplierName: string
  supplierAddress?: string
  supplierPhone?: string
  supplierEmail?: string
  supplierGstin?: string

  debitNoteNo: string
  debitDate: string
  referenceInvoice: string
  referenceInvoiceDate?: string
  reason: string

  taxRate: number
  notes?: string
  items: DebitLineItem[]
}

function loadSaved(): DebitNoteData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function saveData(data: DebitNoteData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

const COMMON_DEBIT_REASONS = [
  "Purchase Return to Vendor (Defective / Damaged Goods)",
  "Short Shipment / Missing Items in Delivery",
  "Rate Difference / Overcharging by Supplier",
  "Supplementary Charges / Vendor Penalty",
  "Deficiency in Vendor Service Performance",
]

export function DebitNoteClient() {
  const { toast } = useToast()
  const router = useRouter()

  // Issuing Business Information
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [logoOriginal, setLogoOriginal] = useState("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyGstin, setCompanyGstin] = useState("")
  const [companyPan, setCompanyPan] = useState("")

  // Supplier / Vendor Information
  const [supplierName, setSupplierName] = useState("")
  const [supplierAddress, setSupplierAddress] = useState("")
  const [supplierPhone, setSupplierPhone] = useState("")
  const [supplierEmail, setSupplierEmail] = useState("")
  const [supplierGstin, setSupplierGstin] = useState("")

  // Debit Note & Reference Details
  const [debitNoteNo, setDebitNoteNo] = useState("")
  const [debitDate, setDebitDate] = useState(new Date().toISOString().split("T")[0])
  const [referenceInvoice, setReferenceInvoice] = useState("")
  const [referenceInvoiceDate, setReferenceInvoiceDate] = useState("")
  const [reason, setReason] = useState("Purchase Return to Vendor (Defective / Damaged Goods)")

  // Debit Line Items
  const [items, setItems] = useState<DebitLineItem[]>([
    { id: "1", description: "Purchase Return / Vendor Chargeback", hsnSac: "", quantity: 1, unit: "Nos", rate: 0, gstPercent: 18 }
  ])
  const [taxRate, setTaxRate] = useState(18)
  const [notes, setNotes] = useState("Debit value will be adjusted against upcoming supplier payments or refunded.")

  const [mounted, setMounted] = useState(false)

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: "", hsnSac: "", quantity: 1, unit: "Nos", rate: 0, gstPercent: taxRate }
    ])
  }

  const updateItem = (id: string, field: keyof DebitLineItem, value: any) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const invoiceData: TemplateInvoiceData = useMemo(() => ({
    invoiceNumber: debitNoteNo || "DN-DRAFT",
    invoiceDate: debitDate,
    documentType: "debit-note",
    status: "Draft",
    currencySymbol: "₹",
    gstMode: taxRate > 0 ? "single" : "none",
    purchaseOrderNumber: referenceInvoice ? `${referenceInvoice}${referenceInvoiceDate ? ` (Dated: ${referenceInvoiceDate})` : ""}` : undefined,
    company: {
      name: companyName || "Your Business Name",
      logoUrl: companyLogo,
      addressLines: companyAddress ? companyAddress.split("\n") : [],
      phone: companyPhone,
      email: companyEmail,
      gstin: companyGstin,
      pan: companyPan,
    },
    billTo: {
      name: supplierName || "Supplier / Vendor Name",
      addressLines: supplierAddress ? supplierAddress.split("\n") : [],
      phone: supplierPhone,
      email: supplierEmail,
      gstin: supplierGstin,
    },
    items: items.map(i => ({
      id: i.id,
      description: i.description,
      hsnCode: i.hsnSac,
      quantity: i.quantity,
      unit: i.unit || "NOS",
      rate: i.rate,
      gstPercent: taxRate,
    })),
    notes: `${reason ? `Reason for Debit: ${reason}\n\n` : ""}${notes}`.trim() || undefined,
  }), [
    items, supplierName, supplierAddress, supplierPhone, supplierEmail, supplierGstin,
    debitNoteNo, debitDate, referenceInvoice, referenceInvoiceDate, reason, taxRate, notes,
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin, companyPan
  ])

  const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])

  const getState = useCallback((): DebitNoteData => ({
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin, companyPan,
    supplierName, supplierAddress, supplierPhone, supplierEmail, supplierGstin,
    debitNoteNo, debitDate, referenceInvoice, referenceInvoiceDate, reason,
    taxRate, notes, items
  }), [
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin, companyPan,
    supplierName, supplierAddress, supplierPhone, supplierEmail, supplierGstin,
    debitNoteNo, debitDate, referenceInvoice, referenceInvoiceDate, reason,
    taxRate, notes, items
  ])

  const setState = useCallback((d: DebitNoteData) => {
    setCompanyName(d.companyName || "")
    setCompanyLogo(d.companyLogo || "")
    setCompanyAddress(d.companyAddress || "")
    setCompanyPhone(d.companyPhone || "")
    setCompanyEmail(d.companyEmail || "")
    setCompanyGstin(d.companyGstin || "")
    setCompanyPan(d.companyPan || "")

    setSupplierName(d.supplierName || "")
    setSupplierAddress(d.supplierAddress || "")
    setSupplierPhone(d.supplierPhone || "")
    setSupplierEmail(d.supplierEmail || "")
    setSupplierGstin(d.supplierGstin || "")

    setDebitNoteNo(d.debitNoteNo || "")
    setDebitDate(d.debitDate || new Date().toISOString().split("T")[0])
    setReferenceInvoice(d.referenceInvoice || "")
    setReferenceInvoiceDate(d.referenceInvoiceDate || "")
    setReason(d.reason || "Purchase Return to Vendor (Defective / Damaged Goods)")

    setTaxRate(d.taxRate ?? 18)
    setNotes(d.notes || "")
    setItems(d.items?.length ? d.items : [{ id: "1", description: "", quantity: 1, unit: "Nos", rate: 0 }])
  }, [])

  useEffect(() => {
    setMounted(true)
    const session = consumePreviewSession<DebitNoteData>("debit-note")
    if (session?.formValues) {
      setState(session.formValues)
      if (session.extraState?.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
      if (session.extraState?.logoSettings) setLogoSettings(session.extraState.logoSettings)
    }
  }, [setState])

  const validate = useCallback(() => {
    if (!supplierName.trim()) {
      toast({ title: "Supplier / Vendor name is required", variant: "destructive" })
      return false
    }
    if (!referenceInvoice.trim()) {
      toast({ title: "Original Purchase Reference / Invoice Number is required", variant: "destructive" })
      return false
    }
    if (items.some(i => !i.description.trim())) {
      toast({ title: "Please provide a description for all debit items", variant: "destructive" })
      return false
    }
    return true
  }, [supplierName, referenceInvoice, items, toast])

  const handleSave = () => {
    if (!validate()) return
    saveData(getState())
    toast({ title: "Debit note saved as draft!", description: "Saved securely to your browser." })
  }

  const handleRevert = () => {
    const saved = loadSaved()
    if (!saved) {
      toast({ title: "No saved debit note found", variant: "destructive" })
      return
    }
    setState(saved)
    toast({ title: "Reverted to saved draft" })
  }

  const resetForm = useCallback(() => {
    setCompanyName("")
    setCompanyLogo("")
    setLogoOriginal("")
    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS)
    setCompanyAddress("")
    setCompanyPhone("")
    setCompanyEmail("")
    setCompanyGstin("")
    setCompanyPan("")
    setSupplierName("")
    setSupplierAddress("")
    setSupplierPhone("")
    setSupplierEmail("")
    setSupplierGstin("")
    setDebitNoteNo("")
    setDebitDate(new Date().toISOString().split("T")[0])
    setReferenceInvoice("")
    setReferenceInvoiceDate("")
    setReason("Purchase Return to Vendor (Defective / Damaged Goods)")
    setTaxRate(18)
    setNotes("Debit value will be adjusted against upcoming supplier payments or refunded.")
    setItems([{ id: "1", description: "", quantity: 1, unit: "Nos", rate: 0 }])
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validate()) return
    savePreviewSession("debit-note", getState(), {
      logoOriginal,
      logoSettings,
    })
    const id = savePreviewData({
      docType: "debit-note",
      invoiceData,
      title: "Debit Note Preview",
      fileName: `debit-note-${(debitNoteNo || "draft").toLowerCase().replace(/\s+/g, "-")}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validate, invoiceData, debitNoteNo, getState, router, logoOriginal, logoSettings])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top Sticky Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Debit Note</h1>
          <p className="text-xs text-muted-foreground">Issue a formal debit note to suppliers for purchase returns or rate adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Section 1: Issuing Business Details */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            Issuing Business / Buyer Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-start gap-4">
                <ImageUploadField
                  assetType="logo"
                  compact={true}
                  value={companyLogo}
                  originalValue={logoOriginal}
                  settings={logoSettings}
                  onChange={(editedUrl, orig, newSettings) => {
                    setCompanyLogo(editedUrl);
                    setLogoOriginal(orig);
                    setLogoSettings(newSettings);
                  }}
                  onRemove={() => {
                    setCompanyLogo("");
                    setLogoOriginal("");
                    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                  }}
                />
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-medium">Your Business / Company Name</Label>
                  <Input
                    placeholder="e.g. Apex Industrial Works Ltd"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Address</Label>
              <Textarea
                placeholder="e.g. Building 12, Industrial Area, Phase II"
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">GSTIN (Buyer / Issuer)</Label>
              <Input
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={companyGstin}
                onChange={e => setCompanyGstin(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">PAN (Optional)</Label>
              <Input
                placeholder="e.g. AAAAA0000A"
                value={companyPan}
                onChange={e => setCompanyPan(e.target.value.toUpperCase())}
                className="h-9 text-sm font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone</Label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={companyPhone}
                onChange={e => setCompanyPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <Input
                placeholder="e.g. procurement@apexworks.com"
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Vendor / Supplier Information */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Truck className="h-3.5 w-3.5" />
            </span>
            Vendor / Supplier Information (Issued To)
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vendor / Supplier Name *</Label>
              <Input
                placeholder="e.g. Prime Logistics & Materials Ltd"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vendor GSTIN (Optional)</Label>
              <Input
                placeholder="e.g. 27CCCCC0000C1Z4"
                value={supplierGstin}
                onChange={e => setSupplierGstin(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Vendor Address</Label>
              <Textarea
                placeholder="e.g. Warehouse 5, Logistics Park, Highway 48"
                value={supplierAddress}
                onChange={e => setSupplierAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vendor Phone</Label>
              <Input
                placeholder="e.g. +91 91234 56789"
                value={supplierPhone}
                onChange={e => setSupplierPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vendor Email</Label>
              <Input
                placeholder="e.g. supply@primelogistics.com"
                value={supplierEmail}
                onChange={e => setSupplierEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Debit Note & Purchase References */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileSpreadsheet className="h-3.5 w-3.5" />
            </span>
            Debit Note & Purchase Reference
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Debit Note Number</Label>
              <Input
                placeholder="e.g. DN-2026-001"
                value={debitNoteNo}
                onChange={e => setDebitNoteNo(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Debit Note Date</Label>
              <Input
                type="date"
                value={debitDate}
                onChange={e => setDebitDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Original Purchase Bill / PO Reference *</Label>
              <Input
                placeholder="e.g. PINV-2026-0412"
                value={referenceInvoice}
                onChange={e => setReferenceInvoice(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Original Invoice Date (Optional)</Label>
              <Input
                type="date"
                value={referenceInvoiceDate}
                onChange={e => setReferenceInvoiceDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Reason for Debit Note</Label>
              <div className="space-y-2">
                <Input
                  placeholder="e.g. Purchase Return to Vendor (Defective / Damaged Goods)"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="h-9 text-sm"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DEBIT_REASONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-muted-foreground transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Debit Line Items */}
        <section className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <PackagePlus className="h-3.5 w-3.5" />
              </span>
              Debit Particulars & Items
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-1.5 h-8 text-xs font-medium text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Debit Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0)
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-gray-900/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Particular #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Particulars Description *</Label>
                      <Input
                        placeholder="e.g. Damaged Aluminium Extrusions"
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">HSN / SAC</Label>
                      <Input
                        placeholder="e.g. 7604"
                        value={item.hsnSac || ""}
                        onChange={e => updateItem(item.id, "hsnSac", e.target.value)}
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Debited Qty</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="any"
                        placeholder="1"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="h-9 text-sm font-mono text-right"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Unit</Label>
                      <Input
                        placeholder="Nos/Kg"
                        value={item.unit || ""}
                        onChange={e => updateItem(item.id, "unit", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Debit Rate (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={item.rate || ""}
                        onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        className="h-9 text-sm font-mono text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end text-xs text-muted-foreground pt-1 border-t border-border/60">
                    Taxable Debit Amount: <span className="font-semibold text-foreground ml-1 font-mono">₹{fmt(lineTotal)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 5: Debit Summary */}
        <section className="form-section bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 border-blue-200 dark:border-blue-900/50">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Receipt className="h-3.5 w-3.5" />
            </span>
            Debit Note Summary
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium min-w-[120px]">Applicable GST Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="28"
                  placeholder="18"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="h-9 text-sm font-mono w-24"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-card rounded-xl border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Value Debited</span>
                <span className="font-mono font-medium">₹{fmt(totals.subTotal)}</span>
              </div>
              {totals.totalGst > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST Amount ({taxRate}%)</span>
                  <span className="font-mono">₹{fmt(totals.totalGst)}</span>
                </div>
              )}
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-base text-foreground">Total Debit Amount</span>
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400 font-mono tracking-tight">₹{fmt(totals.grandTotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                Amount in Words: <span className="font-medium text-foreground">{numberToWords(totals.grandTotal)}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Debit Remarks */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileSignature className="h-3.5 w-3.5" />
            </span>
            Debit Notes & Settlement Remarks
          </h2>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notes / Ledger Settlement Terms</Label>
            <Textarea
              placeholder="Specify settlement mode, deductions from pending vendor bills, or refund instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </section>

        {/* Bottom Action Area */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            onClick={handleShowPreview}
            className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0 font-semibold h-11 text-sm shadow-md flex-1"
          >
            <Eye className="h-4 w-4" /> SHOW PREVIEW & DOWNLOAD
          </Button>
        </div>
      </div>
    </div>
  )
}
