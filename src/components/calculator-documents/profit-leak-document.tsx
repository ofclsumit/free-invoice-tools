"use client"

import React from "react"
import {
  DiagnosticResult,
  formatCurrencyAmount,
} from "@/lib/profit-leak/diagnostic-engine"

export interface ProfitLeakDocumentProps {
  diagnostic: DiagnosticResult
  companyName?: string
  companyLogo?: string
}

export function ProfitLeakDocument({
  diagnostic,
  companyName,
  companyLogo,
}: ProfitLeakDocumentProps) {
  const {
    monthlyRevenue,
    annualRevenue,
    currency,
    country,
    businessType,
    coreCosts,
    additionalCosts,
    totalMonthlyLeakage,
    totalAnnualLeakage,
    leakagePercentageOfRevenue,
    topLeaks,
    biggestLeak,
    cashFlowPressures,
    totalCashFlowPressureAmount,
    scenarioModels,
    formulasApplied,
  } = diagnostic

  const countryLabel =
    country === "US"
      ? "United States"
      : country === "IN"
      ? "India"
      : "International"

  const businessTypeLabels: Record<string, string> = {
    retail: "Retail / Shop",
    service: "Service Business",
    freelance: "Freelance / Agency",
    ecommerce: "Ecommerce / D2C",
    wholesale: "Wholesale / Distribution",
    other: "General Enterprise",
  }

  const businessTypeLabel =
    businessTypeLabels[businessType] || "Commercial Enterprise"

  const fmt = (n: number) => formatCurrencyAmount(n, currency)

  const currentDate = new Date().toLocaleDateString(
    country === "IN" ? "en-IN" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )

  // Deterministic reference ID for stable SSR hydration
  const reportSeed =
    Math.abs(
      (monthlyRevenue * 31 +
        totalMonthlyLeakage * 17 +
        businessType.length * 13) %
        900000
    ) + 100000
  const reportId = `PLD-${reportSeed}`

  // Page container styles for fixed A4 portrait layout (210mm x 297mm)
  const pageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    maxHeight: "297mm",
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
    overflow: "hidden",
  }

  const documentWrapperStyle: React.CSSProperties = {
    width: "210mm",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  }

  return (
    <div id="calculator-print-root" style={documentWrapperStyle} className="pld-document-root">
      {/* =========================================================================
          PAGE 1: BUSINESS SNAPSHOT, ESTIMATED LEAKAGE & TOP RANKED LEAKS
          ========================================================================= */}
      <div className="pld-page" style={pageStyle}>
        <div>
          {/* Header */}
          <header style={{ borderBottom: "2px solid #111111", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "10pt", fontWeight: "bold", letterSpacing: "1.5px", color: "#666666", textTransform: "uppercase", marginBottom: "3px" }}>
                TURNIVO
              </div>
              <h1 style={{ fontSize: "20pt", fontWeight: "bold", color: "#111111", margin: 0, textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: "1.15" }}>
                PROFIT LEAK DETECTOR
              </h1>
              <p style={{ fontSize: "10.5pt", color: "#555555", margin: "4px 0 0 0", fontWeight: "normal" }}>
                Business Profitability & Cost Diagnostic Assessment
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: "9.5pt", color: "#444444", lineHeight: "1.4" }}>
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={companyName || "Company Logo"}
                  style={{ height: "34px", objectFit: "contain", marginLeft: "auto", marginBottom: "4px", display: "block" }}
                />
              )}
              {companyName && (
                <div style={{ fontWeight: "bold", color: "#111111", fontSize: "10.5pt", marginBottom: "2px" }}>
                  {companyName}
                </div>
              )}
              <div suppressHydrationWarning>
                <span style={{ color: "#666666" }}>Date:</span> <strong>{currentDate}</strong>
              </div>
              <div suppressHydrationWarning>
                <span style={{ color: "#666666" }}>Reference ID:</span> <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{reportId}</span>
              </div>
              <div>
                <span style={{ color: "#666666" }}>Profile:</span> {businessTypeLabel} ({countryLabel})
              </div>
            </div>
          </header>

          {/* Section: Business Snapshot & Primary Result Callout */}
          <section style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            {/* Business Snapshot Card */}
            <div style={{ flex: "1 1 50%", backgroundColor: "#F4F4F4", border: "1px solid #D6D6D6", borderRadius: "4px", padding: "12px 14px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1px solid #D6D6D6", paddingBottom: "6px", marginBottom: "8px" }}>
                Business Snapshot
              </div>
              <table style={{ width: "100%", fontSize: "9.5pt", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Monthly Revenue</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "bold", color: "#111111" }}>
                      {currency.symbol}{fmt(monthlyRevenue)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Core Operating Costs</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "500", color: "#111111" }}>
                      {currency.symbol}{fmt(coreCosts)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Additional Cost Drains</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "500", color: "#111111" }}>
                      {currency.symbol}{fmt(additionalCosts)}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ padding: "6px 0 2px 0", color: "#111111" }}>Estimated Monthly Leakage</td>
                    <td style={{ padding: "6px 0 2px 0", textAlign: "right", color: "#111111" }}>
                      {currency.symbol}{fmt(totalMonthlyLeakage)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dominant Primary Result Box */}
            <div style={{ flex: "1 1 50%", backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "4px", padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
              <div>
                <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#D6D6D6", marginBottom: "4px" }}>
                  Estimated Monthly Profit Leakage
                </div>
                <div style={{ fontSize: "24pt", fontWeight: "bold", color: "#FFFFFF", letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                  {currency.symbol}{fmt(totalMonthlyLeakage)}
                  <span style={{ fontSize: "11pt", fontWeight: "normal", color: "#D6D6D6", marginLeft: "4px" }}>/ month</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #333333", paddingTop: "8px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10pt", color: "#E0E0E0" }}>
                <span>
                  Annual Impact: <strong style={{ color: "#FFFFFF" }}>{currency.symbol}{fmt(totalAnnualLeakage)}/yr</strong>
                </span>
                <span style={{ backgroundColor: "#333333", color: "#FFFFFF", padding: "2px 6px", borderRadius: "3px", fontSize: "9pt", fontWeight: "bold" }}>
                  {leakagePercentageOfRevenue.toFixed(1)}% of Revenue
                </span>
              </div>
            </div>
          </section>

          {/* Section: Ranked Profit Leaks Table */}
          <section style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1.5px solid #111111", paddingBottom: "4px", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", margin: 0 }}>
                Top Profit Leaks (Ranked by Financial Impact)
              </h2>
              <span style={{ fontSize: "9pt", color: "#666666" }}>
                {topLeaks.length} Identified Leak Categor{topLeaks.length === 1 ? "y" : "ies"}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#F4F4F4", borderTop: "1px solid #D6D6D6", borderBottom: "1px solid #111111" }}>
                  <th style={{ padding: "8px 6px", textAlign: "center", width: "32px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>#</th>
                  <th style={{ padding: "8px 8px", textAlign: "left", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Leak Category</th>
                  <th style={{ padding: "8px 8px", textAlign: "right", width: "115px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Monthly</th>
                  <th style={{ padding: "8px 8px", textAlign: "right", width: "115px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Annual</th>
                  <th style={{ padding: "8px 8px", textAlign: "right", width: "85px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>% Revenue</th>
                  <th style={{ padding: "8px 6px", textAlign: "center", width: "95px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {topLeaks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px 10px", textAlign: "center", color: "#666666", fontStyle: "italic", borderBottom: "1px solid #E5E5E5" }}>
                      No significant cost leakage identified based on reported parameters.
                    </td>
                  </tr>
                ) : (
                  topLeaks.map((leak, idx) => (
                    <tr
                      key={leak.id || idx}
                      style={{
                        backgroundColor: idx === 0 ? "#FAFAFA" : idx % 2 === 1 ? "#FFFFFF" : "#FDFDFD",
                        borderBottom: "1px solid #EAEAEA",
                      }}
                    >
                      <td style={{ padding: "7px 6px", textAlign: "center", color: "#666666", fontWeight: "bold", fontFamily: "monospace", fontSize: "9.5pt" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "left", fontWeight: idx === 0 ? "bold" : "600", color: "#111111" }}>
                        {leak.category}
                        {idx === 0 && (
                          <span style={{ marginLeft: "8px", fontSize: "7.5pt", textTransform: "uppercase", padding: "1px 5px", backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "2px", fontWeight: "bold", verticalAlign: "middle" }}>
                            Biggest Leak
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: "bold", fontFamily: "Arial, sans-serif", color: "#111111" }}>
                        {currency.symbol}{fmt(leak.monthlyImpact)}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#555555", fontFamily: "Arial, sans-serif" }}>
                        {currency.symbol}{fmt(leak.annualImpact)}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#333333", fontWeight: "500" }}>
                        {leak.percentageOfRevenue.toFixed(1)}%
                      </td>
                      <td style={{ padding: "7px 6px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "7.5pt",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: "2px",
                            display: "inline-block",
                            backgroundColor:
                              leak.impactLevel === "HIGH IMPACT"
                                ? "#111111"
                                : leak.impactLevel === "MEDIUM IMPACT"
                                ? "#D6D6D6"
                                : "#EAEAEA",
                            color:
                              leak.impactLevel === "HIGH IMPACT"
                                ? "#FFFFFF"
                                : "#111111",
                          }}
                        >
                          {leak.impactLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* Page 1 Footer */}
        <footer style={{ borderTop: "1px solid #D6D6D6", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9pt", color: "#666666" }}>
          <div>
            Generated with <strong>TURNIVO</strong> • <span style={{ color: "#111111" }}>turnivo.in</span>
          </div>
          <div style={{ fontWeight: "bold", color: "#333333" }}>
            Page 1 of 2
          </div>
        </footer>
      </div>

      {/* =========================================================================
          PAGE 2: INVESTIGATION PRIORITIES, SCENARIO ANALYSIS, AUDIT TRAIL
          ========================================================================= */}
      <div className="pld-page" style={pageStyle}>
        <div>
          {/* Page 2 Header */}
          <header style={{ borderBottom: "1px solid #D6D6D6", paddingBottom: "8px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "10pt", fontWeight: "bold", color: "#111111", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                TURNIVO • PROFIT LEAK DETECTOR DIAGNOSTIC
              </span>
            </div>
            <div style={{ fontSize: "9pt", color: "#666666" }} suppressHydrationWarning>
              Ref ID: <strong style={{ fontFamily: "monospace", color: "#111111" }}>{reportId}</strong> • {currentDate}
            </div>
          </header>

          {/* Section: What to Investigate First (Top 3 Priorities) */}
          {topLeaks.length > 0 && (
            <section style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "11.5pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1.5px solid #111111", paddingBottom: "4px", marginBottom: "8px" }}>
                What To Investigate First (Top Priorities)
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {topLeaks.slice(0, 3).map((leak, idx) => (
                  <div
                    key={leak.id || idx}
                    style={{
                      backgroundColor: "#F8F8F8",
                      border: "1px solid #D6D6D6",
                      borderLeft: "3px solid #111111",
                      borderRadius: "3px",
                      padding: "8px 12px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                      <div style={{ fontWeight: "bold", fontSize: "10.5pt", color: "#111111" }}>
                        {idx + 1}. {leak.category}
                      </div>
                      <div style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#111111" }}>
                        {currency.symbol}{fmt(leak.monthlyImpact)}/mo{" "}
                        <span style={{ fontSize: "8.5pt", fontWeight: "normal", color: "#666666" }}>
                          ({currency.symbol}{fmt(leak.annualImpact)}/yr)
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: "9.5pt", color: "#444444", marginBottom: "4px", lineHeight: "1.35" }}>
                      <strong style={{ color: "#222222" }}>Why it matters:</strong> {leak.whyItMatters}
                    </div>

                    {leak.investigationSteps && leak.investigationSteps.length > 0 && (
                      <div style={{ fontSize: "9pt", color: "#333333", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "2px", padding: "5px 8px", marginTop: "4px" }}>
                        <strong style={{ color: "#111111", textTransform: "uppercase", fontSize: "8pt", letterSpacing: "0.5px" }}>Suggested Action:</strong>{" "}
                        {leak.investigationSteps.join(" • ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Scenario Analysis (Potential Improvement Schedule) */}
          {scenarioModels && scenarioModels.length > 0 && (
            <section style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "11.5pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1.5px solid #111111", paddingBottom: "4px", marginBottom: "8px" }}>
                Scenario Analysis (Potential Recovery Schedule)
              </h2>

              <div style={{ display: "flex", gap: "8px" }}>
                {scenarioModels.map((m) => (
                  <div
                    key={m.percentage}
                    style={{
                      flex: "1 1 25%",
                      backgroundColor: "#F4F4F4",
                      border: "1px solid #D6D6D6",
                      borderRadius: "3px",
                      padding: "8px 6px",
                      textAlign: "center",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ fontSize: "9pt", fontWeight: "bold", textTransform: "uppercase", color: "#555555", marginBottom: "2px" }}>
                      {m.percentage}% Reduction
                    </div>
                    <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#111111", lineHeight: "1.2" }}>
                      +{currency.symbol}{fmt(m.monthlySavings)}
                      <span style={{ fontSize: "7.5pt", fontWeight: "normal", color: "#666666", display: "block" }}>/ month</span>
                    </div>
                    <div style={{ fontSize: "8.5pt", color: "#444444", marginTop: "4px", borderTop: "1px solid #E0E0E0", paddingTop: "3px" }}>
                      +{currency.symbol}{fmt(m.annualSavings)}/yr
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Formula Transparency & Calculation Audit Trail */}
          {formulasApplied && formulasApplied.length > 0 && (
            <section style={{ marginBottom: "12px" }}>
              <h2 style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1px solid #D6D6D6", paddingBottom: "3px", marginBottom: "6px" }}>
                Calculation Audit Trail (Formula Transparency)
              </h2>
              <div style={{ backgroundColor: "#F8F8F8", border: "1px solid #D6D6D6", borderRadius: "3px", padding: "8px 10px", fontSize: "9pt", color: "#444444" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {formulasApplied.map((f, i) => (
                    <div key={i} style={{ lineHeight: "1.3" }}>
                      <strong style={{ color: "#111111" }}>{f.category}:</strong>{" "}
                      <span style={{ fontFamily: "monospace", backgroundColor: "#EAEAEA", padding: "1px 4px", borderRadius: "2px", fontSize: "8.5pt" }}>
                        {f.formula}
                      </span>{" "}
                      <span style={{ color: "#111111", fontWeight: "bold" }}>= {f.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section: Cash-Flow Pressure (Distinct from profit leaks) */}
          {cashFlowPressures && cashFlowPressures.length > 0 && (
            <section style={{ marginBottom: "10px" }}>
              <div style={{ border: "1px solid #D6D6D6", borderRadius: "3px", padding: "7px 10px", backgroundColor: "#FAFAFA" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                  <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase", color: "#111111" }}>
                    Cash-Flow Working Capital Pressure (Distinct from Lost Profit)
                  </div>
                  <div style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#111111" }}>
                    Total: {currency.symbol}{fmt(totalCashFlowPressureAmount)}
                  </div>
                </div>
                <div style={{ fontSize: "8.5pt", color: "#555555", lineHeight: "1.3" }}>
                  Working capital delays represent liquid funds temporarily trapped in receivables or inventory. Unlike profit leaks, these are not permanent wealth erosions, but operational liquidity drags.
                </div>
              </div>
            </section>
          )}

          {/* Section: Important Disclaimer */}
          <section style={{ borderTop: "1px solid #E0E0E0", paddingTop: "6px", fontSize: "8.5pt", color: "#666666", lineHeight: "1.35" }}>
            <strong style={{ color: "#333333" }}>Important Note & Disclaimer:</strong> The estimates and recommendations in this diagnostic report are generated deterministically from the financial metrics and operational parameters provided. They are intended for internal operational prioritization and benchmarking. This report does not constitute audited accounting records, tax advice, or certified public accounting (CPA/CA) services.
          </section>
        </div>

        {/* Page 2 Footer */}
        <footer style={{ borderTop: "1px solid #D6D6D6", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9pt", color: "#666666" }}>
          <div>
            Generated with <strong>TURNIVO</strong> • <span style={{ color: "#111111" }}>turnivo.in</span>
          </div>
          <div style={{ fontWeight: "bold", color: "#333333" }}>
            Page 2 of 2
          </div>
        </footer>
      </div>
    </div>
  )
}
