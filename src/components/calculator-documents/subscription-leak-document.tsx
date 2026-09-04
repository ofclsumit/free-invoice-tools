"use client"

import React from "react"
import {
  DiagnosticResult,
  SupportedCurrency,
  formatCurrencyAmount,
  CATEGORY_LABELS,
  BILLING_LABELS,
  USAGE_LABELS,
  LAST_USED_LABELS,
} from "@/lib/subscription-leak/subscription-engine"

export interface SubscriptionLeakDocumentProps {
  diagnostic: DiagnosticResult
  currency: SupportedCurrency
  country: "US" | "IN" | "OTHER"
  userType: "personal" | "business"
  companyName?: string
  companyLogo?: string
}

export function SubscriptionLeakDocument({
  diagnostic,
  currency,
  country,
  userType,
  companyName,
  companyLogo,
}: SubscriptionLeakDocumentProps) {
  const {
    items,
    totalMonthlySpend,
    totalAnnualSpend,
    potentialMonthlyReviewAmount,
    potentialAnnualReviewAmount,
    reviewPercentageOfSpend,
    flaggedSubscriptions,
    biggestReviewItem,
    overlapGroups,
    priceIncreaseItems,
    categoryBreakdown,
  } = diagnostic

  const fmt = (n: number) => formatCurrencyAmount(n, currency)

  const currentDate = new Date().toLocaleDateString(
    country === "IN" ? "en-IN" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )

  const reportSeed =
    Math.abs(
      (Math.round(totalMonthlySpend * 37) +
        Math.round(potentialAnnualReviewAmount * 19) +
        items.length * 13) %
        900000
    ) + 100000
  const reportId = `SLD-${reportSeed}`

  const scenario1Savings =
    flaggedSubscriptions.length > 0 ? flaggedSubscriptions[0].annualCost : 0
  const scenario2Savings =
    flaggedSubscriptions.length > 1
      ? flaggedSubscriptions[0].annualCost + flaggedSubscriptions[1].annualCost
      : scenario1Savings

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
    <div id="calculator-print-root" style={documentWrapperStyle} className="sld-document-root">
      {/* =========================================================================
          PAGE 1: SUMMARY SNAPSHOT, PRIMARY REVIEW CALLOUT & FLAGGED SUBSCRIPTIONS
          ========================================================================= */}
      <div className="sld-page document-page pdf-page" style={pageStyle}>
        <div>
          {/* Header */}
          <header style={{ borderBottom: "2px solid #111111", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "10pt", fontWeight: "bold", letterSpacing: "1.5px", color: "#666666", textTransform: "uppercase", marginBottom: "3px" }}>
                TURNIVO
              </div>
              <h1 style={{ fontSize: "20pt", fontWeight: "bold", color: "#111111", margin: 0, textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: "1.15" }}>
                SUBSCRIPTION LEAK REPORT
              </h1>
              <p style={{ fontSize: "10.5pt", color: "#555555", margin: "4px 0 0 0", fontWeight: "normal" }}>
                Recurring Cost Review & Unused Subscription Finder
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: "9.5pt", color: "#444444", lineHeight: "1.4" }}>
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={companyName || "Logo"}
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
                <span style={{ color: "#666666" }}>Profile:</span> {userType === "business" ? "Business Accounts" : "Personal / Individual"}
              </div>
            </div>
          </header>

          {/* Section: Subscription Summary & Primary Review Callout */}
          <section style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            {/* Snapshot Card */}
            <div style={{ flex: "1 1 50%", backgroundColor: "#F4F4F4", border: "1px solid #D6D6D6", borderRadius: "4px", padding: "12px 14px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1px solid #D6D6D6", paddingBottom: "6px", marginBottom: "8px" }}>
                Subscription Summary
              </div>
              <table style={{ width: "100%", fontSize: "9.5pt", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Active Subscriptions</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "bold", color: "#111111" }}>
                      {items.length} tools / services
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Total Monthly Cost</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "bold", color: "#111111" }}>
                      {currency.symbol}{fmt(totalMonthlySpend)}/mo
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E5E5E5" }}>
                    <td style={{ padding: "5px 0", color: "#555555" }}>Total Yearly Cost</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: "500", color: "#111111" }}>
                      {currency.symbol}{fmt(totalAnnualSpend)}/yr
                    </td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ padding: "6px 0 2px 0", color: "#111111" }}>Subscriptions to Review</td>
                    <td style={{ padding: "6px 0 2px 0", textAlign: "right", color: "#111111" }}>
                      {flaggedSubscriptions.length} flagged
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dominant Primary Result Box */}
            <div style={{ flex: "1 1 50%", backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "4px", padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
              <div>
                <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#D6D6D6", marginBottom: "4px" }}>
                  Money You May Save (To Review)
                </div>
                <div style={{ fontSize: "24pt", fontWeight: "bold", color: "#FFFFFF", letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                  {currency.symbol}{fmt(potentialAnnualReviewAmount)}
                  <span style={{ fontSize: "11pt", fontWeight: "normal", color: "#D6D6D6", marginLeft: "4px" }}>/ year</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #333333", paddingTop: "8px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10pt", color: "#E0E0E0" }}>
                <span>
                  Monthly Equivalent: <strong style={{ color: "#FFFFFF" }}>{currency.symbol}{fmt(potentialMonthlyReviewAmount)}/mo</strong>
                </span>
                <span style={{ backgroundColor: "#333333", color: "#FFFFFF", padding: "2px 6px", borderRadius: "3px", fontSize: "9pt", fontWeight: "bold" }}>
                  {reviewPercentageOfSpend.toFixed(1)}% of Spend
                </span>
              </div>
            </div>
          </section>

          {/* Section: Flagged Subscriptions Table */}
          <section style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1.5px solid #111111", paddingBottom: "4px", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", margin: 0 }}>
                Subscriptions to Check (Ranked by Cost)
              </h2>
              <span style={{ fontSize: "9pt", color: "#666666" }}>
                {flaggedSubscriptions.length} Flagged Service{flaggedSubscriptions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#F4F4F4", borderTop: "1px solid #D6D6D6", borderBottom: "1px solid #111111" }}>
                  <th style={{ padding: "8px 6px", textAlign: "center", width: "32px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>#</th>
                  <th style={{ padding: "8px 8px", textAlign: "left", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Subscription</th>
                  <th style={{ padding: "8px 8px", textAlign: "left", width: "120px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Category</th>
                  <th style={{ padding: "8px 8px", textAlign: "left", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Reason to Check</th>
                  <th style={{ padding: "8px 8px", textAlign: "right", width: "95px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Monthly</th>
                  <th style={{ padding: "8px 8px", textAlign: "right", width: "105px", color: "#111111", fontWeight: "bold", fontSize: "9.5pt" }}>Yearly Cost</th>
                </tr>
              </thead>
              <tbody>
                {flaggedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px 10px", textAlign: "center", color: "#666666", fontStyle: "italic", borderBottom: "1px solid #E5E5E5" }}>
                      No subscriptions currently need review. All subscriptions appear active and regularly used.
                    </td>
                  </tr>
                ) : (
                  flaggedSubscriptions.map((f, idx) => (
                    <tr
                      key={f.item.id || idx}
                      style={{
                        backgroundColor: idx === 0 ? "#FAFAFA" : idx % 2 === 1 ? "#FFFFFF" : "#FDFDFD",
                        borderBottom: "1px solid #EAEAEA",
                      }}
                    >
                      <td style={{ padding: "7px 6px", textAlign: "center", color: "#666666", fontWeight: "bold", fontFamily: "monospace", fontSize: "9.5pt" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "left", fontWeight: "bold", color: "#111111" }}>
                        {f.item.name}
                        {idx === 0 && (
                          <span style={{ marginLeft: "6px", fontSize: "7.5pt", textTransform: "uppercase", padding: "1px 5px", backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "2px", fontWeight: "bold", verticalAlign: "middle" }}>
                            Top Review
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "left", color: "#555555", fontSize: "9pt" }}>
                        {CATEGORY_LABELS[f.item.category]}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "left", color: "#222222", fontSize: "9pt" }}>
                        {f.reasons.join(", ")}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#555555" }}>
                        {currency.symbol}{fmt(f.monthlyEquivalent)}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: "bold", color: "#111111" }}>
                        {currency.symbol}{fmt(f.annualCost)}
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
          PAGE 2: TOP SPOTLIGHT, DUPLICATES, SAVINGS SCENARIOS & FULL LIST
          ========================================================================= */}
      <div className="sld-page document-page pdf-page" style={pageStyle}>
        <div>
          {/* Page 2 Header */}
          <header style={{ borderBottom: "1px solid #D6D6D6", paddingBottom: "8px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "10pt", fontWeight: "bold", color: "#111111", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                TURNIVO • SUBSCRIPTION LEAK REPORT
              </span>
            </div>
            <div style={{ fontSize: "9pt", color: "#666666" }} suppressHydrationWarning>
              Ref ID: <strong style={{ fontFamily: "monospace", color: "#111111" }}>{reportId}</strong> • {currentDate}
            </div>
          </header>

          {/* Section: Biggest Subscription to Review Spotlight */}
          {biggestReviewItem && (
            <section style={{ marginBottom: "14px" }}>
              <h2 style={{ fontSize: "11.5pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1.5px solid #111111", paddingBottom: "4px", marginBottom: "8px" }}>
                Top Subscription To Review
              </h2>
              <div style={{ backgroundColor: "#F8F8F8", border: "1px solid #D6D6D6", borderLeft: "3px solid #111111", borderRadius: "3px", padding: "10px 12px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11pt", color: "#111111" }}>
                    {biggestReviewItem.item.name} ({CATEGORY_LABELS[biggestReviewItem.item.category]})
                  </div>
                  <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#111111" }}>
                    {currency.symbol}{fmt(biggestReviewItem.annualCost)}/year{" "}
                    <span style={{ fontSize: "8.5pt", fontWeight: "normal", color: "#666666" }}>
                      ({currency.symbol}{fmt(biggestReviewItem.monthlyEquivalent)}/mo)
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "9.5pt", color: "#444444", marginBottom: "4px" }}>
                  <strong style={{ color: "#111111" }}>Why review this:</strong> {biggestReviewItem.primaryReason}
                </div>
                <div style={{ fontSize: "9pt", color: "#222222", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "2px", padding: "5px 8px" }}>
                  <strong style={{ color: "#111111", textTransform: "uppercase", fontSize: "8pt" }}>Suggested Action:</strong> {biggestReviewItem.suggestedAction}
                </div>
              </div>
            </section>
          )}

          {/* Section: Overlapping Tools & Price Increases */}
          {(overlapGroups.length > 0 || priceIncreaseItems.length > 0) && (
            <section style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {overlapGroups.length > 0 && (
                <div style={{ flex: "1 1 50%", border: "1px solid #D6D6D6", borderRadius: "3px", padding: "8px 10px", backgroundColor: "#FAFAFA", boxSizing: "border-box" }}>
                  <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase", color: "#111111", marginBottom: "4px" }}>
                    Possible Duplicate Tools ({overlapGroups.length})
                  </div>
                  {overlapGroups.map((g) => (
                    <div key={g.category} style={{ fontSize: "8.5pt", color: "#444444", marginBottom: "3px", lineHeight: "1.3" }}>
                      <strong>{g.categoryLabel}:</strong> {g.items.map((i) => i.name).join(", ")} ({currency.symbol}{fmt(g.totalAnnualCost)}/yr)
                    </div>
                  ))}
                </div>
              )}

              {priceIncreaseItems.length > 0 && (
                <div style={{ flex: "1 1 50%", border: "1px solid #D6D6D6", borderRadius: "3px", padding: "8px 10px", backgroundColor: "#FAFAFA", boxSizing: "border-box" }}>
                  <div style={{ fontSize: "9.5pt", fontWeight: "bold", textTransform: "uppercase", color: "#111111", marginBottom: "4px" }}>
                    Recent Price Increases ({priceIncreaseItems.length})
                  </div>
                  {priceIncreaseItems.map((p) => (
                    <div key={p.item.id} style={{ fontSize: "8.5pt", color: "#444444", marginBottom: "3px", lineHeight: "1.3" }}>
                      <strong>{p.item.name}:</strong> +{p.increasePct.toFixed(1)}% ({currency.symbol}{fmt(p.previousCost)} → {currency.symbol}{fmt(p.currentCost)})
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Section: Savings Scenarios */}
          <section style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1.5px solid #111111", paddingBottom: "3px", marginBottom: "6px" }}>
              Possible Savings
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: "1 1 50%", backgroundColor: "#F4F4F4", border: "1px solid #D6D6D6", borderRadius: "3px", padding: "8px 10px", boxSizing: "border-box" }}>
                <div style={{ fontSize: "8.5pt", color: "#666666", fontWeight: "bold", textTransform: "uppercase" }}>
                  If You Cancel / Downgrade Top 1 Tool
                </div>
                <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#111111", marginTop: "2px" }}>
                  Save up to +{currency.symbol}{fmt(scenario1Savings)}/year
                </div>
              </div>

              <div style={{ flex: "1 1 50%", backgroundColor: "#F4F4F4", border: "1px solid #D6D6D6", borderRadius: "3px", padding: "8px 10px", boxSizing: "border-box" }}>
                <div style={{ fontSize: "8.5pt", color: "#666666", fontWeight: "bold", textTransform: "uppercase" }}>
                  If You Cancel / Downgrade Top 2 Tools
                </div>
                <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#111111", marginTop: "2px" }}>
                  Save up to +{currency.symbol}{fmt(scenario2Savings)}/year
                </div>
              </div>
            </div>
          </section>

          {/* Section: Complete Portfolio Audit */}
          <section style={{ marginBottom: "12px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: "#111111", borderBottom: "1px solid #D6D6D6", paddingBottom: "3px", marginBottom: "6px" }}>
              All Subscriptions ({items.length})
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#F4F4F4", borderTop: "1px solid #D6D6D6", borderBottom: "1px solid #111111" }}>
                  <th style={{ padding: "5px 6px", textAlign: "left", color: "#111111", fontWeight: "bold" }}>Name</th>
                  <th style={{ padding: "5px 6px", textAlign: "left", color: "#111111", fontWeight: "bold" }}>Category</th>
                  <th style={{ padding: "5px 6px", textAlign: "left", color: "#111111", fontWeight: "bold" }}>Billing</th>
                  <th style={{ padding: "5px 6px", textAlign: "right", color: "#111111", fontWeight: "bold" }}>Monthly Eq.</th>
                  <th style={{ padding: "5px 6px", textAlign: "right", color: "#111111", fontWeight: "bold" }}>Yearly Cost</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 10).map((i, idx) => (
                  <tr key={i.id} style={{ borderBottom: "1px solid #EAEAEA", backgroundColor: idx % 2 === 1 ? "#FAFAFA" : "#FFFFFF" }}>
                    <td style={{ padding: "5px 6px", fontWeight: "bold", color: "#111111" }}>{i.name}</td>
                    <td style={{ padding: "5px 6px", color: "#555555" }}>{CATEGORY_LABELS[i.category]}</td>
                    <td style={{ padding: "5px 6px", color: "#555555" }}>{BILLING_LABELS[i.billingFrequency]}</td>
                    <td style={{ padding: "5px 6px", textAlign: "right", color: "#444444" }}>{currency.symbol}{fmt(i.cost)}</td>
                    <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: "bold", color: "#111111" }}>
                      {currency.symbol}{fmt(i.cost * (i.billingFrequency === "annual" ? 1 : i.billingFrequency === "quarterly" ? 4 : i.billingFrequency === "weekly" ? 52 : 12))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Section: Disclaimer */}
          <section style={{ borderTop: "1px solid #E0E0E0", paddingTop: "6px", fontSize: "8pt", color: "#666666", lineHeight: "1.3" }}>
            <strong style={{ color: "#333333" }}>Note & Disclaimer:</strong> This review report is calculated from the subscription details provided to help you find recurring expenses worth checking. It is not an accounting audit, banking verification, or contract legal advice.
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
