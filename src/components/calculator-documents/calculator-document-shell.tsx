"use client";

import React from "react";

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
  const pageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    boxSizing: "border-box",
    padding: "14mm 15mm",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontFamily: "Arial, Helvetica, sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  };

  return (
    <div
      id="calculator-print-root"
      className="document-page pdf-page"
      style={pageStyle}
    >
      <div>
        {/* Document Header */}
        <header style={{ borderBottom: "2px solid #111111", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{ height: "20px", width: "20px", borderRadius: "3px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "10pt", fontWeight: "bold", fontFamily: "monospace" }}>
                T
              </div>
              <span style={{ fontSize: "10pt", fontWeight: "bold", letterSpacing: "1.5px", color: "#666666", textTransform: "uppercase" }}>
                TURNIVO
              </span>
            </div>
            <h1 style={{ fontSize: "18pt", fontWeight: "bold", color: "#111111", margin: "4px 0 0 0", textTransform: "uppercase", letterSpacing: "-0.5px" }}>
              {title}
            </h1>
            <p style={{ fontSize: "10pt", color: "#555555", margin: "3px 0 0 0", fontWeight: "normal" }}>
              {subtitle}
            </p>
          </div>

          <div style={{ textAlign: "right", fontSize: "9.5pt", color: "#444444", lineHeight: "1.4" }}>
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName || "Company Logo"}
                style={{ height: "32px", objectFit: "contain", marginLeft: "auto", marginBottom: "4px", display: "block" }}
              />
            )}
            {companyName && (
              <p style={{ fontWeight: "bold", color: "#111111", fontSize: "10.5pt", margin: "0 0 2px 0" }}>{companyName}</p>
            )}
            <div suppressHydrationWarning>
              <span style={{ color: "#666666" }}>Date:</span> <strong>{generatedDate}</strong>
            </div>
            <div suppressHydrationWarning>
              <span style={{ color: "#666666" }}>Ref ID:</span> <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{reportId}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Report Content */}
        <main style={{ width: "100%" }}>{children}</main>
      </div>

      {/* Document Footer */}
      <footer style={{ borderTop: "1px solid #D6D6D6", paddingTop: "8px", marginTop: "16px", fontSize: "8.5pt", color: "#666666", lineHeight: "1.35" }}>
        <p style={{ margin: "0 0 6px 0" }}>{disclaimer}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #EAEAEA", paddingTop: "6px", fontSize: "9pt" }}>
          <span>Generated with <strong>TURNIVO</strong> • Business Diagnostic & Financial Tools</span>
          <span style={{ fontWeight: "bold", color: "#111111" }}>turnivo.in</span>
        </div>
      </footer>
    </div>
  );
}
