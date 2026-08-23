"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface InterestDocumentProps {
  title?: string;
  type: "simple" | "compound";
  principal: number;
  rate: number;
  timeYears: number;
  frequency?: string;
  totalInterest: number;
  totalAmount: number;
  yearlySchedule?: Array<{
    year: number;
    startingBalance: number;
    interest: number;
    cumulativeInterest: number;
    endingBalance: number;
  }>;
  companyName?: string;
  companyLogo?: string;
}

export function InterestDocument({
  title = "Interest Accrual & Growth Schedule Report",
  type,
  principal,
  rate,
  timeYears,
  frequency = "Annually",
  totalInterest,
  totalAmount,
  yearlySchedule = [],
  companyName,
  companyLogo,
}: InterestDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Generate breakdown if not provided
  const displaySchedule =
    yearlySchedule.length > 0
      ? yearlySchedule
      : Array.from({ length: Math.min(Math.ceil(timeYears), 25) }, (_, i) => {
          const year = i + 1;
          let ending = 0;
          let interestYear = 0;
          if (type === "compound") {
            const compoundFactor = Math.pow(1 + rate / 100, year);
            const prevFactor = Math.pow(1 + rate / 100, year - 1);
            ending = principal * compoundFactor;
            const prev = principal * prevFactor;
            interestYear = ending - prev;
          } else {
            interestYear = (principal * rate) / 100;
            ending = principal + interestYear * year;
          }
          return {
            year,
            startingBalance: ending - interestYear,
            interest: interestYear,
            cumulativeInterest: ending - principal,
            endingBalance: ending,
          };
        });

  return (
    <CalculatorDocumentShell
      title={title}
      subtitle={`Yield & Compounding Analysis (${type === "compound" ? "Compound Interest" : "Simple Interest"})`}
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Maturity / Accrued Value
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">₹{fmt(totalAmount)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Principal capital plus {type === "compound" ? "compounded" : "simple"} returns after {timeYears} Years
          </p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto space-y-1">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Interest Earned</p>
            <p className="text-xl font-bold text-slate-900">₹{fmt(totalInterest)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Effective Gain Rate</p>
            <p className="text-sm font-bold text-slate-700">
              {principal > 0 ? ((totalInterest / principal) * 100).toFixed(2) : "0.00"}%
            </p>
          </div>
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Investment Parameters
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Initial Principal
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
              Time Period
            </span>
            <span className="font-semibold text-slate-900">{timeYears} Years</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Compounding Frequency
            </span>
            <span className="font-semibold text-slate-900">
              {type === "compound" ? frequency : "Simple (Linear)"}
            </span>
          </div>
        </div>
      </div>

      {/* Growth Schedule Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Annual Growth & Balance Progression
        </h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 print:table-header-group">
              <tr>
                <th className="p-2.5">Timeline</th>
                <th className="p-2.5 text-right">Starting Balance</th>
                <th className="p-2.5 text-right">Annual Return</th>
                <th className="p-2.5 text-right">Cumulative Interest</th>
                <th className="p-2.5 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {displaySchedule.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/40" : ""}>
                  <td className="p-2 font-medium">Year {row.year}</td>
                  <td className="p-2 text-right">₹{fmt(row.startingBalance)}</td>
                  <td className="p-2 text-right text-slate-700">₹{fmt(row.interest)}</td>
                  <td className="p-2 text-right text-slate-700">₹{fmt(row.cumulativeInterest)}</td>
                  <td className="p-2 text-right font-semibold text-slate-900">₹{fmt(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td className="p-2.5 uppercase text-[10px]">Net Final Yield:</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(principal)}</td>
                <td className="p-2.5 text-right text-slate-500">—</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(totalInterest)}</td>
                <td className="p-2.5 text-right text-xs">₹{fmt(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Financial Formula Note */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Compounding Mechanics:</p>
        <p className="leading-relaxed">
          {type === "compound"
            ? "Compound interest calculates returns on both initial principal and accumulated prior earnings: A = P(1 + r/n)^(nt). Reinvesting earnings yields exponential capital expansion over longer durations."
            : "Simple interest calculates linear returns solely on original principal: SI = (P x R x T) / 100."}
        </p>
      </div>
    </CalculatorDocumentShell>
  );
}
