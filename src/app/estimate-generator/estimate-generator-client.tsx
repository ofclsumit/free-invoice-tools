"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Download, Eye, X, ZoomIn, ZoomOut, RotateCcw, Printer, Plus, Trash2, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { ShareButton } from "@/components/shared/share-button"
import { tryNativeShare, generateShareUrl, openWhatsApp, openEmail } from "@/lib/share-utils"
import {
  computeInvoiceTotals,
  MinimalMonoTemplate,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/data/invoiceTypes"

interface LineItem {
  id: string; description: string; quantity: number; rate: number
}

const STORAGE_KEY = "qf_estimate"

interface EstimateData {
  companyName: string; companyLogo: string; clientName: string; estimateNo: string
  estimateDate: string; validUntil: string; taxRate: number; notes: string; items: LineItem[]
}

function loadSaved(): EstimateData | null {
  if (typeof window === "undefined") return null
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null } catch { return null }
}

function saveData(data: EstimateData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function EstimateGeneratorClient() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<LineItem[]>([{ id: "1", description: "", quantity: 1, rate: 0 }])
  const [clientName, setClientName] = useState("")
  const [estimateNo, setEstimateNo] = useState("")
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(18)
  const [notes, setNotes] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const addItem = () => setItems([...items, { id: String(Date.now()), description: "", quantity: 1, rate: 0 }])
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onloadend = () => setCompanyLogo(r.result as string); r.readAsDataURL(file) }
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const invoiceData: TemplateInvoiceData = useMemo(() => ({
    invoiceNumber: estimateNo || "Draft",
    invoiceDate: estimateDate,
    dueDate: validUntil,
    status: "Draft",
    currencySymbol: "₹",
    gstMode: "single",
    company: { name: companyName || "Your Company Name", logoUrl: companyLogo, addressLines: [] },
    billTo: { name: clientName || "Client Name", addressLines: [] },
    items: items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, rate: i.rate, gstPercent: taxRate })),
    notes,
  }), [items, clientName, estimateNo, estimateDate, validUntil, taxRate, notes, companyName, companyLogo])

  const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])

  const getState = useCallback((): EstimateData => ({ companyName, companyLogo, clientName, estimateNo, estimateDate, validUntil, taxRate, notes, items }), [companyName, companyLogo, clientName, estimateNo, estimateDate, validUntil, taxRate, notes, items])
  const setState = useCallback((d: EstimateData) => {
    setCompanyName(d.companyName || ""); setCompanyLogo(d.companyLogo || ""); setClientName(d.clientName || ""); setEstimateNo(d.estimateNo || "")
    setEstimateDate(d.estimateDate || new Date().toISOString().split("T")[0]); setValidUntil(d.validUntil || ""); setTaxRate(d.taxRate ?? 18); setNotes(d.notes || "")
    setItems(d.items?.length ? d.items : [{ id: "1", description: "", quantity: 1, rate: 0 }])
  }, [])

  const validate = useCallback(() => {
    if (!clientName) { toast({ title: "Client name is required", variant: "destructive" }); return false }
    return true
  }, [clientName, toast])

  const togglePreview = useCallback(() => {
    if (showPreview) setShowPreview(false)
    else if (validate()) setShowPreview(true)
  }, [showPreview, validate])

  const handleDownloadPDF = async (returnBlob?: boolean): Promise<Blob | void> => {
    setIsGenerating(true)
    try {
      const { exportNodeToPdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("estimate-print-root")
      if (node) {
        const blob = await exportNodeToPdf(node, `estimate-${estimateNo || "draft"}.pdf`, true)
        if (returnBlob) return blob
        toast({ title: "Estimate PDF downloaded!" })
      }
    } catch { toast({ title: "Error generating PDF", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const handlePrint = () => window.print()
  const handleSave = () => { if (!validate()) return; saveData(getState()); toast({ title: "Estimate saved as draft!" }) }
  const handleRevert = () => { const s = loadSaved(); if (!s) { toast({ title: "No saved estimate found", variant: "destructive" }); return }; setState(s); toast({ title: "Reverted to saved draft" }) }

  const handleWhatsAppShare = async () => {
    if (!validate()) return
    setIsGenerating(true)
    try {
      const { exportNodeToPdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("estimate-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `estimate-${estimateNo || "document"}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)
      const msg = `Hello,\n\nPlease find attached the estimate.\n\nBest regards`
      const shared = await tryNativeShare(blob, fileName, `Estimate ${estimateNo || ""}`, msg)
      if (!shared) {
        const url = await generateShareUrl(invoiceData, "MinimalMonoTemplate", `Estimate ${estimateNo || ""}`)
        if (url) {
          openWhatsApp(`${msg}\n\nView online: ${url}`)
        } else {
          const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
          openWhatsApp(msg)
        }
      }
    } catch { toast({ title: "Failed to share", variant: "destructive" }) }
    finally { setIsGenerating(false) }
  }

  const handleEmailReceipt = async () => {
    if (!validate()) return
    setIsGenerating(true)
    try {
      const { exportNodeToPdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("estimate-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `estimate-${estimateNo || "document"}.pdf`
      const blob = await exportNodeToPdf(node, fileName, true)
      const body = `Dear Sir/Madam,\n\nPlease find attached the estimate.\n\nBest regards`
      const shared = await tryNativeShare(blob, fileName, `Estimate ${estimateNo || ""}`, body)
      if (!shared) {
        const url = await generateShareUrl(invoiceData, "MinimalMonoTemplate", `Estimate ${estimateNo || ""}`)
        if (url) {
          openEmail("", `Estimate ${estimateNo || ""}`, `${body}\n\nView online: ${url}`)
        } else {
          const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
          openEmail("", `Estimate ${estimateNo || ""}`, body)
        }
      }
    } catch { toast({ title: "Failed to send email", variant: "destructive" }) }
    finally { setIsGenerating(false) }
  }

  const resetForm = useCallback(() => {
    setCompanyName(""); setCompanyLogo(""); setClientName(""); setEstimateNo(""); setEstimateDate(new Date().toISOString().split("T")[0]); setValidUntil(""); setTaxRate(18); setNotes(""); setItems([{ id: "1", description: "", quantity: 1, rate: 0 }])
  }, [])

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden"
      document.body.style.touchAction = "none"; document.documentElement.style.touchAction = "none"
    } else {
      document.body.style.overflow = ""; document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""; document.documentElement.style.touchAction = ""
      setZoom(1)
    }
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; document.body.style.touchAction = ""; document.documentElement.style.touchAction = "" }
  }, [showPreview])

  if (!mounted) return null

  const renderPreview = () => {
    const d: any = {
      invoiceNumber: estimateNo || "Draft", invoiceDate: estimateDate, dueDate: validUntil,
      status: "Draft", currencySymbol: "₹", gstMode: "single",
      company: { name: companyName || "Your Company Name", logoUrl: companyLogo, addressLines: [] },
      billTo: { name: clientName || "Client Name", addressLines: [] },
      items: items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, rate: i.rate, gstPercent: taxRate })),
      notes,
    }
    return <MinimalMonoTemplate invoice={d} />
  }

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}

      <div id="estimate-print-root" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        {renderPreview()}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300" style={{ overscrollBehavior: "contain" }}>
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Estimate Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 ml-4 border border-border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <span className="text-xs font-medium w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 font-semibold" onClick={() => handleDownloadPDF()} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>
            <div ref={previewContainerRef} className="flex-1 overflow-y-auto p-0 sm:p-2 md:p-4 flex flex-col items-center" style={{ cursor: "grab", overscrollBehavior: "contain" }}>
              <div className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white" style={{ width: "100%", maxWidth: "210mm", transform: `scale(${zoom})`, transformOrigin: "top center", margin: "0 auto" }}>
                {renderPreview()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Estimate</h1>
            <p className="text-xs text-muted-foreground">Create a professional estimate for your client</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved"><RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span></Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}><Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span></Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={resetForm}><RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Reset</span></Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-emerald-500" /> Company Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Company Name</Label><Input placeholder="Your company name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Company Logo</Label>
                  <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                    {companyLogo ? (<><img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.preventDefault(); setCompanyLogo("") }}><Trash2 className="h-5 w-5 text-white" /></div></>) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center"><Plus className="h-5 w-5 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground font-medium">Upload Logo</span><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-blue-500" /> Client & Document</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Client Name *</Label><Input placeholder="Enter client name" value={clientName} onChange={e => setClientName(e.target.value)} className="h-9 text-sm" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Estimate Number</Label><Input placeholder="Auto-generated" value={estimateNo} onChange={e => setEstimateNo(e.target.value)} className="h-9 text-sm" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-medium">Date</Label><Input type="date" className="h-9 text-sm" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-medium">Valid Until</Label><Input type="date" className="h-9 text-sm" value={validUntil} onChange={e => setValidUntil(e.target.value)} /></div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-violet-500" /> Line Items</h3>
              <div className="flex items-center justify-end"><Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}><Plus className="h-3 w-3" /> Add Item</Button></div>
              {items.map((item) => (
                <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
                  <div className="sm:hidden space-y-2">
                    <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Description</Label><Input placeholder="Item description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" /></div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1"><Label className="text-[10px] text-muted-foreground">Qty</Label><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" /></div>
                      <div className="flex-1 space-y-1"><Label className="text-[10px] text-muted-foreground">Rate</Label><Input type="number" min="0" value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" /></div>
                      <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                    <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Description</Label><Input placeholder="Item description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Qty</Label><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px] text-muted-foreground">Rate</Label><Input type="number" min="0" value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" /></div>
                    <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </section>

            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-amber-500" /> Tax & Notes</h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tax Rate (%)</Label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 5, 12, 18, 28].map(rate => (
                    <button key={rate} onClick={() => setTaxRate(rate)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${taxRate === rate ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}>{rate}%</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Notes (optional)</Label><Textarea placeholder="Payment terms, delivery details, etc." value={notes} onChange={e => setNotes(e.target.value)} className="text-sm resize-none" rows={3} /></div>
              <div className="space-y-2 sm:ml-auto sm:w-60">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{fmt(totals.subTotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span>₹{fmt(totals.totalGst)}</span></div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-emerald-600">₹{fmt(totals.grandTotal)}</span></div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pb-6">
              <Button onClick={togglePreview} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 font-semibold flex-1"><Eye className="h-4 w-4" /> SHOW PREVIEW</Button>
              <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer"><img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" /></button>
              <button onClick={handleEmailReceipt} title="Email Estimate" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer"><img src="/email.svg" alt="Email" className="h-5 w-5" /></button>
              <ShareButton invoiceData={invoiceData} template="MinimalMonoTemplate" title={`Estimate ${estimateNo || ""}`} />
              <Button variant="outline" className="gap-2" onClick={handlePrint}><Printer className="h-4 w-4" /> Print</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
