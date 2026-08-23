"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface BreakEvenDocumentProps {
  title?: string;
  fixedCosts: number;
  variableCost: number;
  sellingPrice: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  targetUnits?: number;
  targetRevenue?: number;
  companyName?: string;
  companyLogo?: string;
}

export function BreakEvenDocument({
  title = "Break-Even & Cost-Volume-Profit Analysis Report",
  fixedCosts,
  variableCost,
  sellingPrice,
  breakEvenUnits,
  breakEvenRevenue,
  contributionMargin,
  contributionMarginRatio,
  targetUnits,
  targetRevenue,
  companyName,
  companyLogo,
}: BreakEvenDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Generate volume analysis table around break-even point
  const baseUnits = Math.max(10, Math.round(breakEvenUnits));
  const testPoints = [
    Math.round(baseUnits * 0.5),
    Math.round(baseUnits * 0.75),
    baseUnits,
    Math.round(baseUnits * 1.25),
    Math.round(baseUnits * 1.5),
  ];

  return (
    <CalculatorDocumentShell
      title={title}
      subtitle="Financial Feasibility & Cost-Volume-Profit Assessment"
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Break-Even Volume Requirement
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {Math.ceil(breakEvenUnits).toLocaleString("en-IN")} Units
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Minimum production/sales threshold to avoid operating loss
          </p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto space-y-1">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Break-Even Revenue</p>
            <p className="text-base font-bold text-slate-900">₹{fmt(breakEvenRevenue)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Contribution Margin Ratio</p>
            <p className="text-sm font-bold text-slate-700">{contributionMarginRatio.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Cost & Pricing Inputs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Total Fixed Overhead
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(fixedCosts)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Selling Price / Unit
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(sellingPrice)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Variable Cost / Unit
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(variableCost)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              Unit Contribution
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(contributionMargin)}</span>
          </div>
        </div>
      </div>

      {/* Volume & Profitability Sensitivity Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Volume & Profitability Sensitivity Schedule
        </h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Sales Units</th>
                <th className="p-2.5 text-right">Total Revenue</th>
                <th className="p-2.5 text-right">Variable Costs</th>
                <th className="p-2.5 text-right">Fixed Costs</th>
                <th className="p-2.5 text-right">Total Expenses</th>
                <th className="p-2.5 text-right">Net Operating Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
              {testPoints.map((units, idx) => {
                const rev = units * sellingPrice;
                const vc = units * variableCost;
                const exp = vc + fixedCosts;
                const profit = rev - exp;
                const isBe = units === baseUnits;

                return (
                  <tr key={idx} className={isBe ? "bg-slate-100/70 font-semibold" : ""}>
                    <td className="p-2">
                      {units.toLocaleString("en-IN")} Units
                      {isBe && <span className="ml-1.5 text-[9px] uppercase px-1 py-0.2 bg-slate-900 text-white rounded">Break-Even</span>}
                    </td>
                    <td className="p-2 text-right">₹{fmt(rev)}</td>
                    <td className="p-2 text-right text-slate-600">₹{fmt(vc)}</td>
                    <td className="p-2 text-right text-slate-600">₹{fmt(fixedCosts)}</td>
                    <td className="p-2 text-right text-slate-700">₹{fmt(exp)}</td>
                    <td className={`p-2 text-right font-medium ${profit >= 0 ? "text-slate-900" : "text-slate-500"}`}>
                      ₹{fmt(profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Note */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">CVP Formula & Strategic Insights:</p>
        <p className="leading-relaxed">
          Break-even Point (Units) = <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] mx-1 font-mono">Fixed Costs ÷ (Selling Price - Variable Cost)</code>.
          Every additional unit sold beyond {Math.ceil(breakEvenUnits).toLocaleString("en-IN")} units contributes exactly ₹{fmt(contributionMargin)} pure profit toward operational growth.
        </p>
      </div>
    </CalculatorDocumentShell>
  );
}
