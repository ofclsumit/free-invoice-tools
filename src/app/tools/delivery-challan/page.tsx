"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, Plus, Trash2, Download } from "lucide-react"
import { generateDeliveryChallanPDF } from "@/lib/pdf/generate-delivery-challan"

interface Item { id: string; description: string; quantity: number }

export default function DeliveryChallanPage() {
  const [items, setItems] = useState<Item[]>([{ id: "1", description: "", quantity: 1 }])
  const [consignee, setConsignee] = useState("")
  const [transporter, setTransporter] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isDownloading, setIsDownloading] = useState(false)

  const addItem = () => setItems([...items, { id: String(Date.now()), description: "", quantity: 1 }])
  const updateItem = (id: string, field: keyof Item, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      await generateDeliveryChallanPDF({
        challanNo: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
        date: new Date(date).toLocaleDateString("en-IN"),
        consignee,
        transporter,
        vehicleNo,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
        })),
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
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 mb-4">
            <Package className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Delivery Challan</h1>
          <p className="text-muted-foreground mt-2">Generate delivery challan for goods transport</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-5 shadow-glass">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Consignee (Receiver)</Label>
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
              <Label className="text-xs font-medium">Goods</Label>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addItem}><Plus className="h-3 w-3" /> Add Item</Button>
            </div>
            {items.map(item => (
              <div key={item.id} className="border border-border rounded-xl p-3 space-y-3 sm:border-0 sm:p-0 sm:space-y-0">
                {/* Mobile layout */}
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

                {/* Desktop layout */}
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

          <div className="h-px bg-border pt-2" />
          <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 font-semibold gap-2">
            <Download className="h-4 w-4" /> {isDownloading ? "Generating..." : "Download Delivery Challan PDF"}
          </Button>
        </div>
      </div>
    </div>
  )
}
