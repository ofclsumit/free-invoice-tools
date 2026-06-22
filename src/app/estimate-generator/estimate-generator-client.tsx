"use client"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Download, Eye, ArrowLeft } from "lucide-react"
import {
  InvoicePreview,
  MinimalMonoTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"
import { LoadingScreen } from "@/components/shared/loading-screen"

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export function EstimateGeneratorClient() {
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ])
  const [clientName, setClientName] = useState("")
  const [estimateNo, setEstimateNo] = useState("")
  const [estimateDate, setEstimateDate] = useState(new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = useState("")
  const [taxRate, setTaxRate] = useState(18)
  const [notes, setNotes] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

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

  const { totals, invoiceData } = useMemo(() => {
    const templateData: TemplateInvoiceData = {
      invoiceNumber: estimateNo || "Draft",
      invoiceDate: estimateDate,
      dueDate: validUntil,
      status: "Draft",
      currencySymbol: "₹",
      gstMode: "single",
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
        gstPercent: taxRate,
      })),
      notes: notes,
    };

    const computedTotals = computeInvoiceTotals(templateData);

    return { totals: computedTotals, invoiceData: templateData };
  }, [items, clientName, estimateNo, estimateDate, validUntil, taxRate, notes, companyName, companyLogo]);

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `estimate-${estimateNo || "Draft"}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating Estimate PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Estimate
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <MinimalMonoTemplate invoice={invoiceData} />
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>

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

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Client Name</Label>
          <Input placeholder="Enter client name" value={clientName} onChange={e => setClientName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Estimate Number</Label>
          <Input placeholder="Auto-generated" value={estimateNo} onChange={e => setEstimateNo(e.target.value)} className="h-9 text-sm" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input type="date" className="h-9 text-sm" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Valid Until</Label>
          <Input type="date" className="h-9 text-sm" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Line Items</Label>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}>
            <Plus className="h-3 w-3" /> Add Item
          </Button>
        </div>

        {items.map((item) => (
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Tax Rate (%)</Label>
        <div className="flex gap-2 flex-wrap">
          {[0, 5, 12, 18, 28].map(rate => (
            <button key={rate} onClick={() => setTaxRate(rate)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${taxRate === rate ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >{rate}%</button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notes (optional)</Label>
        <Textarea placeholder="Payment terms, delivery details, etc." value={notes} onChange={e => setNotes(e.target.value)} className="text-sm resize-none" rows={3} />
      </div>

      <div className="h-px bg-border" />
      <div className="space-y-2 sm:ml-auto sm:w-60">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{fmt(totals.subTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax ({taxRate}%)</span>
          <span>₹{fmt(totals.totalGst)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-display font-bold text-lg">
          <span>Total</span>
          <span className="text-emerald-600">₹{fmt(totals.grandTotal)}</span>
        </div>
      </div>

      <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 font-semibold gap-2">
        <Download className="h-4 w-4" /> Download PDF
      </Button>
    </div>
  </>
  )
}
