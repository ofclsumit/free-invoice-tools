import type { QuotationFormData } from "./quotation-generator"

interface QuotationPreviewProps {
  data: QuotationFormData
  totals: {
    subtotal: number
    totalTax: number
    grandTotal: number
    totalDiscount: number
    itemsWithTotals: Array<{
      description: string
      quantity: number
      unit?: string
      rate: number
      discount: number
      taxRate: number
      taxableAmount: number
      taxAmount: number
      total: number
    }>
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  } catch { return dateStr }
}

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function QuotationPreview({ data, totals }: QuotationPreviewProps) {
  return (
    <div className="bg-white text-gray-900" style={{ width: "794px", minHeight: "1123px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px" }}>
      <div style={{ padding: "40px" }}>
        {/* Violet accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(to right, #7c3aed, #a855f7)", borderRadius: "2px", marginBottom: "28px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "20px", color: "#7c3aed", marginBottom: "8px" }}>
              {data.businessName || "Your Business"}
            </div>
            {data.businessGstin && (
              <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "3px" }}>GSTIN: {data.businessGstin}</p>
            )}
            {data.businessAddress && (
              <p style={{ fontSize: "11px", color: "#374151" }}>{data.businessAddress}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#581c87", margin: 0 }}>QUOTATION</h1>
            <p style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 600, marginTop: "4px" }}>#{data.quoteNumber}</p>
            <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "8px" }}>Date: <strong>{formatDate(data.quoteDate)}</strong></p>
            {data.validUntil && (
              <p style={{ fontSize: "10px", color: "#ef4444", fontWeight: 600 }}>Valid until: {formatDate(data.validUntil)}</p>
            )}
          </div>
        </div>

        {/* Quote To */}
        <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px", marginBottom: "28px" }}>
          <p style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>QUOTED FOR</p>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", marginBottom: "4px" }}>{data.clientName || "Client Name"}</p>
          {data.clientAddress && <p style={{ fontSize: "11px", color: "#374151" }}>{data.clientAddress}</p>}
          {(data.clientPhone || data.clientEmail) && (
            <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
              {data.clientPhone}{data.clientPhone && data.clientEmail ? " · " : ""}{data.clientEmail}
            </p>
          )}
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(to right, #7c3aed, #a855f7)", color: "white" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "10px", borderRadius: "6px 0 0 6px" }}>#</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "10px" }}>Description</th>
              <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: "10px" }}>Qty</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px" }}>Rate (₹)</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px" }}>Tax</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px", borderRadius: "0 6px 6px 0" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {totals.itemsWithTotals.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fdf4ff" : "white", borderBottom: "1px solid #f3e8ff" }}>
                <td style={{ padding: "10px 12px", color: "#7c3aed", fontSize: "11px", fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: 500, fontSize: "11px" }}>
                  {item.description || "—"}
                  {item.discount > 0 && (
                    <span style={{ fontSize: "9px", color: "#10b981", display: "block" }}>Discount: {item.discount}%</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px" }}>{item.quantity} {item.unit || ""}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "11px" }}>₹{fmt(item.rate)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "10px", color: "#6b7280" }}>{item.taxRate}%</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, fontSize: "11px", color: "#7c3aed" }}>₹{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <div style={{ width: "220px", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "14px" }}>
            {[
              ["Subtotal", fmt(totals.subtotal)],
              ...(totals.totalDiscount > 0 ? [["Discount", `-${fmt(totals.totalDiscount)}`]] : []),
              ["Tax", fmt(totals.totalTax)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "10px" }}>
                <span style={{ color: "#6b7280" }}>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ height: "1px", background: "#d8b4fe", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "14px" }}>
              <span style={{ color: "#581c87" }}>Total</span>
              <span style={{ color: "#7c3aed" }}>₹{fmt(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(data.notes || data.terms) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {data.notes && (
              <div>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>NOTES</p>
                <p style={{ fontSize: "11px", color: "#374151" }}>{data.notes}</p>
              </div>
            )}
            {data.terms && (
              <div>
                <p style={{ fontSize: "9px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>TERMS</p>
                <p style={{ fontSize: "11px", color: "#374151" }}>{data.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <p style={{ fontSize: "10px", color: "#9ca3af" }}>Generated by QuoteFlow · quoteflow.in</p>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "9px", color: "#6b7280" }}>Authorised Signature</p>
            <div style={{ width: "120px", height: "36px", borderBottom: "1px solid #d1d5db", marginLeft: "auto" }} />
            <p style={{ fontSize: "9px", color: "#374151", fontWeight: 600, marginTop: "4px" }}>{data.businessName}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
