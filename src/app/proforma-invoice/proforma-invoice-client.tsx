"use client"
import React, { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Download, Eye, EyeOff } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { useToast } from "@/hooks/use-toast"
import {
  InvoicePreview,
  ClassicBooksTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export function ProformaInvoiceClient() {
  const { toast } = useToast()
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ])
  const [clientName, setClientName] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const validateEssentialFields = () => {
    if (!clientName?.trim()) { toast({ title: "Client name is required", variant: "destructive" }); return false }
    if (!items.length || !items[0].description?.trim()) { toast({ title: "Add at least one item with a description", variant: "destructive" }); return false }
    for (const item of items) {
      if (!item.description?.trim()) { toast({ title: "All items need a description", variant: "destructive" }); return false }
      if (!item.quantity || item.quantity <= 0) { toast({ title: "All items need a valid quantity", variant: "destructive" }); return false }
    }
    return true
  }

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }

  const { totals, invoiceData } = React.useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
      invoiceDate: invoiceDate,
      status: "Draft",
      currencySymbol: "₹",
      gstMode: "none",
      company: {
        name: companyName || "Your Company Name",
        logoUrl: companyLogo,
        addressLines: [],
      },
      billTo: {
        name: clientName || "Client Name",
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
  }, [items, clientName, invoiceDate, companyName, companyLogo]);

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    if (!showPreview) {
      toast({ title: "Preview required", description: "Click 'Show Preview' first before downloading.", variant: "destructive" })
      return
    }
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `proforma-${invoiceDate}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const addItem = () => {
    setItems([...items, { id: String(Date.now()), description: "", quantity: 1, rate: 0 }])
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold">
            {showPreview ? "Proforma Invoice Preview" : "Proforma Invoice Details"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={togglePreview}
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{showPreview ? "Edit" : "Show Preview"}</span>
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

        <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-6 overflow-hidden">
          {/* Form Panel */}
          {!showPreview && (
            <div className="flex-1 min-w-0 overflow-y-auto pb-8">
              <div className="max-w-2xl mx-auto space-y-6">

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

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Client Name *</Label>
          <Input placeholder="Enter client name" value={clientName} onChange={e => setClientName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input type="date" className="h-9 text-sm" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Line Items *</Label>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add Item
          </Button>
        </div>

        {items.map((item, idx) => (
          <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
            <div className="sm:hidden space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={e => updateItem(item.id, "description", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Qty</Label>
                  <Input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Rate</Label>
                  <Input
                    type="number" min="0"
                    value={item.rate}
                    onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={e => updateItem(item.id, "description", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Qty</Label>
                <Input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Rate</Label>
                <Input
                  type="number" min="0"
                  value={item.rate}
                  onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />
      <div className="space-y-2 sm:ml-auto sm:w-60">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{fmt(subtotal)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-display font-bold text-lg">
          <span>Total</span>
          <span className="text-blue-600">₹{fmt(totals.grandTotal)}</span>
        </div>
      </div>

            </div>
          </div>
          )}

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-full min-w-0 overflow-y-auto pb-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border mt-6 lg:mt-0 lg:pl-6">
              <div className="max-w-2xl mx-auto">
                <div id="invoice-print-root">
                  <InvoicePreview hideToolbar={true}>
                    <ClassicBooksTemplate invoice={invoiceData} />
                  </InvoicePreview>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
