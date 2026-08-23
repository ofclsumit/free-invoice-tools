"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface CommissionDocumentProps {
  title?: string;
  totalSales: number;
  commissionRate: number;
  commissionEarned: number;
  baseSalary?: number;
  totalPayout: number;
  tiers?: Array<{
    tier: string;
    salesRange: string;
    rate: number;
    amount: number;
  }>;
  companyName?: string;
  companyLogo?: string;
}

export function CommissionDocument({
  title = "Sales Commission & Incentive Payout Statement",
  totalSales,
  commissionRate,
  commissionEarned,
  baseSalary = 0,
  totalPayout,
  tiers = [],
  companyName,
  companyLogo,
}: CommissionDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <CalculatorDocumentShell
      title={title}
      subtitle="Performance Incentive & Variable Compensation Breakdown"
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Compensation Payout
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">₹{fmt(totalPayout)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Includes base compensation plus performance commission of ₹{fmt(commissionEarned)}
          </p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto space-y-1">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Sales Generated</p>
            <p className="text-base font-bold text-slate-900">₹{fmt(totalSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Effective Commission Rate</p>
            <p className="text-sm font-bold text-slate-700">{commissionRate}%</p>
          </div>
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Earnings & Target Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Gross Sales Volume
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(totalSales)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Base Remuneration
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(baseSalary)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Incentive Rate
            </span>
            <span className="font-semibold text-slate-900">{commissionRate}%</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Variable Earnings
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(commissionEarned)}</span>
          </div>
        </div>
      </div>

      {/* Tiered Breakdown Table if multiple tiers exist */}
      {tiers.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            Tiered Incentive Slabs
          </h2>
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Incentive Tier</th>
                  <th className="p-2.5">Sales Bracket</th>
                  <th className="p-2.5 text-center">Rate</th>
                  <th className="p-2.5 text-right">Commission Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                {tiers.map((t, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium">{t.tier}</td>
                    <td className="p-2.5">{t.salesRange}</td>
                    <td className="p-2.5 text-center font-mono">{t.rate}%</td>
                    <td className="p-2.5 text-right font-semibold">₹{fmt(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compensation Policy Note */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Payout Policy & Authorization:</p>
        <p className="leading-relaxed">
          Commissions are calculated against verified realized invoices. Subject to standard statutory TDS withholdings under Section 194H of the Indian Income Tax Act where applicable.
        </p>
      </div>
    </CalculatorDocumentShell>
  );
}
