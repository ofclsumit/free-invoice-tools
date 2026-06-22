"use client"
import React, { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  VyaparDesiTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"

interface Item {
  id: string; description: string; quantity: number; rate: number
}

export function PurchaseOrderClient() {
  const [items, setItems] = useState<Item[]>([{ id: "1", description: "", quantity: 1, rate: 0 }])
  const [supplier, setSupplier] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [poNo] = useState(() => String(Math.floor(Math.random() * 10000)).padStart(4, "0"))
  const [poDate] = useState(() => new Date().toLocaleDateString("en-IN"))
  
  const { totals, invoiceData } = React.useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: poNo,
      invoiceDate: poDate,
      status: "Draft",
      currencySymbol: "₹",
      gstMode: "none",
      company: {
        name: companyName || "Your Company Name",
        logoUrl: companyLogo,
        addressLines: [],
      },
      billTo: {
        name: supplier || "Supplier Name",
        addressLines: [],
      },
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      })),
    };

    const computedTotals = computeInvoiceTotals(templateData);

    return { totals: computedTotals, invoiceData: templateData };
  }, [items, supplier, poNo, poDate, companyName, companyLogo]);

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `purchase-order-${poNo}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const total = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  if (showPreview) {
    return (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Purchase Order
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <VyaparDesiTemplate invoice={invoiceData} />
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  }

  const addItem = () => setItems([...items, { id: String(Date.now()), description: "", quantity: 1, rate: 0 }])
  const updateItem = (id: string, field: keyof Item, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Company Name</Label>
          <Input placeholder="Your Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Company Logo</Label>
          <div className="flex items-center gap-2">
            <Input type="file" accept="image/*" onChange={handleLogoUpload} className="h-9 text-sm flex-1" />
            {companyLogo && <div className="h-9 w-9 rounded border border-border overflow-hidden flex-shrink-0"><img src={companyLogo} alt="Logo" className="h-full w-full object-cover" /></div>}
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Supplier Name</Label>
        <Input placeholder="Enter supplier name" value={supplier} onChange={e => setSupplier(e.target.value)} className="h-9 text-sm" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Items</Label>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}><Plus className="h-3 w-3" /> Add Item</Button>
        </div>
        {items.map(item => (
          <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
            <div className="sm:hidden space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input placeholder="Item" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Qty</Label>
                  <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Rate</Label>
                  <Input type="number" min="0" value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                </div>
                <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input placeholder="Item" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Qty</Label>
                <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Rate</Label>
                <Input type="number" min="0" value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
              </div>
              <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Button onClick={() => setShowPreview(true)} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 font-semibold gap-2">
          <Eye className="h-4 w-4" /> Show Preview
        </Button>
        <div className="flex justify-between sm:gap-4 font-display font-bold text-lg">
          <span>Total</span><span className="text-teal-600">₹{fmt(totals.grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
