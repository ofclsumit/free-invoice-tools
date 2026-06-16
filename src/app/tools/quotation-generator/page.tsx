"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ClipboardList, Plus, Trash2, Download } from "lucide-react"
import { generateQuotationPDF } from "@/lib/pdf/generate-quotation"

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export default function QuotationGeneratorPage() {
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0 },
  ])
  const [clientName, setClientName] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const addItem = () => {
    setItems([...items, { id: String(Date.now()), description: "", quantity: 1, rate: 0 }])
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id))
  }

  const total = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const itemsWithTotals = items.map(item => {
        const itemTotal = item.quantity * item.rate
        return {
          description: item.description || "Line Item",
          quantity: item.quantity,
          rate: item.rate,
          discount: 0,
          taxRate: 0,
          taxableAmount: itemTotal,
          taxAmount: 0,
          total: itemTotal,
        }
      })

      await generateQuotationPDF({
        businessName: "QuoteFlow",
        clientName: clientName || "Client Name",
        quoteNumber: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
        quoteDate: new Date().toISOString(),
        validUntil,
        currency: "INR",
        items: [],
        subtotal: total,
        totalTax: 0,
        totalDiscount: 0,
        grandTotal: total,
        itemsWithTotals,
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4">
            <ClipboardList className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Free Quotation Generator</h1>
          <p className="text-muted-foreground mt-2">Create a professional quotation in seconds</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6 shadow-glass">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client Name</Label>
              <Input placeholder="Enter client name" value={clientName} onChange={e => setClientName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Valid Until</Label>
              <Input type="date" className="h-9 text-sm" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Items</Label>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}>
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
                {/* Mobile layout */}
                <div className="sm:hidden space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Description</Label>
                    <Input placeholder="Item description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
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
                    <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Description</Label>
                    <Input placeholder="Item description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Qty</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Rate</Label>
                    <Input type="number" min="0" value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  </div>
                  <button onClick={() => removeItem(item.id)} className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-border" />
          <div className="flex justify-between font-display font-bold text-lg sm:ml-auto sm:w-48">
            <span>Total</span>
            <span className="text-indigo-600">₹{fmt(total)}</span>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 font-semibold gap-2">
              <Download className="h-4 w-4" /> {isDownloading ? "Generating..." : "Download Quotation PDF"}
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

