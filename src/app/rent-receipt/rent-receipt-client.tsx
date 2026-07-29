"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Download, Eye, X, ZoomIn, ZoomOut, RotateCcw, Printer, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/shared/loading-screen"
import { tryNativeShare, openWhatsApp, openEmail } from "@/lib/share-utils"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const STORAGE_KEY = "qf_rent_receipt"

interface SavedReceipt {
  id: string
  date: string
  tenant: string
  data: RentReceiptData
}

interface RentReceiptData {
  tenantName: string
  landlordName: string
  landlordPan: string
  propertyAddress: string
  monthlyRent: string
  startDate: string
  endDate: string
  paymentDate: string
}

function loadSaved(): SavedReceipt | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function saveToStorage(data: RentReceiptData) {
  try {
    const saved: SavedReceipt = {
      id: `rent-${Date.now()}`,
      date: new Date().toISOString(),
      tenant: data.tenantName,
      data,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {}
}

export function RentReceiptClient() {
  const { toast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [zoom, setZoom] = useState(1)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [tenantName, setTenantName] = useState("")
  const [landlordName, setLandlordName] = useState("")
  const [landlordPan, setLandlordPan] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const numRent = parseFloat(monthlyRent) || 0

  const getState = useCallback((): RentReceiptData => ({
    tenantName, landlordName, landlordPan, propertyAddress, monthlyRent, startDate, endDate, paymentDate,
  }), [tenantName, landlordName, landlordPan, propertyAddress, monthlyRent, startDate, endDate, paymentDate])

  const setState = useCallback((d: RentReceiptData) => {
    setTenantName(d.tenantName || "")
    setLandlordName(d.landlordName || "")
    setLandlordPan(d.landlordPan || "")
    setPropertyAddress(d.propertyAddress || "")
    setMonthlyRent(d.monthlyRent || "")
    setStartDate(d.startDate || "")
    setEndDate(d.endDate || "")
    setPaymentDate(d.paymentDate || new Date().toISOString().split("T")[0])
  }, [])

  const getMonthLabel = () => {
    if (startDate) {
      const d = new Date(startDate)
      return MONTHS[d.getMonth()] + " " + d.getFullYear()
    }
    return "(Month)"
  }

  const getPeriod = () => {
    if (!startDate && !endDate) return "______"
    const s = startDate ? new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "______"
    const e = endDate ? new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "______"
    return `${s} to ${e}`
  }

  const validateEssentialFields = useCallback(() => {
    if (!tenantName) { toast({ title: "Tenant name is required", variant: "destructive" }); return false }
    if (!landlordName) { toast({ title: "Landlord name is required", variant: "destructive" }); return false }
    if (!numRent || numRent <= 0) { toast({ title: "Valid monthly rent is required", variant: "destructive" }); return false }
    if (!propertyAddress) { toast({ title: "Property address is required", variant: "destructive" }); return false }
    return true
  }, [tenantName, landlordName, numRent, propertyAddress, toast])

  const togglePreview = useCallback(() => {
    if (showPreview) {
      setShowPreview(false)
    } else if (validateEssentialFields()) {
      setShowPreview(true)
    }
  }, [showPreview, validateEssentialFields])

  const handleDownloadPDF = async (returnBlob?: boolean): Promise<Blob | void> => {
    setIsGenerating(true)
    try {
      const { exportNodeToPdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("rent-receipt-print-root")
      if (node) {
        const blob = await exportNodeToPdf(node, `rent-receipt.pdf`, true)
        if (returnBlob) return blob
        toast({ title: "Rent receipt PDF downloaded!" })
      }
    } catch {
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleWhatsAppShare = async () => {
    if (!validateEssentialFields()) return; setIsGenerating(true)
    try {
      const { exportNodeToPdf: pdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("rent-receipt-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `rent-receipt.pdf`
      const blob = await pdf(node, fileName, true)
      const msg = `Rent Receipt for ${getMonthLabel()} - ${tenantName || "Tenant"}`
      const shared = await tryNativeShare(blob, fileName, msg, msg)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openWhatsApp(msg)
      }
    } catch { toast({ title: "Failed to share", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const handleEmailReceipt = async () => {
    if (!validateEssentialFields()) return; setIsGenerating(true)
    try {
      const { exportNodeToPdf: pdf } = await import("@/components/invoice-templates/components")
      const node = document.getElementById("rent-receipt-print-root")
      if (!node) { toast({ title: "Could not generate PDF", variant: "destructive" }); setIsGenerating(false); return }
      const fileName = `rent-receipt.pdf`
      const blob = await pdf(node, fileName, true)
      const body = `Dear ${landlordName || "Landlord"},\n\nPlease find attached the rent receipt for ${getMonthLabel()}.\n\nThank you,\n${tenantName || "Tenant"}`
      const shared = await tryNativeShare(blob, fileName, "Rent Receipt", body)
      if (!shared) {
        const dlUrl = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = dlUrl; a.download = fileName; a.click(); URL.revokeObjectURL(dlUrl)
        openEmail("", `Rent Receipt - ${getMonthLabel()}`, body)
      }
    } catch { toast({ title: "Failed to send email", variant: "destructive" }) } finally { setIsGenerating(false) }
  }

  const handlePrint = () => { window.print() }

  const handleSave = () => {
    if (!validateEssentialFields()) return
    saveToStorage(getState())
    toast({ title: "Rent receipt saved as draft!", description: "Saved to your browser." })
  }

  const handleRevert = () => {
    const saved = loadSaved()
    if (!saved) {
      toast({ title: "No saved rent receipt found", variant: "destructive" })
      return
    }
    setState(saved.data)
    toast({ title: `Reverted to saved draft` })
  }

  const resetForm = () => {
    setTenantName(""); setLandlordName(""); setLandlordPan(""); setPropertyAddress(""); setMonthlyRent(""); setStartDate(""); setEndDate(""); setPaymentDate(new Date().toISOString().split("T")[0])
  }

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
      document.body.style.touchAction = "none"
      document.documentElement.style.touchAction = "none"
    } else {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""
      document.documentElement.style.touchAction = ""
      setZoom(1)
    }
    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.body.style.touchAction = ""
      document.documentElement.style.touchAction = ""
    }
  }, [showPreview])

  if (!mounted) return null

  const renderReceipt = () => (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", width: "100%", maxWidth: "750px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ background: "#fff", border: "2.5px solid #3aaa35", borderRadius: "4px", padding: "28px 32px 20px 32px", position: "relative", overflow: "hidden", minHeight: "260px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 60'%3E%3Cpolygon points='40,5 75,30 5,30' fill='%23d6f0d4' /%3E%3Crect x='10' y='30' width='60' height='25' fill='%23d6f0d4'/%3E%3Crect x='30' y='38' width='20' height='17' fill='%23b8e4b5'/%3E%3Crect x='15' y='33' width='14' height='12' fill='%23b8e4b5'/%3E%3Crect x='51' y='33' width='14' height='12' fill='%23b8e4b5'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 48'%3E%3Cpolygon points='30,4 56,22 4,22' fill='%23d6f0d4' /%3E%3Crect x='7' y='22' width='46' height='22' fill='%23d6f0d4'/%3E%3Crect x='21' y='30' width='18' height='14' fill='%23b8e4b5'/%3E%3Crect x='11' y='25' width='10' height='9' fill='%23b8e4b5'/%3E%3Crect x='39' y='25' width='10' height='9' fill='%23b8e4b5'/%3E%3C/svg%3E")`, backgroundSize: "170px 120px, 110px 80px", backgroundPosition: "center 60%, center 40%", backgroundRepeat: "no-repeat, no-repeat" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "26px", marginBottom: "20px", lineHeight: 1 }}>
            <span style={{ color: "#3aaa35", fontWeight: 700 }}>RENT RECEIPT</span>
            <span style={{ color: "#222", fontWeight: 400 }}> ({getMonthLabel()})</span>
          </h1>

          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                Received a sum of Rs.<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "90px", fontWeight: monthlyRent ? 700 : 400 }}>&nbsp;{monthlyRent ? `₹${numRent.toLocaleString("en-IN")}` : " "}&nbsp;</span>
                &nbsp;from Mr/Mrs <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "160px", fontWeight: tenantName ? 700 : 400 }}>&nbsp;{tenantName || " "}&nbsp;</span>
                &nbsp;towards the rent of property situated
              </div>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                At (Address) <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "280px", fontWeight: propertyAddress ? 700 : 400 }}>&nbsp;{propertyAddress || " "}&nbsp;</span>
              </div>
              <div style={{ fontSize: "14px", color: "#222", lineHeight: 2.1 }}>
                For the period <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "200px", fontWeight: (startDate || endDate) ? 700 : 400 }}>&nbsp;{getPeriod()}&nbsp;</span>
              </div>
            </div>
            <div style={{ width: "200px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", paddingTop: "4px" }}>
              <div style={{ width: "80px", height: "80px", border: "1.5px dashed #aaa", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "10px", color: "#aaa", marginBottom: "10px", alignSelf: "flex-end" }}>
                Revenue<br />Stamp
              </div>
              <div style={{ fontSize: "13.5px", color: "#222", lineHeight: 2.2 }}>
                <div style={{ fontWeight: 600 }}>Signature (landlord)</div>
                <div>Name <span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "120px", fontWeight: landlordName ? 700 : 400 }}>&nbsp;{landlordName || " "}&nbsp;</span></div>
                <div>PAN &nbsp;&nbsp;<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "120px", fontWeight: landlordPan ? 700 : 400 }}>&nbsp;{landlordPan || " "}&nbsp;</span></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "18px", fontSize: "14px", color: "#222" }}>
            Date:<span style={{ display: "inline-block", borderBottom: "1.5px solid #333", minWidth: "90px", fontWeight: 700 }}>&nbsp;{paymentDate}&nbsp;</span>
          </div>

          <div style={{ marginTop: "14px", fontSize: "11px", color: "#666", fontStyle: "italic" }}>
            Receipt Generated by QuickInvoice on <a href="https://quickinvoicepro.vercel.app" target="_blank" style={{ color: "#3aaa35", textDecoration: "none" }} rel="noreferrer">quickinvoicepro.vercel.app</a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {isGenerating && <LoadingScreen message="Generating PDF..." />}

      <div id="rent-receipt-print-root" className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        {renderReceipt()}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-300" style={{ overscrollBehavior: "contain" }}>
          <div className="relative w-full h-full flex flex-col max-w-[1200px] mx-auto bg-white/5 dark:bg-black/5 shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-display font-semibold hidden sm:block">Rent Receipt Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 ml-4 border border-border">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white dark:hover:bg-black shadow-sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white border-0 font-semibold" onClick={() => handleDownloadPDF()} disabled={isGenerating}>
                  <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            <div
              ref={previewContainerRef}
              className="flex-1 overflow-y-auto p-0 sm:p-2 md:p-4 flex flex-col items-center"
              style={{ cursor: "grab", overscrollBehavior: "contain" }}
            >
              <div
                className="shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white"
                style={{
                  width: "100%",
                  maxWidth: "210mm",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  margin: "0 auto",
                }}
              >
                <div className="p-4 sm:p-6 bg-gray-50 flex items-center justify-center">
                  {renderReceipt()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-display font-bold">New Rent Receipt</h1>
            <p className="text-xs text-muted-foreground">Generate a rent receipt for HRA tax exemption claims</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleRevert} title="Revert to last saved">
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Revert</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs flex" onClick={resetForm}>
              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Tenant & Landlord */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-emerald-500" />
                Tenant & Landlord Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Your Name (Tenant) *</Label>
                  <Input placeholder="Enter tenant name" value={tenantName} onChange={e => setTenantName(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Landlord Name *</Label>
                  <Input placeholder="Enter landlord name" value={landlordName} onChange={e => setLandlordName(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Landlord PAN (Required if rent &gt; ₹8,333/month)</Label>
                <Input placeholder="ABCDE1234F" value={landlordPan} onChange={e => setLandlordPan(e.target.value.toUpperCase())} className="h-9 text-sm uppercase" />
              </div>
            </section>

            {/* Property & Rent */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-blue-500" />
                Property & Rent Details
              </h3>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Rented Property Address *</Label>
                <Textarea placeholder="Full address of the rented property" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} className="min-h-16 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Monthly Rent (₹) *</Label>
                  <Input type="number" step="any" placeholder="0" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Receipt Date</Label>
                  <Input type="date" className="h-9 text-sm" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
              </div>
            </section>

            {/* Rental Period */}
            <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-violet-500" />
                Rental Period
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Start Date</Label>
                  <Input type="date" className="h-9 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date</Label>
                  <Input type="date" className="h-9 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-3 pb-6">
              <Button onClick={togglePreview} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white border-0 font-semibold flex-1">
                <Eye className="h-4 w-4" /> SHOW PREVIEW
              </Button>
              <button onClick={handleWhatsAppShare} title="Share on WhatsApp" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
                <img src="/wh.svg" alt="WhatsApp" className="h-5 w-5" />
              </button>
              <button onClick={handleEmailReceipt} title="Email Receipt" className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-input bg-background shadow-sm transition-colors hover:bg-accent cursor-pointer">
                <img src="/email.svg" alt="Email" className="h-5 w-5" />
              </button>
              <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
