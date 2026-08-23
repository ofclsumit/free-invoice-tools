"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Eye, RotateCcw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"

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
  const router = useRouter()

  const [tenantName, setTenantName] = useState("")
  const [landlordName, setLandlordName] = useState("")
  const [landlordPan, setLandlordPan] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
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

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const session = consumePreviewSession<RentReceiptData>("rent-receipt")
    if (session?.formValues) {
      setState(session.formValues)
    }
  }, [setState])

  const validateEssentialFields = useCallback(() => {
    if (!tenantName) { toast({ title: "Tenant name is required", variant: "destructive" }); return false }
    if (!landlordName) { toast({ title: "Landlord name is required", variant: "destructive" }); return false }
    if (!numRent || numRent <= 0) { toast({ title: "Valid monthly rent is required", variant: "destructive" }); return false }
    if (!propertyAddress) { toast({ title: "Property address is required", variant: "destructive" }); return false }
    return true
  }, [tenantName, landlordName, numRent, propertyAddress, toast])

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

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    const currentState = getState()
    savePreviewSession("rent-receipt", currentState)
    const id = savePreviewData({
      docType: "rent-receipt",
      title: "Rent Receipt Preview",
      fileName: `rent-receipt.pdf`,
      data: currentState,
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, getState, router])

  if (!mounted) return null

  return (
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
            <Button onClick={handleShowPreview} className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-600 text-white border-0 font-semibold flex-1">
              <Eye className="h-4 w-4" /> SHOW PREVIEW
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
