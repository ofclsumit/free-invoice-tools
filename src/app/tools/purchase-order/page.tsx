"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ShoppingCart, Plus, Trash2, Download } from "lucide-react"
import { generatePurchaseOrderPDF } from "@/lib/pdf/generate-purchase-order"

interface Item {
  id: string; description: string; quantity: number; rate: number
}

export default function PurchaseOrderPage() {
  const [items, setItems] = useState<Item[]>([{ id: "1", description: "", quantity: 1, rate: 0 }])
  const [supplier, setSupplier] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const addItem = () => setItems([...items, { id: String(Date.now()), description: "", quantity: 1, rate: 0 }])
  const updateItem = (id: string, field: keyof Item, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const total = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generatePurchaseOrderPDF({
        poNo: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
        date: new Date().toLocaleDateString("en-IN"),
        supplier,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        total,
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
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4">
            <ShoppingCart className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Purchase Order Generator</h1>
          <p className="text-muted-foreground mt-2">Create purchase orders for your suppliers</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-6 shadow-glass">
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
                {/* Mobile layout */}
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

                {/* Desktop layout */}
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
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 font-semibold gap-2">
              <Download className="h-4 w-4" /> {isDownloading ? "Generating..." : "Download PDF PO"}
            </Button>
            <div className="flex justify-between sm:gap-4 font-display font-bold text-lg">
              <span>Total</span><span className="text-teal-600">₹{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
