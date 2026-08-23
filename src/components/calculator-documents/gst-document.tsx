"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface GstDocumentProps {
  title?: string;
  mode: "exclusive" | "inclusive" | "reverse" | "split";
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  isInterstate?: boolean;
  companyName?: string;
  companyLogo?: string;
  notes?: string;
}

export function GstDocument({
  title = "GST Calculation & Tax Report",
  mode,
  baseAmount,
  gstRate,
  gstAmount,
  totalAmount,
  cgst,
  sgst,
  igst,
  isInterstate = false,
  companyName,
  companyLogo,
  notes,
}: GstDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calculatedCgst = cgst !== undefined ? cgst : isInterstate ? 0 : gstAmount / 2;
  const calculatedSgst = sgst !== undefined ? sgst : isInterstate ? 0 : gstAmount / 2;
  const calculatedIgst = igst !== undefined ? igst : isInterstate ? gstAmount : 0;

  const modeLabel =
    mode === "inclusive"
      ? "GST Inclusive (Tax extracted from Total)"
      : mode === "reverse"
      ? "Reverse GST (Base Value from Gross Amount)"
      : mode === "split"
      ? "GST Split (CGST + SGST / IGST Analysis)"
      : "GST Exclusive (Tax added to Net Amount)";

  return (
    <CalculatorDocumentShell
      title={title}
      subtitle="Comprehensive Goods and Services Tax Breakdown"
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Final Invoice Value
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{fmt(totalAmount)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{modeLabel}</p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total GST Tax Amount
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{fmt(gstAmount)}</p>
          <p className="text-[11px] text-slate-600 font-medium">At {gstRate}% GST Rate</p>
        </div>
      </div>

      {/* Input Summary Section */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Input & Valuation Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Calculation Type
            </span>
            <span className="font-semibold text-slate-900 capitalize">{mode}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Net Taxable Base
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(baseAmount)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Applicable GST Rate
            </span>
            <span className="font-semibold text-slate-900">{gstRate}%</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Supply Classification
            </span>
            <span className="font-semibold text-slate-900">
              {isInterstate ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}
            </span>
          </div>
        </div>
      </div>

      {/* Tax Component Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Tax Component Breakdown
        </h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Tax Component</th>
                <th className="p-2.5 text-center">Applicable Rate</th>
                <th className="p-2.5 text-right">Taxable Value</th>
                <th className="p-2.5 text-right">Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-2.5 font-medium">Net Taxable Amount (Base)</td>
                <td className="p-2.5 text-center text-slate-500">—</td>
                <td className="p-2.5 text-right">₹{fmt(baseAmount)}</td>
                <td className="p-2.5 text-right text-slate-500">₹0.00</td>
              </tr>
              {!isInterstate && (
                <>
                  <tr>
                    <td className="p-2.5 font-medium">Central GST (CGST)</td>
                    <td className="p-2.5 text-center font-mono">{(gstRate / 2).toFixed(1)}%</td>
                    <td className="p-2.5 text-right">₹{fmt(baseAmount)}</td>
                    <td className="p-2.5 text-right font-medium">₹{fmt(calculatedCgst)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">State / UT GST (SGST / UTGST)</td>
                    <td className="p-2.5 text-center font-mono">{(gstRate / 2).toFixed(1)}%</td>
                    <td className="p-2.5 text-right">₹{fmt(baseAmount)}</td>
                    <td className="p-2.5 text-right font-medium">₹{fmt(calculatedSgst)}</td>
                  </tr>
                </>
              )}
              {isInterstate && (
                <tr>
                  <td className="p-2.5 font-medium">Integrated GST (IGST)</td>
                  <td className="p-2.5 text-center font-mono">{gstRate}%</td>
                  <td className="p-2.5 text-right">₹{fmt(baseAmount)}</td>
                  <td className="p-2.5 text-right font-medium">₹{fmt(calculatedIgst)}</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
              <tr>
                <td colSpan={3} className="p-2.5 text-right uppercase text-[11px]">
                  Total Gross Amount (Including Taxes):
                </td>
                <td className="p-2.5 text-right text-sm">₹{fmt(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes / Regulatory Guidelines */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">GST Compliance Note:</p>
        <p className="leading-relaxed">
          For intra-state supplies, GST is split equally into Central GST (CGST) and State GST (SGST).
          For inter-state sales, Integrated GST (IGST) is charged in full. Ensure valid GSTIN numbers
          and correct HSN/SAC classifications are quoted on tax invoices for input tax credit eligibility.
        </p>
        {notes && <p className="pt-1 text-slate-700 italic border-t border-slate-200 mt-2">{notes}</p>}
      </div>
    </CalculatorDocumentShell>
  );
}
