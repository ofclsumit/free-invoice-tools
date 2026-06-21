"use client"
import { useState, useRef } from "react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Package, Plus, Trash2, Download, Eye, Upload } from "lucide-react"

interface Item { id: string; description: string; quantity: number }

export default function DeliveryChallanPage() {
  const [items, setItems] = useState<Item[]>([{ id: "1", description: "", quantity: 1 }])
  const [consignee, setConsignee] = useState("")
  const [transporter, setTransporter] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [challanNo] = useState(() => String(Math.floor(Math.random() * 10000)).padStart(4, "0"))
  
  const printRef = useRef<HTMLDivElement>(null)

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

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `DeliveryChallan_${challanNo}`,
  })

  if (showPreview) {
    return (
      <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
            <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Edit Challan
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <div 
              ref={printRef} 
              className="bg-white text-black p-8 sm:p-12 md:p-16 rounded-2xl shadow-glass print:shadow-none print:p-0 print:rounded-none w-full"
              style={{ minHeight: "297mm", maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box" }}
            >
              <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
                <div className="max-w-[50%]">
                  {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-20 object-contain mb-4" />}
                  <h2 className="text-3xl font-display font-bold text-gray-900">{companyName || "Your Company Name"}</h2>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-light text-cyan-600 uppercase tracking-widest mb-3">Delivery Challan</h1>
                  <p className="text-gray-600 mb-1">Challan #: <span className="font-medium text-gray-900">{challanNo}</span></p>
                  <p className="text-gray-600">Date: <span className="font-medium text-gray-900">{date}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Consignee (Receiver)</h3>
                  <p className="text-xl font-medium text-gray-900">{consignee || "Receiver Name"}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Transport Details</h3>
                  <div className="space-y-1">
                    <p className="text-gray-600">Transporter: <span className="font-medium text-gray-900">{transporter || "-"}</span></p>
                    <p className="text-gray-600">Vehicle No: <span className="font-medium text-gray-900">{vehicleNo || "-"}</span></p>
                  </div>
                </div>
              </div>

              <table className="w-full mb-12 border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Sr. No</th>
                    <th className="py-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider">Description of Goods</th>
                    <th className="py-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-5 text-gray-600">{idx + 1}</td>
                      <td className="py-5 text-gray-800">{item.description || "-"}</td>
                      <td className="py-5 text-right text-gray-800 font-medium">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end mt-24 pt-8">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Receiver&apos;s Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <Button onClick={() => setShowPreview(true)} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 font-semibold gap-2">
            <Eye className="h-4 w-4" /> Show Preview
          </Button>
        </div>
      </div>
    </div>
  )
}
