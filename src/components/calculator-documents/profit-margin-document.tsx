"use client";

import React from "react";
import { CalculatorDocumentShell } from "./calculator-document-shell";

export interface ProfitMarginDocumentProps {
  title?: string;
  isDiscount?: boolean;
  costPrice: number;
  sellingPrice: number;
  profitOrDiscountAmount: number;
  percentage: number;
  markupPercentage?: number;
  units?: number;
  companyName?: string;
  companyLogo?: string;
}

export function ProfitMarginDocument({
  title = "Profit Margin & Pricing Analysis Report",
  isDiscount = false,
  costPrice,
  sellingPrice,
  profitOrDiscountAmount,
  percentage,
  markupPercentage,
  units = 1,
  companyName,
  companyLogo,
}: ProfitMarginDocumentProps) {
  const fmt = (n?: number) =>
    (n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalRevenue = sellingPrice * units;
  const totalCost = costPrice * units;
  const totalProfitOrSavings = profitOrDiscountAmount * units;

  return (
    <CalculatorDocumentShell
      title={isDiscount ? "Discount & Price Reduction Report" : title}
      subtitle={isDiscount ? "Commercial Discount & Customer Savings Analysis" : "Commercial Margins, Markup & Unit Economics"}
      companyName={companyName}
      companyLogo={companyLogo}
    >
      {/* Primary Result Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isDiscount ? "Total Effective Discount" : "Net Profit Margin"}
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {percentage.toFixed(2)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {isDiscount
              ? `Savings of ₹${fmt(profitOrDiscountAmount)} per unit on original catalog value`
              : `Margin on Selling Price with gross gain of ₹${fmt(profitOrDiscountAmount)} per unit`}
          </p>
        </div>
        <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto space-y-1">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">
              {isDiscount ? "Final Discounted Price" : "Final Selling Price"}
            </p>
            <p className="text-xl font-bold text-slate-900">₹{fmt(sellingPrice)}</p>
          </div>
          {!isDiscount && markupPercentage !== undefined && (
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">Cost Markup Rate</p>
              <p className="text-sm font-bold text-slate-700">{markupPercentage.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Inputs Breakdown */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
          Unit Valuation & Financial Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {isDiscount ? "List / Original Price" : "Unit Cost Price (COGS)"}
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(costPrice)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {isDiscount ? "Final Effective Price" : "Unit Selling Price"}
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(sellingPrice)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {isDiscount ? "Discount Amount" : "Unit Gross Profit"}
            </span>
            <span className="font-semibold text-slate-900">₹{fmt(profitOrDiscountAmount)}</span>
          </div>
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {isDiscount ? "Discount Percentage" : "Profit Margin %"}
            </span>
            <span className="font-semibold text-slate-900">{percentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Volume Summary Table if units > 1 */}
      {units > 1 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            Aggregate Batch Economics ({units.toLocaleString("en-IN")} Units)
          </h2>
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Total Revenue / List</th>
                  <th className="p-2.5 text-right">Total Cost</th>
                  <th className="p-2.5 text-right">Aggregate Profit / Savings</th>
                  <th className="p-2.5 text-right">Effective Rate</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 text-xs">
                <tr>
                  <td className="p-2.5 font-medium">₹{fmt(totalRevenue)}</td>
                  <td className="p-2.5 text-right">₹{fmt(totalCost)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">₹{fmt(totalProfitOrSavings)}</td>
                  <td className="p-2.5 text-right font-medium">{percentage.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Intelligence Note */}
      <div className="bg-slate-50/50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Margin & Pricing Formulation:</p>
        <p className="leading-relaxed">
          {isDiscount ? (
            "Discount is calculated as a direct percentage deduction from the catalog/retail list price. Final billing prices must factor in any applicable tax liabilities on the post-discount taxable amount."
          ) : (
            <>
              Profit Margin is calculated as <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] mx-1 font-mono">(Profit ÷ Revenue) x 100</code>, whereas Markup is <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] mx-1 font-mono">(Profit ÷ Cost) x 100</code>. Margin never exceeds 100%, whereas Markup can scale infinitely above 100%.
            </>
          )}
        </p>
      </div>
    </CalculatorDocumentShell>
  );
}
