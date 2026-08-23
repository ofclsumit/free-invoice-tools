"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Eye, RotateCcw, Plus, Trash2, Save,
  Building2, UserCheck, CalendarRange, TrendingUp, TrendingDown,
  Wallet, FileText, Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePreviewData } from "@/lib/preview-store"
import { savePreviewSession, consumePreviewSession } from "@/lib/preview-session"
import { numberToWords } from "@/components/invoice-templates/data/invoiceTypes"
import { ImageUploadField, type ImageEditSettings, DEFAULT_IMAGE_EDIT_SETTINGS } from "@/components/shared/image-editor"

const STORAGE_KEY = "qf_salary_slip"

export interface SalarySlipData {
  companyName: string
  companyLogo: string
  companyAddress: string
  companyPhone?: string
  companyEmail?: string
  companyGstin?: string
  employeeName: string
  employeeId: string
  designation: string
  department: string
  joiningDate?: string
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
  otherEarnings?: string
  pf: string
  esi: string
  profTax: string
  tds: string
  otherDeductions?: string
  notes?: string
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

  // Employer Information
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [logoOriginal, setLogoOriginal] = useState("")
  const [logoSettings, setLogoSettings] = useState<ImageEditSettings>(DEFAULT_IMAGE_EDIT_SETTINGS)
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyGstin, setCompanyGstin] = useState("")

  // Employee Profile
  const [employeeName, setEmployeeName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [joiningDate, setJoiningDate] = useState("")
  const [pan, setPan] = useState("")
  const [uan, setUan] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")

  // Pay Period & Attendance
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().split("T")[0].slice(0, 7))
  const [paidDays, setPaidDays] = useState("30")
  const [lopDays, setLopDays] = useState("0")
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0])

  // Earnings Breakdown
  const [basic, setBasic] = useState("")
  const [hra, setHra] = useState("")
  const [da, setDa] = useState("")
  const [conveyance, setConveyance] = useState("")
  const [medical, setMedical] = useState("")
  const [special, setSpecial] = useState("")
  const [otherEarnings, setOtherEarnings] = useState("")

  // Deductions Breakdown
  const [pf, setPf] = useState("")
  const [esi, setEsi] = useState("")
  const [profTax, setProfTax] = useState("")
  const [tds, setTds] = useState("")
  const [otherDeductions, setOtherDeductions] = useState("")

  // HR Remarks / Notes
  const [notes, setNotes] = useState("")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const b = parseFloat(basic) || 0
  const h = parseFloat(hra) || 0
  const d = parseFloat(da) || 0
  const c = parseFloat(conveyance) || 0
  const m = parseFloat(medical) || 0
  const s = parseFloat(special) || 0
  const oe = parseFloat(otherEarnings) || 0
  const totalEarnings = b + h + d + c + m + s + oe

  const pfAmt = parseFloat(pf) || 0
  const esiAmt = parseFloat(esi) || 0
  const ptAmt = parseFloat(profTax) || 0
  const tdsAmt = parseFloat(tds) || 0
  const odAmt = parseFloat(otherDeductions) || 0
  const totalDeductions = pfAmt + esiAmt + ptAmt + tdsAmt + odAmt
  const netSalary = Math.max(0, totalEarnings - totalDeductions)

  const getState = useCallback((): SalarySlipData => ({
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin,
    employeeName, employeeId, designation, department, joiningDate, pan, uan, bankName, bankAccount,
    payPeriod, paidDays, lopDays, payDate,
    basic, hra, da, conveyance, medical, special, otherEarnings,
    pf, esi, profTax, tds, otherDeductions, notes,
  }), [
    companyName, companyLogo, companyAddress, companyPhone, companyEmail, companyGstin,
    employeeName, employeeId, designation, department, joiningDate, pan, uan, bankName, bankAccount,
    payPeriod, paidDays, lopDays, payDate,
    basic, hra, da, conveyance, medical, special, otherEarnings,
    pf, esi, profTax, tds, otherDeductions, notes,
  ])

  const setState = useCallback((d: SalarySlipData) => {
    setCompanyName(d.companyName || "")
    setCompanyLogo(d.companyLogo || "")
    setCompanyAddress(d.companyAddress || "")
    setCompanyPhone(d.companyPhone || "")
    setCompanyEmail(d.companyEmail || "")
    setCompanyGstin(d.companyGstin || "")

    setEmployeeName(d.employeeName || "")
    setEmployeeId(d.employeeId || "")
    setDesignation(d.designation || "")
    setDepartment(d.department || "")
    setJoiningDate(d.joiningDate || "")
    setPan(d.pan || "")
    setUan(d.uan || "")
    setBankName(d.bankName || "")
    setBankAccount(d.bankAccount || "")

    setPayPeriod(d.payPeriod || new Date().toISOString().split("T")[0].slice(0, 7))
    setPaidDays(d.paidDays || "30")
    setLopDays(d.lopDays || "0")
    setPayDate(d.payDate || new Date().toISOString().split("T")[0])

    setBasic(d.basic || "")
    setHra(d.hra || "")
    setDa(d.da || "")
    setConveyance(d.conveyance || "")
    setMedical(d.medical || "")
    setSpecial(d.special || "")
    setOtherEarnings(d.otherEarnings || "")

    setPf(d.pf || "")
    setEsi(d.esi || "")
    setProfTax(d.profTax || "")
    setTds(d.tds || "")
    setOtherDeductions(d.otherDeductions || "")
    setNotes(d.notes || "")
  }, [])

  useEffect(() => {
    setMounted(true)
    const session = consumePreviewSession<SalarySlipData>("salary-slip")
    if (session?.formValues) {
      setState(session.formValues)
      if (session.extraState?.logoOriginal) setLogoOriginal(session.extraState.logoOriginal)
      if (session.extraState?.logoSettings) setLogoSettings(session.extraState.logoSettings)
    }
  }, [setState])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const validateEssentialFields = useCallback(() => {
    if (!employeeName.trim()) {
      toast({ title: "Employee name is required", variant: "destructive" })
      return false
    }
    if (!payPeriod.trim()) {
      toast({ title: "Pay period month is required", variant: "destructive" })
      return false
    }
    return true
  }, [employeeName, payPeriod, toast])

  const handleSave = () => {
    if (!validateEssentialFields()) return
    saveData(getState())
    toast({ title: "Salary slip saved as draft!", description: "Saved securely to your browser." })
  }

  const handleRevert = () => {
    const saved = loadSaved()
    if (!saved) {
      toast({ title: "No saved salary slip found", variant: "destructive" })
      return
    }
    setState(saved)
    toast({ title: "Reverted to saved draft" })
  }

  const resetForm = useCallback(() => {
    setCompanyName("")
    setCompanyLogo("")
    setLogoOriginal("")
    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS)
    setCompanyAddress("")
    setCompanyPhone("")
    setCompanyEmail("")
    setCompanyGstin("")
    setEmployeeName("")
    setEmployeeId("")
    setDesignation("")
    setDepartment("")
    setJoiningDate("")
    setPan("")
    setUan("")
    setBankName("")
    setBankAccount("")
    setPayPeriod(new Date().toISOString().split("T")[0].slice(0, 7))
    setPaidDays("30")
    setLopDays("0")
    setPayDate(new Date().toISOString().split("T")[0])
    setBasic("")
    setHra("")
    setDa("")
    setConveyance("")
    setMedical("")
    setSpecial("")
    setOtherEarnings("")
    setPf("")
    setEsi("")
    setProfTax("")
    setTds("")
    setOtherDeductions("")
    setNotes("")
  }, [])

  const handleShowPreview = useCallback(() => {
    if (!validateEssentialFields()) return
    const currentState = getState()
    savePreviewSession("salary-slip", currentState, {
      logoOriginal,
      logoSettings,
    })
    const id = savePreviewData({
      docType: "salary-slip",
      title: "Salary Slip Preview",
      fileName: `salary-slip-${(employeeName || "employee").toLowerCase().replace(/\s+/g, "-")}-${payPeriod}.pdf`,
      data: currentState,
    })
    router.push(`/preview/${id}`)
  }, [validateEssentialFields, getState, employeeName, payPeriod, router, logoOriginal, logoSettings])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Top Sticky Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-display font-bold">Salary Slip Generator</h1>
          <p className="text-xs text-muted-foreground">Generate professional employee payslips & payroll statements</p>
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

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Section 1: Employer Information */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            Employer / Company Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-start gap-4">
                <ImageUploadField
                  assetType="logo"
                  compact={true}
                  value={companyLogo}
                  originalValue={logoOriginal}
                  settings={logoSettings}
                  onChange={(editedUrl, orig, newSettings) => {
                    setCompanyLogo(editedUrl);
                    setLogoOriginal(orig);
                    setLogoSettings(newSettings);
                  }}
                  onRemove={() => {
                    setCompanyLogo("");
                    setLogoOriginal("");
                    setLogoSettings(DEFAULT_IMAGE_EDIT_SETTINGS);
                  }}
                />
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-medium">Company / Employer Name</Label>
                  <Input
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Office / Registered Address</Label>
              <Textarea
                placeholder="e.g. Level 4, Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103"
                value={companyAddress}
                onChange={e => setCompanyAddress(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Phone / Contact</Label>
              <Input
                placeholder="e.g. +91 80 1234 5678"
                value={companyPhone}
                onChange={e => setCompanyPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Email / HR Desk</Label>
              <Input
                placeholder="e.g. payroll@acmetech.com"
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company GSTIN / Registration (Optional)</Label>
              <Input
                placeholder="e.g. 29AAAAA0000A1Z5"
                value={companyGstin}
                onChange={e => setCompanyGstin(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Employee Profile */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <UserCheck className="h-3.5 w-3.5" />
            </span>
            Employee Profile
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Employee Name *</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={employeeName}
                onChange={e => setEmployeeName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Employee ID / Code</Label>
              <Input
                placeholder="e.g. EMP-204"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Designation / Role</Label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Department / Team</Label>
              <Input
                placeholder="e.g. Product Engineering"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date of Joining (Optional)</Label>
              <Input
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">PAN Number</Label>
              <Input
                placeholder="e.g. ABCDE1234F"
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
                className="h-9 text-sm font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">UAN / PF Number</Label>
              <Input
                placeholder="e.g. 101234567890"
                value={uan}
                onChange={e => setUan(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Salary Bank Name</Label>
              <Input
                placeholder="e.g. HDFC Bank Ltd"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Bank Account Number (Disbursement A/C)</Label>
              <Input
                placeholder="e.g. 50100234567891"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Pay Period & Attendance */}
        <section className="form-section">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <CalendarRange className="h-3.5 w-3.5" />
            </span>
            Pay Period & Attendance
          </h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Pay Period (Month) *</Label>
              <Input
                type="month"
                value={payPeriod}
                onChange={e => setPayPeriod(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Disbursement Date</Label>
              <Input
                type="date"
                value={payDate}
                onChange={e => setPayDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Total Paid Days</Label>
              <Input
                type="number"
                min="0"
                max="31"
                placeholder="30"
                value={paidDays}
                onChange={e => setPaidDays(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium">Loss of Pay (LOP) / Unpaid Leave</Label>
              <Input
                type="number"
                min="0"
                max="31"
                placeholder="0"
                value={lopDays}
                onChange={e => setLopDays(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Earnings Breakdown */}
        <section className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              Earnings Breakdown (₹)
            </h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              Gross: ₹{fmt(totalEarnings)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Basic Salary</Label>
              <Input type="number" min="0" placeholder="0.00" value={basic} onChange={e => setBasic(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">House Rent Allowance (HRA)</Label>
              <Input type="number" min="0" placeholder="0.00" value={hra} onChange={e => setHra(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Dearness Allowance (DA)</Label>
              <Input type="number" min="0" placeholder="0.00" value={da} onChange={e => setDa(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Conveyance Allowance</Label>
              <Input type="number" min="0" placeholder="0.00" value={conveyance} onChange={e => setConveyance(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Medical Allowance</Label>
              <Input type="number" min="0" placeholder="0.00" value={medical} onChange={e => setMedical(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Special Allowance</Label>
              <Input type="number" min="0" placeholder="0.00" value={special} onChange={e => setSpecial(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1 sm:col-span-3">
              <Label className="text-xs text-muted-foreground font-medium">Other / Performance Allowance</Label>
              <Input type="number" min="0" placeholder="0.00" value={otherEarnings} onChange={e => setOtherEarnings(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
          </div>
        </section>

        {/* Section 5: Deductions Breakdown */}
        <section className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <TrendingDown className="h-3.5 w-3.5" />
              </span>
              Deductions Breakdown (₹)
            </h2>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
              Total Deductions: ₹{fmt(totalDeductions)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Provident Fund (PF / EPF)</Label>
              <Input type="number" min="0" placeholder="0.00" value={pf} onChange={e => setPf(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Employee State Insurance (ESI)</Label>
              <Input type="number" min="0" placeholder="0.00" value={esi} onChange={e => setEsi(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">Professional Tax (PT)</Label>
              <Input type="number" min="0" placeholder="0.00" value={profTax} onChange={e => setProfTax(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-medium">TDS / Income Tax</Label>
              <Input type="number" min="0" placeholder="0.00" value={tds} onChange={e => setTds(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground font-medium">Other Deductions / Advance</Label>
              <Input type="number" min="0" placeholder="0.00" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} className="h-9 text-sm font-mono" />
            </div>
          </div>
        </section>

        {/* Section 6: Net Pay Summary & Notes */}
        <section className="form-section bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-gray-900 dark:to-blue-950/20 border-blue-200 dark:border-blue-900/60">
          <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            Net Salary Summary
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Earnings</span>
                <span className="font-semibold text-emerald-600 font-mono">₹{fmt(totalEarnings)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Deductions</span>
                <span className="font-semibold text-rose-600 font-mono">-₹{fmt(totalDeductions)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-base text-foreground">Net Take-Home Pay</span>
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400 font-mono tracking-tight">₹{fmt(netSalary)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                Amount in Words: <span className="font-medium text-foreground">{numberToWords(netSalary)}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">HR Remarks / Notes (Optional)</Label>
              <Textarea
                placeholder="e.g. Performance appraisal bonus included in this pay cycle."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* Bottom Action Area */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button
            onClick={handleShowPreview}
            className="gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0 font-semibold h-11 text-sm shadow-md flex-1"
          >
            <Eye className="h-4 w-4" /> SHOW PREVIEW & DOWNLOAD
          </Button>
        </div>
      </div>
    </div>
  )
}
