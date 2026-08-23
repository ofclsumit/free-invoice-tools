"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save,
  Briefcase, User, FileText, Layers, Receipt, FileSignature
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { computeInvoiceTotals, type InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { numberToWords } from "@/components/invoice-templates/data/invoiceTypes"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

interface LineItem {
  id: string
  description: string
  quantity: number
  unit?: string
  rate: number
  gstPercent?: number
}

const STORAGE_KEY = "qf_estimate"

export interface EstimateData {
  companyName: string
  companyLogo: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGstin?: string

  clientName: string
  clientContactPerson?: string
  clientAddress?: string
  clientPhone?: string
  clientEmail?: string
  clientGstin?: string

  estimateNo: string
  estimateDate: string
  validUntil: string
  projectTitle?: string

  taxRate: number
  globalDiscountPercent?: number
  notes: string
  terms?: string
  items: LineItem[]
}

function loadSaved(): EstimateData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function saveData(data: EstimateData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

const COMMON_UNITS = ["Hours", "Days", "Nos", "Units", "Months", "Sprints", "Milestones", "Items"]

export function EstimateGeneratorClient() {
  const { toast } = useToast()
  const router = useRouter()

  // Estimating Business Information
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [logoOriginal, setLogoOriginal] = useState("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyGstin, setCompanyGstin] = useState("")

  // Client / Prospect Information
  const [clientName, setClientName] = useState("")
  const [clientContactPerson, setClientContactPerson] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientGstin, setClientGstin] = useState("")

  // Estimate Metadata
  const [estimateNo, setEstimateNo] = useState("")
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = useState("")
  const [projectTitle, setProjectTitle] = useState("")

  // Items & Pricing
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Initial Scope Discovery & Planning", quantity: 1, unit: "Milestones", rate: 0, gstPercent: 0 }
  ])
  const [taxRate, setTaxRate] = useState(18)
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState<number>(0)
  const [notes, setNotes] = useState("This cost estimate is valid for 30 days from date of issuance. Final project invoicing will be billed according to agreed deliverables.")
  const [terms, setTerms] = useState("")

  const [mounted, setMounted] = useState(false)

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: "", quantity: 1, unit: "Hours", rate: 0, gstPercent: taxRate }
    ])
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
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
    invoiceNumber: estimateNo || "EST-DRAFT",
    invoiceDate: estimateDate,
    dueDate: validUntil,
    documentType: "estimate",
    status: "Draft",
    currencySymbol: "₹",
    gstMode: taxRate > 0 ? "single" : "none",
    globalDiscountPercent: Number(globalDiscountPercent) || 0,
    company: {
      name: companyName || "Your Company Name",
      logoUrl: companyLogo,
      addressLines: companyAddress ? companyAddress.split("\n") : [],
      phone: companyPhone,
      email: companyEmail,
      gstin: companyGstin,
    },
    billTo: {
      name: clientName || "Client / Organization Name",
      addressLines: clientAddress ? clientAddress.split("\n") : [],
      phone: clientPhone,
      email: clientEmail,
      gstin: clientGstin,
    },
    items: items.map(i => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unit: i.unit || "NOS",
      rate: i.rate,
      gstPercent: taxRate,
    })),
    notes: `${projectTitle ? `Project: ${projectTitle}\n\n` : ""}${notes}`.trim() || undefined,
    terms: terms || undefined,
  }), [
    items, clientName, clientAddress, clientPhone, clientEmail, clientGstin,
    estimateNo, estimateDate, validUntil, projectTitle, taxRate, globalDiscountPercent, notes, terms,
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin
  ])

  const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])

  const getState = useCallback((): EstimateData => ({
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin,
    clientName, clientContactPerson, clientAddress, clientPhone, clientEmail, clientGstin,
    estimateNo, estimateDate, validUntil, projectTitle,
    taxRate, globalDiscountPercent, notes, terms, items
  }), [
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin,
    clientName, clientContactPerson, clientAddress, clientPhone, clientEmail, clientGstin,
    estimateNo, estimateDate, validUntil, projectTitle,
    taxRate, globalDiscountPercent, notes, terms, items
  ])

  const setState = useCallback((d: EstimateData) => {
    setCompanyName(d.companyName || "")
    setCompanyLogo(d.companyLogo || "")
    setCompanyAddress(d.companyAddress || "")
    setCompanyPhone(d.companyPhone || "")
    setCompanyEmail(d.companyEmail || "")
    setCompanyGstin(d.companyGstin || "")

    setClientName(d.clientName || "")
    setClientContactPerson(d.clientContactPerson || "")
    setClientAddress(d.clientAddress || "")
    setClientPhone(d.clientPhone || "")
    setClientEmail(d.clientEmail || "")
    setClientGstin(d.clientGstin || "")

    setEstimateNo(d.estimateNo || "")
    setEstimateDate(d.estimateDate || new Date().toISOString().split("T")[0])
    setValidUntil(d.validUntil || "")
    setProjectTitle(d.projectTitle || "")

    setTaxRate(d.taxRate ?? 18)
    setGlobalDiscountPercent(d.globalDiscountPercent ?? 0)
    setNotes(d.notes || "")
    setTerms(d.terms || "")
    setItems(d.items?.length ? d.items : [{ id: "1", description: "", quantity: 1, unit: "Hours", rate: 0 }])
  }, [])

  useEffect(() => {
    setMounted(true)
    const session = consumePreviewSession<EstimateData>("estimate")
    if (session?.formValues) {
      setState(session.formValues)
      if (session.extraState?.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
      if (session.extraState?.logoSettings) setLogoSettings(session.extraState.logoSettings)
    }
  }, [setState])

  const validate = useCallback(() => {
    if (!clientName.trim()) {
      toast({ title: "Client name is required", variant: "destructive" })
      return false
    }
    if (items.some(i => !i.description.trim())) {
      toast({ title: "Please provide a description for all estimate scope items", variant: "destructive" })
      return false
    }
    return true
  }, [clientName, items, toast])

  const handleSave = () => {
    if (!validate()) return
    saveData(getState())
    toast({ title: "Estimate saved as draft!", description: "Saved securely to your browser." })
  }

  const handleRevert = () => {
    const saved = loadSaved()
    if (!saved) {
      toast({ title: "No saved estimate found", variant: "destructive" })
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
    setClientName("")
    setClientContactPerson("")
    setClientAddress("")
    setClientPhone("")
    setClientEmail("")
    setClientGstin("")
    setEstimateNo("")
    setEstimateDate(new Date().toISOString().split("T")[0])
    setValidUntil("")
    setProjectTitle("")
    setTaxRate(18)
    setGlobalDiscountPercent(0)
    setNotes("This cost estimate is valid for 30 days from date of issuance. Final project invoicing will be billed according to agreed deliverables.")
    setTerms("")
    setItems([{ id: "1", description: "", quantity: 1, unit: "Hours", rate: 0 }])
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validate()) return
    savePreviewSession("estimate", getState(), {
      logoOriginal,
      logoSettings,
    })
    const id = savePreviewData({
      docType: "estimate",
      invoiceData,
      title: "Cost Estimate Preview",
      fileName: `estimate-${(estimateNo || "draft").toLowerCase().replace(/\s+/g, "-")}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validate, invoiceData, estimateNo, getState, router, logoOriginal, logoSettings])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top Sticky Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Cost Estimate</h1>
          <p className="text-xs text-muted-foreground">Create a comprehensive project scope & price quotation for prospects</p>
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
        {/* Section 1: Business Details */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Briefcase className="h-3.5 w-3.5" />
            </span>
            Estimating Business
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
                  <Label className="text-xs font-medium">Business / Studio Name</Label>
                  <Input
                    placeholder="e.g. Apex Digital Solutions"
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
                placeholder="e.g. Suite 300, Innovation Tower, Cyber City"
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
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
                placeholder="e.g. estimates@apexdigital.com"
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">GSTIN (Optional)</Label>
              <Input
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={companyGstin}
                onChange={e => setCompanyGstin(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Client / Prospect Information */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <User className="h-3.5 w-3.5" />
            </span>
            Client / Prospect Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client / Organization Name *</Label>
              <Input
                placeholder="e.g. Horizon Enterprises Ltd"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Contact Person / Attention (Optional)</Label>
              <Input
                placeholder="e.g. Attention: Mr. Vikram Mehta"
                value={clientContactPerson}
                onChange={e => setClientContactPerson(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Client Address</Label>
              <Textarea
                placeholder="e.g. Plot 12, Industrial Estate, Andheri East, Mumbai"
                value={clientAddress}
                onChange={e => setClientAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client Phone</Label>
              <Input
                placeholder="e.g. +91 91234 56789"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client Email</Label>
              <Input
                placeholder="e.g. contact@horizon.com"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client GSTIN (Optional)</Label>
              <Input
                placeholder="e.g. 27BBBBB0000B1Z2"
                value={clientGstin}
                onChange={e => setClientGstin(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Estimate Details & Validity */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </span>
            Estimate Details & Validity
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Estimate Number</Label>
              <Input
                placeholder="e.g. EST-2026-001"
                value={estimateNo}
                onChange={e => setEstimateNo(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Estimate Date</Label>
              <Input
                type="date"
                value={estimateDate}
                onChange={e => setEstimateDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Valid Until (Expiry Date)</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <Label className="text-xs font-medium">Project / Scope Subject (Optional)</Label>
              <Input
                placeholder="e.g. Enterprise Cloud Infrastructure Migration & Security Hardening"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Estimated Scope & Deliverables */}
        <section className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <Layers className="h-3.5 w-3.5" />
              </span>
              Estimated Scope & Deliverables
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-1.5 h-8 text-xs font-medium text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Scope Item
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
                      Item #{index + 1}
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
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Deliverable / Scope Description *</Label>
                      <Input
                        placeholder="e.g. Phase 1 Architecture Design & Setup"
                        value={item.description}
                        onChange={e => updateItem(item.id, "description", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Estimated Qty</Label>
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
                        placeholder="Hours/Nos"
                        value={item.unit || ""}
                        onChange={e => updateItem(item.id, "unit", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Estimated Rate (₹)</Label>
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
                    Estimated Line Total: <span className="font-semibold text-foreground ml-1 font-mono">₹{fmt(lineTotal)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 5: Estimation Summary & Tax */}
        <section className="form-section bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20 border-indigo-200 dark:border-indigo-900/50">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Receipt className="h-3.5 w-3.5" />
            </span>
            Estimation Summary
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium min-w-[120px]">Applicable Tax (GST %)</Label>
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

              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium min-w-[120px]">Commercial Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={globalDiscountPercent}
                  onChange={e => setGlobalDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="h-9 text-sm font-mono w-24"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-card rounded-xl border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scope Subtotal</span>
                <span className="font-mono font-medium">₹{fmt(totals.subTotal)}</span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">-₹{fmt(totals.totalDiscount)}</span>
                </div>
              )}
              {totals.totalGst > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST ({taxRate}%)</span>
                  <span className="font-mono">₹{fmt(totals.totalGst)}</span>
                </div>
              )}
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-base text-foreground">Estimated Total</span>
                <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">₹{fmt(totals.grandTotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                Amount in Words: <span className="font-medium text-foreground">{numberToWords(totals.grandTotal)}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Assumptions, Terms & Notes */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileSignature className="h-3.5 w-3.5" />
            </span>
            Commercial Terms & Assumptions
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Estimation Notes & Assumptions</Label>
              <Textarea
                placeholder="Specify key assumptions, estimated timeline, or out-of-scope items..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Terms & Conditions (Optional)</Label>
              <Textarea
                placeholder="e.g. 50% advance upon project sign-off, remaining upon milestone completion."
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
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
