"use client"

import React, { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  computeInvoiceTotals,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { savePreviewData } from "@/lib/preview-store"

interface LineItem {
  id: string; description: string; quantity: number; rate: number
}

const STORAGE_KEY = "qf_debit_note"

interface DebitNoteData {
  companyName: string; companyLogo: string; debitNoteNo: string; debitDate: string
  referenceInvoice: string; supplierName: string; reason: string; items: LineItem[]
}

function loadSaved(): DebitNoteData | null {
  if (typeof window === "undefined") return null
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null } catch { return null }
}

function saveData(data: DebitNoteData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function DebitNoteClient() {
  const { toast } = useToast()
  const router = useRouter()

  const [items, setItems] = useState<LineItem[]>([{ id: "1", description: "", quantity: 1, rate: 0 }])
  const [debitNoteNo, setDebitNoteNo] = useState("")
  const [debitDate, setDebitDate] = useState(new Date().toISOString().split("T")[0])
  const [referenceInvoice, setReferenceInvoice] = useState("")
  const [supplierName, setSupplierName] = useState("")
  const [reason, setReason] = useState("")
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
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)

  const invoiceData = useMemo((): TemplateInvoiceData => ({
    invoiceNumber: debitNoteNo || String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
    invoiceDate: debitDate, status: "Draft", currencySymbol: "₹", gstMode: "none",
    company: { name: companyName || "Your Company Name", logoUrl: companyLogo, addressLines: [] },
    billTo: { name: supplierName || "Supplier Name", addressLines: [] },
    items: items.map(item => ({ id: item.id, description: item.description, quantity: item.quantity, rate: item.rate })),
    notes: `${referenceInvoice ? `Ref. Invoice: ${referenceInvoice}\n` : ""}${reason ? `Reason: ${reason}` : ""}`.trim() || undefined,
  }), [items, supplierName, debitNoteNo, debitDate, referenceInvoice, reason, companyName, companyLogo])

  const totals = useMemo(() => computeInvoiceTotals(invoiceData), [invoiceData])

  const getState = useCallback((): DebitNoteData => ({ companyName, companyLogo, debitNoteNo, debitDate, referenceInvoice, supplierName, reason, items }), [companyName, companyLogo, debitNoteNo, debitDate, referenceInvoice, supplierName, reason, items])
  const setState = useCallback((d: DebitNoteData) => {
    setCompanyName(d.companyName || ""); setCompanyLogo(d.companyLogo || ""); setDebitNoteNo(d.debitNoteNo || "")
    setDebitDate(d.debitDate || new Date().toISOString().split("T")[0]); setReferenceInvoice(d.referenceInvoice || ""); setSupplierName(d.supplierName || "")
    setReason(d.reason || ""); setItems(d.items?.length ? d.items : [{ id: "1", description: "", quantity: 1, rate: 0 }])
  }, [])

  const validate = useCallback(() => {
    if (!supplierName) { toast({ title: "Supplier name is required", variant: "destructive" }); return false }
    return true
  }, [supplierName, toast])

  const handleSave = () => { if (!validate()) return; saveData(getState()); toast({ title: "Debit note saved as draft!" }) }
  const handleRevert = () => { const s = loadSaved(); if (!s) { toast({ title: "No saved debit note found", variant: "destructive" }); return }; setState(s); toast({ title: "Reverted to saved draft" }) }

  const resetForm = useCallback(() => {
    setCompanyName(""); setCompanyLogo(""); setDebitNoteNo(""); setDebitDate(new Date().toISOString().split("T")[0]); setReferenceInvoice(""); setSupplierName(""); setReason(""); setItems([{ id: "1", description: "", quantity: 1, rate: 0 }])
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validate()) return
    const id = savePreviewData({
      docType: "template",
      templateName: "MinimalMonoTemplate",
      invoiceData,
      title: "Debit Note Preview",
      fileName: `debit-note-${debitNoteNo || "draft"}.pdf`,
    })
    router.push(`/preview/${id}`)
  }, [validate, invoiceData, debitNoteNo, router])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Debit Note</h1>
          <p className="text-xs text-muted-foreground">Raise a debit note to your supplier for additional charges</p>
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
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-red-500" /> Company Details</h3>
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
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-rose-500" /> Debit Note Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Debit Note Number</Label><Input placeholder="Auto-generated" value={debitNoteNo} onChange={e => setDebitNoteNo(e.target.value)} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Date</Label><Input type="date" className="h-9 text-sm" value={debitDate} onChange={e => setDebitDate(e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs font-medium">Supplier Name *</Label><Input placeholder="Enter supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="h-9 text-sm" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-medium">Reference Invoice</Label><Input placeholder="INV-001" value={referenceInvoice} onChange={e => setReferenceInvoice(e.target.value)} className="h-9 text-sm" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-medium">Reason for Debit</Label><Textarea placeholder="Why is this debit note being raised?" value={reason} onChange={e => setReason(e.target.value)} className="text-sm resize-none" rows={2} /></div>
          </section>

          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"><div className="h-5 w-1 rounded-full bg-orange-500" /> Items</h3>
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
            <div className="space-y-2 sm:ml-auto sm:w-60">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{fmt(subtotal)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between font-bold text-lg"><span>Total Debit</span><span className="text-red-600">₹{fmt(totals.grandTotal)}</span></div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pb-6">
            <Button onClick={handleShowPreview} className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 font-semibold flex-1"><Eye className="h-4 w-4" /> SHOW PREVIEW</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
