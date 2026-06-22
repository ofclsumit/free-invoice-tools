"use client"
import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Eye } from "lucide-react"
import { LoadingScreen } from "@/components/shared/loading-screen"
import {
  InvoicePreview,
  exportNodeToPdf,
} from "@/components/invoice-templates/components"

export function SalarySlipClient() {
  const [employeeName, setEmployeeName] = useState("")
  const [employeeCode, setEmployeeCode] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [payPeriod, setPayPeriod] = useState(new Date().toISOString().split("T")[0].slice(0, 7))

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

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null; // Prevent hydration mismatch
  
const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const node = document.getElementById("invoice-print-root");
      if (node) {
        await exportNodeToPdf(node, `salary-slip-${employeeName || "draft"}-${payPeriod}.pdf`);
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

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

  const previewContent = (
      <>
        {isGenerating && <LoadingScreen message="Generating PDF..." />}
        <div className="min-h-screen bg-mesh py-8 px-4 sm:py-12 flex flex-col h-screen overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-white">
                <ArrowLeft className="h-4 w-4" /> Edit Salary Slip
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Download className="h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-2xl shadow-glass bg-white border border-border pb-8">
              <InvoicePreview hideToolbar={true}>
                <div
                  className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-0 print:rounded-none w-full"
                  style={{ minHeight: "297mm", maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box" }}
                >
                  <div className="border-b-2 border-blue-600 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[50%]">
                        {companyLogo && <img src={companyLogo} alt="Company Logo" className="h-16 object-contain mb-3" />}
                        <h2 className="text-2xl font-display font-bold text-gray-900">{companyName || "Your Company Name"}</h2>
                      </div>
                      <div className="text-right">
                        <h1 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2">Salary Slip</h1>
                        <p className="text-gray-500 text-sm">Pay Period: <span className="font-medium text-gray-900">{payPeriod}</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Employee Name</p>
                      <p className="font-medium text-gray-900">{employeeName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Employee Code</p>
                      <p className="font-medium text-gray-900">{employeeCode || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Designation</p>
                      <p className="font-medium text-gray-900">{designation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Department</p>
                      <p className="font-medium text-gray-900">{department || "-"}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-display font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Earnings</h3>
                      <div className="space-y-2">
                        {[{ label: "Basic", val: b }, { label: "HRA", val: h }, { label: "DA", val: d }, { label: "Conveyance", val: c }, { label: "Medical", val: m }, { label: "Special", val: s }].map(item => (
                          <div key={item.label} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium text-gray-900">₹{fmt(item.val)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-800">Total Earnings</span>
                          <span className="text-blue-600">₹{fmt(totalEarnings)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Deductions</h3>
                      <div className="space-y-2">
                        {[{ label: "PF", val: pfAmt }, { label: "ESI", val: esiAmt }, { label: "Professional Tax", val: ptAmt }, { label: "TDS", val: tdsAmt }].map(item => (
                          <div key={item.label} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium text-gray-900">₹{fmt(item.val)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                          <span className="text-gray-800">Total Deductions</span>
                          <span className="text-red-600">₹{fmt(totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl flex justify-between items-center">
                    <span className="font-display font-bold text-xl text-gray-800">Net Salary</span>
                    <span className="font-display font-bold text-3xl text-blue-600">₹{fmt(netSalary)}</span>
                  </div>

                  <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between text-gray-400 text-xs">
                    <span>This is a computer-generated salary slip</span>
                    <span>Generated by QuoteFlow</span>
                  </div>
                </div>
              </InvoicePreview>
            </div>
          </div>
        </div>
      </>
    )
  

  return (
    <>
      <div className="absolute -left-[9999px] -top-[9999px]">{previewContent}</div>

    <div className="space-y-5">
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
          <Label className="text-xs font-medium">Employee Name</Label>
          <Input placeholder="Employee name" value={employeeName} onChange={e => setEmployeeName(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Employee Code</Label>
          <Input placeholder="EMP001" value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} className="h-9 text-sm" />
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Pay Period (YYYY-MM)</Label>
        <Input type="month" value={payPeriod} onChange={e => setPayPeriod(e.target.value)} className="h-9 text-sm" />
      </div>

      <div className="h-px bg-border" />

      <div>
        <Label className="text-xs font-medium block mb-3">Earnings (₹)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Basic</Label>
            <Input type="number" placeholder="0" value={basic} onChange={e => setBasic(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">HRA</Label>
            <Input type="number" placeholder="0" value={hra} onChange={e => setHra(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">DA</Label>
            <Input type="number" placeholder="0" value={da} onChange={e => setDa(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Conveyance</Label>
            <Input type="number" placeholder="0" value={conveyance} onChange={e => setConveyance(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Medical</Label>
            <Input type="number" placeholder="0" value={medical} onChange={e => setMedical(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Special</Label>
            <Input type="number" placeholder="0" value={special} onChange={e => setSpecial(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium block mb-3">Deductions (₹)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">PF</Label>
            <Input type="number" placeholder="0" value={pf} onChange={e => setPf(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">ESI</Label>
            <Input type="number" placeholder="0" value={esi} onChange={e => setEsi(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Prof. Tax</Label>
            <Input type="number" placeholder="0" value={profTax} onChange={e => setProfTax(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">TDS</Label>
            <Input type="number" placeholder="0" value={tds} onChange={e => setTds(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Earnings</span>
          <span className="font-semibold text-blue-600">₹{fmt(totalEarnings)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Deductions</span>
          <span className="font-semibold text-red-600">₹{fmt(totalDeductions)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-display font-bold text-lg">
          <span>Net Salary</span>
          <span className="text-blue-600">₹{fmt(netSalary)}</span>
        </div>
      </div>

      <Button onClick={handleDownloadPDF} disabled={isGenerating} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 font-semibold gap-2">
        <Download className="h-4 w-4" /> Download PDF
      </Button>
    </div>
  </>
  )
}
