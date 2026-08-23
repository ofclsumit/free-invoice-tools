"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface EmiDocumentProps {
  title?: string;
  principal: number;
  rate: number;
  tenureYears: number;
  tenureMonths?: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule?: Array<{
    period: number | string;
    beginningBalance: number;
    emi: number;
    principal: number;
    interest: number;
    endingBalance: number;
  }>;
  companyName?: string;
  companyLogo?: string;
}

export function EmiDocument({
  title = "Loan EMI & Repayment Schedule Report",
  principal,
  rate,
  tenureYears,
  tenureMonths,
  emi,
  totalInterest,
  totalPayment,
  schedule = [],
  companyName,
  companyLogo,
}: EmiDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalMonths = tenureMonths !== undefined ? tenureMonths : Math.round(tenureYears * 12);
  const interestRatio = totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : "0.0";
  const principalRatio = totalPayment > 0 ? ((principal / totalPayment) * 100).toFixed(1) : "0.0";

  // If no detailed schedule is passed, generate yearly / periodic summary
  const displaySchedule =
    schedule.length > 0
      ? schedule.slice(0, 60) // Show up to 5 years / 60 periods cleanly
      : Array.from({ length: Math.min(Math.ceil(totalMonths / 12), 20) }, (_, i) => {
          const year = i + 1;
          const remainingFactor = Math.max(0, 1 - year / (totalMonths / 12));
          return {
            period: `Year ${year}`,
            beginningBalance: principal * (1 - (i) / (totalMonths / 12)),
            emi: emi * 12,
            principal: (principal / (totalMonths / 12)),
            interest: (totalInterest / (totalMonths / 12)),
            endingBalance: principal * remainingFactor,
          };
        });

  return (
    <CalculatorDocumentShell
      title={title}
      subtitle="Loan Repayment Schedule & Amortization Analysis"
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monthly Equated Installment (EMI)
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">₹{fmt(emi)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Payable monthly over {tenureYears} Years ({totalMonths} Months)
          </p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto space-y-1">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Interest</p>
            <p className="text-sm font-bold text-slate-800">₹{fmt(totalInterest)} ({interestRatio}%)</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Repayment</p>
            <p className="text-base font-bold text-slate-900">₹{fmt(totalPayment)}</p>
          </div>
        </div>
      </div>

      {/* Input Loan Parameters */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Loan Parameters & Assumptions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Principal Loan Amount
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(principal)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Annual Interest Rate
            </span>
            <span className="font-semibold text-slate-900">{rate}% p.a.</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Loan Duration
            </span>
            <span className="font-semibold text-slate-900">{tenureYears} Years</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Payment Mode
            </span>
            <span className="font-semibold text-slate-900">Monthly in Arrears</span>
          </div>
        </div>
      </div>

      {/* Repayment Breakdown Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Repayment Amortization Schedule
        </h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 print:table-header-group">
              <tr>
                <th className="p-2.5">Period</th>
                <th className="p-2.5 text-right">Opening Balance</th>
                <th className="p-2.5 text-right">Payment</th>
                <th className="p-2.5 text-right">Principal Paid</th>
                <th className="p-2.5 text-right">Interest Paid</th>
                <th className="p-2.5 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {displaySchedule.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/40" : ""}>
                  <td className="p-2 font-medium">{row.period}</td>
                  <td className="p-2 text-right">₹{fmt(row.beginningBalance)}</td>
                  <td className="p-2 text-right font-medium">₹{fmt(row.emi)}</td>
                  <td className="p-2 text-right text-slate-700">₹{fmt(row.principal)}</td>
                  <td className="p-2 text-right text-slate-700">₹{fmt(row.interest)}</td>
                  <td className="p-2 text-right font-semibold">₹{fmt(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="p-2.5 uppercase text-[10px]">Total Lifetime Cost:</td>
                <td className="p-2.5 text-right text-slate-500">—</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(totalPayment)}</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(principal)}</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(totalInterest)}</td>
                <td className="p-2.5 text-right text-xs">₹0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Lending Summary Note */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Amortization Note:</p>
        <p className="leading-relaxed">
          Monthly installment is calculated using standard reducing balance compounding formula:
          <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] mx-1 font-mono">
            EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
          </code>.
          Principal portion increases over time while interest portion progressively decreases with outstanding balance.
        </p>
      </div>
    </CalculatorDocumentShell>
  );
}
