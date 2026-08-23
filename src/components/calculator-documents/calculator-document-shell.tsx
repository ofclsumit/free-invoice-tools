"use client";

import React from "react";
import { SiteLogo } from "@/components/shared/site-logo";

export interface CalculatorDocumentShellProps {
  title: string;
  subtitle?: string;
  companyName?: string;
  companyLogo?: string;
  generatedDate?: string;
  reportId?: string;
  children: React.ReactNode;
  disclaimer?: string;
}

export function CalculatorDocumentShell({
  title,
  subtitle = "Financial Calculator Report",
  companyName,
  companyLogo,
  generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  reportId = `RPT-${Math.floor(100000 + Math.random() * 900000)}`,
  children,
  disclaimer = "Figures and calculations presented in this document are estimates based on user-supplied inputs and standard financial formulas. Actual values may vary based on specific lending terms, tax rates, regulatory changes, or institutional rounding.",
}: CalculatorDocumentShellProps) {
  return (
    <div
      id="calculator-print-root"
      className="bg-white text-slate-900 font-sans p-8 sm:p-12 print:p-6 print:shadow-none w-full max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between box-border border border-slate-200 print:border-none shadow-sm"
      style={{
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div className="space-y-6">
        {/* Document Header */}
        <header className="border-b border-slate-200 pb-5 flex flex-row justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-white text-xs font-bold font-mono">
                T
              </div>
              <span className="text-sm font-bold tracking-tight uppercase text-slate-900">
                TURNIVO
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-2">
              {title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>

          <div className="text-right space-y-1">
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName || "Company Logo"}
                className="h-10 object-contain ml-auto mb-1"
              />
            )}
            {companyName && (
              <p className="text-xs font-bold text-slate-800">{companyName}</p>
            )}
            <div className="text-[11px] text-slate-500 space-y-0.5 mt-1">
              <p>
                <span className="font-semibold text-slate-700">Date:</span>{" "}
                {generatedDate}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Ref ID:</span>{" "}
                {reportId}
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Report Content */}
        <main className="space-y-6">{children}</main>
      </div>

      {/* Document Footer */}
      <footer className="border-t border-slate-200 pt-4 mt-8 space-y-2 text-[10px] text-slate-500">
        <p className="leading-relaxed">{disclaimer}</p>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-medium">
          <span>Generated with TURNIVO • Business & Financial Documents</span>
          <span className="text-slate-700 font-semibold">turnivo.in</span>
        </div>
      </footer>
    </div>
  );
}
