"use client"

interface SalarySlipViewProps {
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

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 })

export function SalarySlipView(props: SalarySlipViewProps) {
  const b = parseFloat(props.basic) || 0
  const h = parseFloat(props.hra) || 0
  const d = parseFloat(props.da) || 0
  const c = parseFloat(props.conveyance) || 0
  const m = parseFloat(props.medical) || 0
  const s = parseFloat(props.special) || 0
  const totalEarnings = b + h + d + c + m + s
  const pfAmt = parseFloat(props.pf) || 0
  const esiAmt = parseFloat(props.esi) || 0
  const ptAmt = parseFloat(props.profTax) || 0
  const tdsAmt = parseFloat(props.tds) || 0
  const totalDeductions = pfAmt + esiAmt + ptAmt + tdsAmt
  const netSalary = totalEarnings - totalDeductions

  return (
    <div className="bg-white text-black p-8 sm:p-12 print:shadow-none print:p-0 print:rounded-none w-full" style={{ maxWidth: "210mm", margin: "0 auto", boxSizing: "border-box" }}>
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="max-w-[50%]">
            {props.companyLogo && <img src={props.companyLogo} alt="Logo" className="h-14 object-contain mb-3" />}
            <h2 className="text-xl font-bold text-gray-900">{props.companyName || "Company Name"}</h2>
            {props.companyAddress && <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{props.companyAddress}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-light text-blue-600 uppercase tracking-widest mb-1">Salary Slip</h1>
            <p className="text-gray-500 text-xs">Pay Period: <span className="font-medium text-gray-900">{props.payPeriod}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl text-sm">
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Employee Name</p><p className="font-semibold text-gray-900">{props.employeeName || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Employee ID</p><p className="font-semibold text-gray-900">{props.employeeId || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Designation</p><p className="font-semibold text-gray-900">{props.designation || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Department</p><p className="font-semibold text-gray-900">{props.department || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">PAN</p><p className="font-semibold text-gray-900">{props.pan || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">UAN</p><p className="font-semibold text-gray-900">{props.uan || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Bank Name</p><p className="font-semibold text-gray-900">{props.bankName || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Bank A/c No.</p><p className="font-semibold text-gray-900">{props.bankAccount || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Paid Days</p><p className="font-semibold text-gray-900">{props.paidDays || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">LOP Days</p><p className="font-semibold text-gray-900">{props.lopDays || "-"}</p></div>
        <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Pay Date</p><p className="font-semibold text-gray-900">{props.payDate || "-"}</p></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider">Earnings</h3>
          <div className="space-y-2">
            {[{ label: "Basic", val: b }, { label: "HRA", val: h }, { label: "DA", val: d }, { label: "Conveyance", val: c }, { label: "Medical", val: m }, { label: "Special Allowance", val: s }].map(item => (
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
          <h3 className="font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 text-sm uppercase tracking-wider">Deductions</h3>
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

      <div className="bg-blue-50 p-5 rounded-xl flex justify-between items-center">
        <span className="font-bold text-lg text-gray-800">Net Salary</span>
        <span className="font-bold text-2xl text-blue-600">₹{fmt(netSalary)}</span>
      </div>

      {netSalary > 0 && <p className="text-[10px] text-gray-400 mt-2">Amount in words: Rupees {fmt(netSalary)} only</p>}

      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between text-gray-400 text-xs">
        <span>This is a computer-generated salary slip</span>
        <span>Generated by Turnivo</span>
      </div>
    </div>
  )
}
