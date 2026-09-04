"use client"

import React from "react"
import { numberToWords } from "@/components/invoice-templates/data/invoiceTypes"

export interface SalarySlipViewProps {
  companyName?: string
  companyLogo?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  companyGstin?: string
  employeeName?: string
  employeeId?: string
  designation?: string
  department?: string
  joiningDate?: string
  pan?: string
  uan?: string
  bankName?: string
  bankAccount?: string
  payPeriod?: string
  paidDays?: string
  lopDays?: string
  payDate?: string
  basic?: string
  hra?: string
  da?: string
  conveyance?: string
  medical?: string
  special?: string
  otherEarnings?: string
  pf?: string
  esi?: string
  profTax?: string
  tds?: string
  otherDeductions?: string
  notes?: string
}

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function SalarySlipView(props: SalarySlipViewProps) {
  const b = parseFloat(props.basic || "0") || 0
  const h = parseFloat(props.hra || "0") || 0
  const d = parseFloat(props.da || "0") || 0
  const c = parseFloat(props.conveyance || "0") || 0
  const m = parseFloat(props.medical || "0") || 0
  const s = parseFloat(props.special || "0") || 0
  const oe = parseFloat(props.otherEarnings || "0") || 0
  const totalEarnings = b + h + d + c + m + s + oe

  const pfAmt = parseFloat(props.pf || "0") || 0
  const esiAmt = parseFloat(props.esi || "0") || 0
  const ptAmt = parseFloat(props.profTax || "0") || 0
  const tdsAmt = parseFloat(props.tds || "0") || 0
  const odAmt = parseFloat(props.otherDeductions || "0") || 0
  const totalDeductions = pfAmt + esiAmt + ptAmt + tdsAmt + odAmt
  const netSalary = Math.max(0, totalEarnings - totalDeductions)

  return (
    <div
      className="bg-white text-[#111111] document-page pdf-page mx-auto"
      style={{ width: "210mm", minWidth: "210mm", maxWidth: "210mm", minHeight: "297mm", boxSizing: "border-box", padding: "14mm 15mm", fontFamily: "Arial, Helvetica, sans-serif", backgroundColor: "#ffffff" }}
    >
      {/* Top Header */}
      <div className="border-b-2 border-[#111111] pb-5 mb-5 flex justify-between items-start gap-6">
        <div className="max-w-[58%] space-y-1">
          {props.companyLogo && (
            <img src={props.companyLogo} alt="Logo" className="h-14 max-w-[160px] object-contain mb-2 p-1 border border-[#E5E5E5] rounded" />
          )}
          <h2 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight">
            {props.companyName || "Company Name"}
          </h2>
          {props.companyAddress && (
            <p className="text-[13px] text-[#444444] leading-normal whitespace-pre-line">{props.companyAddress}</p>
          )}
          <div className="flex flex-wrap gap-x-3 text-[13px] text-[#444444] pt-0.5">
            {props.companyPhone && <span><strong>Phone:</strong> {props.companyPhone}</span>}
            {props.companyEmail && <span><strong>Email:</strong> {props.companyEmail}</span>}
            {props.companyGstin && <span><strong>GSTIN:</strong> <span className="font-mono">{props.companyGstin}</span></span>}
          </div>
        </div>

        <div className="text-right shrink-0 min-w-[210px]">
          <h1 className="text-[24px] font-black text-[#111111] uppercase tracking-tight mb-1">
            PAYSLIP
          </h1>
          <div className="text-[13px] space-y-1 text-left bg-[#F8F8F8] border border-[#E0E0E0] p-2.5 rounded">
            <div className="flex justify-between gap-3">
              <span className="text-[#666666]">Pay Period:</span>
              <span className="font-bold text-[#111111]">{props.payPeriod || "—"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#666666]">Pay Date:</span>
              <span className="font-medium text-[#111111]">{props.payDate || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Profile Grid */}
      <section className="mb-5 p-3.5 bg-[#F8F8F8] border border-[#D6D6D6] rounded">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1 mb-2">
          Employee & Disbursement Particulars
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13.5px]">
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Employee Name</span>
            <strong className="text-[#111111]">{props.employeeName || "—"}</strong>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Employee ID</span>
            <strong className="font-mono text-[#111111]">{props.employeeId || "—"}</strong>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Designation</span>
            <span className="text-[#111111]">{props.designation || "—"}</span>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Department</span>
            <span className="text-[#111111]">{props.department || "—"}</span>
          </div>

          <div>
            <span className="text-[#666666] block text-[11px] uppercase">PAN</span>
            <span className="font-mono font-medium text-[#111111]">{props.pan || "—"}</span>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">UAN / PF No</span>
            <span className="font-mono text-[#111111]">{props.uan || "—"}</span>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Bank Name</span>
            <span className="text-[#111111]">{props.bankName || "—"}</span>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Bank Account No</span>
            <span className="font-mono text-[#111111]">{props.bankAccount || "—"}</span>
          </div>

          <div>
            <span className="text-[#666666] block text-[11px] uppercase">Paid Days</span>
            <strong className="font-mono text-[#111111]">{props.paidDays || "30"}</strong>
          </div>
          <div>
            <span className="text-[#666666] block text-[11px] uppercase">LOP / Unpaid Days</span>
            <span className="font-mono text-[#111111]">{props.lopDays || "0"}</span>
          </div>
          {props.joiningDate && (
            <div>
              <span className="text-[#666666] block text-[11px] uppercase">Joining Date</span>
              <span className="text-[#111111]">{props.joiningDate}</span>
            </div>
          )}
        </div>
      </section>

      {/* Earnings & Deductions Tables */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {/* Earnings Table */}
        <div className="border border-[#D6D6D6] rounded overflow-hidden">
          <div className="bg-[#181818] text-white px-3 py-2 text-[12px] uppercase font-bold tracking-wider flex justify-between">
            <span>Earnings</span>
            <span>Amount (₹)</span>
          </div>
          <div className="divide-y divide-[#E5E5E5] text-[13.5px] p-2 bg-white space-y-1">
            <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Basic Salary</span><span className="font-mono font-medium">{fmt(b)}</span></div>
            {h > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">House Rent Allowance (HRA)</span><span className="font-mono">{fmt(h)}</span></div>}
            {d > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Dearness Allowance (DA)</span><span className="font-mono">{fmt(d)}</span></div>}
            {c > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Conveyance Allowance</span><span className="font-mono">{fmt(c)}</span></div>}
            {m > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Medical Allowance</span><span className="font-mono">{fmt(m)}</span></div>}
            {s > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Special Allowance</span><span className="font-mono">{fmt(s)}</span></div>}
            {oe > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Other Earnings</span><span className="font-mono">{fmt(oe)}</span></div>}
          </div>
          <div className="bg-[#F8F8F8] border-t-2 border-[#181818] px-3 py-2 flex justify-between font-bold text-[14px]">
            <span>Total Gross Earnings</span>
            <span className="font-mono text-emerald-700">₹{fmt(totalEarnings)}</span>
          </div>
        </div>

        {/* Deductions Table */}
        <div className="border border-[#D6D6D6] rounded overflow-hidden">
          <div className="bg-[#181818] text-white px-3 py-2 text-[12px] uppercase font-bold tracking-wider flex justify-between">
            <span>Deductions</span>
            <span>Amount (₹)</span>
          </div>
          <div className="divide-y divide-[#E5E5E5] text-[13.5px] p-2 bg-white space-y-1">
            <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Provident Fund (PF)</span><span className="font-mono font-medium">{fmt(pfAmt)}</span></div>
            {esiAmt > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">ESI</span><span className="font-mono">{fmt(esiAmt)}</span></div>}
            {ptAmt > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Professional Tax (PT)</span><span className="font-mono">{fmt(ptAmt)}</span></div>}
            {tdsAmt > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">TDS / Income Tax</span><span className="font-mono">{fmt(tdsAmt)}</span></div>}
            {odAmt > 0 && <div className="flex justify-between py-1 px-1.5"><span className="text-[#444444]">Other Deductions</span><span className="font-mono">{fmt(odAmt)}</span></div>}
          </div>
          <div className="bg-[#F8F8F8] border-t-2 border-[#181818] px-3 py-2 flex justify-between font-bold text-[14px]">
            <span>Total Deductions</span>
            <span className="font-mono text-rose-700">₹{fmt(totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Net Salary Summary Block */}
      <div className="p-4 bg-[#F4F4F4] border-2 border-[#181818] rounded flex justify-between items-center mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#555555] block">
            Net Take-Home Salary
          </span>
          <span className="text-[13px] text-[#444444] italic block mt-0.5">
            Amount in Words: <strong>{numberToWords(netSalary)}</strong>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[24px] font-black text-[#111111] font-mono tracking-tight tabular-nums">
            ₹{fmt(netSalary)}
          </span>
        </div>
      </div>

      {/* HR Remarks */}
      {props.notes && (
        <div className="p-3 bg-[#FAFAFA] border border-[#D6D6D6] rounded text-[13px] text-[#444444] mb-6">
          <strong className="text-[#111111] text-[11px] uppercase tracking-wide block mb-0.5">HR / Payroll Remarks:</strong>
          <p className="whitespace-pre-line">{props.notes}</p>
        </div>
      )}

      {/* Signatures & Footer */}
      <div className="mt-8 pt-4 border-t border-[#D6D6D6] grid grid-cols-2 gap-8 text-[12px]">
        <div>
          <p className="text-[#666666] leading-relaxed">
            This is a computer-generated payslip and does not require a physical signature unless mandated.
          </p>
        </div>
        <div className="text-center ml-auto min-w-[180px]">
          <div className="h-10" />
          <div className="border-t border-[#111111] pt-1">
            <p className="font-bold uppercase tracking-wider text-[#111111]">Employer / Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
