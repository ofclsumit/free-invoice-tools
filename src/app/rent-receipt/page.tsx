"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Receipt, Download, Eye, Upload } from "lucide-react"

export default function RentReceiptPage() {
  const [landlord, setLandlord] = useState("")
  const [tenant, setTenant] = useState("")
  const [property, setProperty] = useState("")
  const [rentAmount, setRentAmount] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  
  if (!mounted) return null;

  const printRef = useRef<HTMLDivElement>(null)

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `RentReceipt_${month}_${year}`,
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  const monthLabel = month ? monthNames[parseInt(month) - 1] || month : "______"

  if (showPreview) {
    return (
      <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
            <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Edit Receipt
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <div
              ref={printRef}
              className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-glass print:shadow-none print:p-8 print:rounded-none w-full border border-gray-100"
              style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box" }}
            >
              <div className="flex justify-between items-start mb-8 border-b-2 border-emerald-600 pb-8">
                <div className="max-w-[50%]">
                  {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16 object-contain mb-3" />}
                  <h2 className="text-2xl font-display font-bold text-gray-900">{companyName || "Your Company Name"}</h2>
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-light text-emerald-600 uppercase tracking-widest mb-2">Rent Receipt</h1>
                  <p className="text-gray-500 text-sm">Date: <span className="font-medium text-gray-900">{paymentDate}</span></p>
                </div>
              </div>

              <div className="text-center mb-10">
                <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-1">Receipt for the month of</p>
                <p className="text-2xl font-display font-bold text-gray-900">{monthLabel} {year}</p>
              </div>

              <div className="space-y-6 mb-12">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold w-36 shrink-0">Received From:</span>
                  <span className="text-lg font-medium text-gray-900 border-b border-dashed border-gray-300 pb-1 flex-1">{tenant || "Tenant Name"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold w-36 shrink-0">Property Address:</span>
                  <span className="text-base text-gray-900 border-b border-dashed border-gray-300 pb-1 flex-1">{property || "Property Address"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold w-36 shrink-0">Rent Amount:</span>
                  <span className="text-2xl font-bold text-emerald-600 border-b border-dashed border-gray-300 pb-1 flex-1">₹{fmt(parseFloat(rentAmount) || 0)}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold w-36 shrink-0">Payment Mode:</span>
                  <span className="text-base text-gray-900 border-b border-dashed border-gray-300 pb-1 flex-1">{paymentMode}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mt-16 pt-8">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <span className="text-gray-500 text-sm uppercase tracking-wider">{landlord || "Landlord"}</span>
                  <p className="text-gray-400 text-xs mt-1">Landlord / Authorized Signatory</p>
                </div>
                <div className="text-gray-400 text-xs italic">
                  This is a computer-generated rent receipt
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
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
            <Receipt className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">Rent Receipt Generator</h1>
          <p className="text-muted-foreground mt-2">Generate a professional rent receipt for your tenant</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border p-6 space-y-5 shadow-glass">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company / Owner Name</Label>
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
              <Label className="text-xs font-medium">Landlord Name</Label>
              <Input placeholder="Landlord name" value={landlord} onChange={e => setLandlord(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tenant Name</Label>
              <Input placeholder="Tenant name" value={tenant} onChange={e => setTenant(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Property Address</Label>
            <Input placeholder="Full property address" value={property} onChange={e => setProperty(e.target.value)} className="h-9 text-sm" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Rent Amount (₹)</Label>
              <Input type="number" placeholder="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Payment Date</Label>
              <Input type="date" className="h-9 text-sm" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Month</Label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="h-9 text-sm w-full rounded-xl border border-border bg-transparent px-3 text-muted-foreground"
              >
                <option value="">Select month</option>
                {monthNames.map((m, i) => (
                  <option key={i} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Year</Label>
              <Input type="number" placeholder="2024" value={year} onChange={e => setYear(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Payment Mode</Label>
            <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-2">
              {["Cash", "Bank Transfer", "UPI", "Cheque"].map(m => (
                <button key={m} onClick={() => setPaymentMode(m)}
                  className={`py-2 rounded-xl text-xs font-medium transition-all ${paymentMode === m ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" : "border border-border text-muted-foreground hover:text-foreground"}`}
                >{m}</button>
              ))}
            </div>
          </div>

          <Button onClick={() => setShowPreview(true)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 font-semibold gap-2">
            <Eye className="h-4 w-4" /> Show Preview
          </Button>
        </div>
      </div>
    </div>
  )
}
