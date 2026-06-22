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
  MinimalMonoTemplate,
  computeInvoiceTotals,
  exportNodeToPdf,
  type InvoiceData as TemplateInvoiceData
} from "@/components/invoice-templates/components"

interface Item { id: string; description: string; quantity: number }

export function DeliveryChallanClient() {
  const { toast } = useToast()
  const [items, setItems] = useState<Item[]>([{ id: "1", description: "", quantity: 1 }])
  const [consignee, setConsignee] = useState("")
  const [transporter, setTransporter] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [challanNo] = useState(() => String(Math.floor(Math.random() * 10000)).padStart(4, "0"))

  const validateEssentialFields = () => {
    if (!consignee?.trim()) { toast({ title: "Consignee name is required", variant: "destructive" }); return false }
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
      invoiceNumber: challanNo,
      invoiceDate: date,
      status: "Draft",
      currencySymbol: "₹",
      gstMode: "none",
      company: {
        name: companyName || "Your Company Name",
        logoUrl: companyLogo,
        addressLines: [],
      },
      billTo: {
        name: consignee || "Receiver Name",
        addressLines: [],
      },
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: 0,
      })),
      notes: `Transporter: ${transporter || "-"}\nVehicle No: ${vehicleNo || "-"}`,
    };

    const computedTotals = computeInvoiceTotals(templateData);

    return { totals: computedTotals, invoiceData: templateData };
  }, [items, consignee, challanNo, date, transporter, vehicleNo, companyName, companyLogo]);

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `delivery-challan-${challanNo}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }


const addItem = () => setItems([...items, { id: String(Date.now()), description: "", quantity: 1 }])
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
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold">
            {showPreview ? "Delivery Challan Preview" : "Delivery Challan Details"}
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
              className="gap-1.5 h-8 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 font-semibold"
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
              <div className="max-w-2xl mx-auto space-y-5">

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
          <Label className="text-xs font-medium">Consignee (Receiver) *</Label>
          <Input placeholder="Receiver name" value={consignee} onChange={e => setConsignee(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date</Label>
          <Input type="date" className="h-9 text-sm" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Transporter</Label>
          <Input placeholder="Transporter name" value={transporter} onChange={e => setTransporter(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vehicle No.</Label>
          <Input placeholder="GJ-01-AB-1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="h-9 text-sm font-mono" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Goods *</Label>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}><Plus className="h-3 w-3" /> Add Item</Button>
        </div>
        {items.map(item => (
          <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
            <div className="sm:hidden space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input placeholder="Goods description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Qty</Label>
                  <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                </div>
                <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_32px] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description</Label>
                <Input placeholder="Goods description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Qty</Label>
                <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
              </div>
              <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
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
                    <MinimalMonoTemplate invoice={{...invoiceData, status: undefined}} />
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
