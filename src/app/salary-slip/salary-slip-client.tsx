"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"

const STORAGE_KEY = "qf_salary_slip"

interface SalarySlipData {
  companyName: string
  companyLogo: string
  companyAddress: string
  employeeName: string
  employeeId: string
  designation: string
  department: string
  pan: string
  uan: string
  bankName: string
  bankAccount: string
  payPeriod: string
  paidDays: string
  lopDays: string
  payDate: string
  basic: string
  hra: string
  da: string
  conveyance: string
  medical: string
  special: string
  pf: string
  esi: string
  profTax: string
  tds: string
}

function loadSaved(): SalarySlipData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch { return null }
}

function saveData(data: SalarySlipData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function SalarySlipClient() {
  const { toast } = useToast()
  const router = useRouter()

  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [pan, setPan] = useState("")
  const [uan, setUan] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().split("T")[0].slice(0, 7))
  const [paidDays, setPaidDays] = useState("")
  const [lopDays, setLopDays] = useState("")
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0])
  const [basic, setBasic] = useState("")
  const [hra, setHra] = useState("")
  const [da, setDa] = useState("")
  const [conveyance, setConveyance] = useState("")
  const [medical, setMedical] = useState("")
  const [special, setSpecial] = useState("")
  const [pf, setPf] = useState("")
  const [esi, setEsi] = useState("")
  const [profTax, setProfTax] = useState("")
  const [tds, setTds] = useState("")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  const b = parseFloat(basic) || 0
  const h = parseFloat(hra) || 0
  const d = parseFloat(da) || 0
  const c = parseFloat(conveyance) || 0
  const m = parseFloat(medical) || 0
  const s = parseFloat(special) || 0
  const totalEarnings = b + h + d + c + m + s

  const pfAmt = parseFloat(pf) || 0
  const esiAmt = parseFloat(esi) || 0
  const ptAmt = parseFloat(profTax) || 0
  const tdsAmt = parseFloat(tds) || 0
  const totalDeductions = pfAmt + esiAmt + ptAmt + tdsAmt
  const netSalary = totalEarnings - totalDeductions

  const getState = useCallback((): SalarySlipData => ({
    companyName, companyLogo, companyAddress, employeeName, employeeId, designation, department, pan, uan, bankName, bankAccount,
    payPeriod, paidDays, lopDays, payDate, basic, hra, da, conveyance, medical, special, pf, esi, profTax, tds,
  }), [companyName, companyLogo, companyAddress, employeeName, employeeId, designation, department, pan, uan, bankName, bankAccount, payPeriod, paidDays, lopDays, payDate, basic, hra, da, conveyance, medical, special, pf, esi, profTax, tds])

  const setState = useCallback((d: SalarySlipData) => {
    setCompanyName(d.companyName || ""); setCompanyLogo(d.companyLogo || ""); setCompanyAddress(d.companyAddress || "")
    setEmployeeName(d.employeeName || ""); setEmployeeId(d.employeeId || ""); setDesignation(d.designation || ""); setDepartment(d.department || "")
    setPan(d.pan || ""); setUan(d.uan || ""); setBankName(d.bankName || ""); setBankAccount(d.bankAccount || "")
    setPayPeriod(d.payPeriod || new Date().toISOString().split("T")[0].slice(0, 7))
    setPaidDays(d.paidDays || ""); setLopDays(d.lopDays || ""); setPayDate(d.payDate || new Date().toISOString().split("T")[0])
    setBasic(d.basic || ""); setHra(d.hra || ""); setDa(d.da || ""); setConveyance(d.conveyance || ""); setMedical(d.medical || ""); setSpecial(d.special || "")
    setPf(d.pf || ""); setEsi(d.esi || ""); setProfTax(d.profTax || ""); setTds(d.tds || "")
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const validateEssentialFields = useCallback(() => {
    if (!employeeName) { toast({ title: "Employee name is required", variant: "destructive" }); return false }
    if (!payPeriod) { toast({ title: "Pay period is required", variant: "destructive" }); return false }
    return true
  }, [employeeName, payPeriod, toast])

  const handleSave = () => {
    if (!validateEssentialFields()) return
    saveData(getState())
    toast({ title: "Salary slip saved as draft!", description: "Saved to your browser." })
  }

  const handleRevert = () => {
    const saved = loadSaved()
    if (!saved) { toast({ title: "No saved salary slip found", variant: "destructive" }); return }
    setState(saved)
    toast({ title: "Reverted to saved draft" })
  }

  const resetForm = useCallback(() => {
    setCompanyName(""); setCompanyLogo(""); setCompanyAddress(""); setEmployeeName(""); setEmployeeId(""); setDesignation(""); setDepartment(""); setPan(""); setUan(""); setBankName(""); setBankAccount(""); setPayPeriod(new Date().toISOString().split("T")[0].slice(0, 7)); setPaidDays(""); setLopDays(""); setPayDate(new Date().toISOString().split("T")[0]); setBasic(""); setHra(""); setDa(""); setConveyance(""); setMedical(""); setSpecial(""); setPf(""); setEsi(""); setProfTax(""); setTds("")
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    const id = savePreviewData({
      docType: "salary-slip",
      title: "Salary Slip Preview",
      fileName: `salary-slip-${employeeName || "draft"}-${payPeriod}.pdf`,
      data: { companyName, companyLogo, companyAddress, employeeName, employeeId, designation, department, pan, uan, bankName, bankAccount, payPeriod, paidDays, lopDays, payDate, basic, hra, da, conveyance, medical, special, pf, esi, profTax, tds },
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, companyName, companyLogo, companyAddress, employeeName, employeeId, designation, department, pan, uan, bankName, bankAccount, payPeriod, paidDays, lopDays, payDate, basic, hra, da, conveyance, medical, special, pf, esi, profTax, tds, router])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">New Salary Slip</h1>
          <p className="text-xs text-muted-foreground">Generate professional salary slips for your employees</p>
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
          {/* Company Details */}
          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-blue-500" />
              Company Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company Name</Label>
                <Input placeholder="Your company name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company Logo (Optional)</Label>
                <div className="relative border-2 border-dashed border-border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center cursor-pointer group h-28 w-full max-w-[200px] overflow-hidden">
                  {companyLogo ? (
                    <>
                      <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={(e) => { e.preventDefault(); setCompanyLogo("") }}>
                        <Trash2 className="h-5 w-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                      <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">Upload Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Address (Optional)</Label>
              <Textarea placeholder="Company address" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="min-h-16 text-sm" />
            </div>
          </section>

          {/* Employee Details */}
          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-violet-500" />
              Employee Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Employee Name *</Label>
                <Input placeholder="Employee name" value={employeeName} onChange={e => setEmployeeName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Employee ID</Label>
                <Input placeholder="EMP001" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Designation</Label>
                <Input placeholder="Software Engineer" value={designation} onChange={e => setDesignation(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Department</Label>
                <Input placeholder="Engineering" value={department} onChange={e => setDepartment(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">PAN</Label>
                <Input placeholder="ABCDE1234F" value={pan} onChange={e => setPan(e.target.value.toUpperCase())} className="h-9 text-sm uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">UAN</Label>
                <Input placeholder="123456789012" value={uan} onChange={e => setUan(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Bank Name</Label>
                <Input placeholder="State Bank of India" value={bankName} onChange={e => setBankName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Bank A/c No.</Label>
                <Input placeholder="XXXXXX1234" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
          </section>

          {/* Pay Period */}
          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-emerald-500" />
              Pay Period
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Pay Period (Month) *</Label>
                <Input type="month" value={payPeriod} onChange={e => setPayPeriod(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Paid Days</Label>
                <Input type="number" placeholder="30" value={paidDays} onChange={e => setPaidDays(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Loss of Pay Days</Label>
                <Input type="number" placeholder="0" value={lopDays} onChange={e => setLopDays(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pay Date</Label>
              <Input type="date" className="h-9 text-sm" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </div>
          </section>

          {/* Earnings */}
          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-green-500" />
              Earnings (₹)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[{ label: "Basic", val: basic, set: setBasic }, { label: "HRA", val: hra, set: setHra }, { label: "DA", val: da, set: setDa }, { label: "Conveyance", val: conveyance, set: setConveyance }, { label: "Medical", val: medical, set: setMedical }, { label: "Special Allowance", val: special, set: setSpecial }].map(item => (
                <div key={item.label} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{item.label}</Label>
                  <Input type="number" placeholder="0" value={item.val} onChange={e => item.set(e.target.value)} className="h-8 text-xs" />
                </div>
              ))}
            </div>
            <div className="flex justify-end text-xs font-semibold text-blue-600">Total: ₹{fmt(totalEarnings)}</div>
          </section>

          {/* Deductions */}
          <section className="bg-white dark:bg-gray-900 border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-red-500" />
              Deductions (₹)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ label: "PF", val: pf, set: setPf }, { label: "ESI", val: esi, set: setEsi }, { label: "Professional Tax", val: profTax, set: setProfTax }, { label: "TDS", val: tds, set: setTds }].map(item => (
                <div key={item.label} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{item.label}</Label>
                  <Input type="number" placeholder="0" value={item.val} onChange={e => item.set(e.target.value)} className="h-8 text-xs" />
                </div>
              ))}
            </div>
            <div className="flex justify-end text-xs font-semibold text-red-600">Total: ₹{fmt(totalDeductions)}</div>
          </section>

          {/* Summary */}
          <section className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-semibold text-blue-600">₹{fmt(totalEarnings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-semibold text-red-600">₹{fmt(totalDeductions)}</span>
            </div>
            <div className="h-px bg-blue-200 dark:bg-blue-800" />
            <div className="flex justify-between font-bold text-lg">
              <span>Net Salary</span>
              <span className="text-blue-600">₹{fmt(netSalary)}</span>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex flex-wrap gap-3 pb-6">
            <Button onClick={handleShowPreview} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 font-semibold flex-1">
              <Eye className="h-4 w-4" /> SHOW PREVIEW
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
