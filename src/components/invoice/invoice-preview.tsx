import { Separator } from "@/components/ui/separator"
import type { InvoiceFormData } from "./invoice-generator"

interface InvoicePreviewProps {
  data: InvoiceFormData
  totals: {
    subtotal: number
    totalCgst: number
    totalSgst: number
    totalIgst: number
    totalTax: number
    grandTotal: number
    totalDiscount: number
    itemsWithTotals: Array<{
      description: string
      hsnCode?: string
      quantity: number
      unit?: string
      rate: number
      discount: number
      discountAmount?: number
      gstRate: number
      gstType: string
      taxableAmount: number
      cgst: number
      sgst: number
      igst: number
      taxAmount: number
      total: number
    }>
  }
}

function numToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  if (num === 0) return "Zero"
  
  const inWords = (n: number): string => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "")
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "")
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "")
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "")
  }

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  let result = inWords(intPart) + " Rupees"
  if (decPart > 0) result += " and " + inWords(decPart) + " Paise"
  return result + " Only"
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function InvoicePreview({ data, totals }: InvoicePreviewProps) {
  return (
    <div
      className="invoice-preview bg-white text-gray-900"
      style={{ width: "794px", minHeight: "1123px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "12px" }}
    >
      <div style={{ padding: "40px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          {/* Business Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                fontWeight: 800,
                fontSize: "20px",
                padding: "8px 16px",
                borderRadius: "10px",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
              }}
            >
              {data.businessName || "Your Business"}
            </div>
            {data.businessGstin && (
              <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>
                GSTIN: <strong>{data.businessGstin}</strong>
              </p>
            )}
            {data.businessAddress && (
              <p style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-line", maxWidth: "260px" }}>
                {data.businessAddress}
              </p>
            )}
            {(data.businessPhone || data.businessEmail) && (
              <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                {data.businessPhone}{data.businessPhone && data.businessEmail ? " · " : ""}{data.businessEmail}
              </p>
            )}
          </div>

          {/* Invoice Title */}
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#1e3a8a", letterSpacing: "-1px", margin: 0 }}>
              INVOICE
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px", fontWeight: 600 }}>
              #{data.invoiceNumber || "INV-0001"}
            </p>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
              <span style={{ fontSize: "10px", color: "#6b7280" }}>
                Date: <strong style={{ color: "#111827" }}>{formatDate(data.invoiceDate)}</strong>
              </span>
              {data.dueDate && (
                <span style={{ fontSize: "10px", color: "#6b7280" }}>
                  Due: <strong style={{ color: "#ef4444" }}>{formatDate(data.dueDate)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "2px", background: "linear-gradient(to right, #2563eb, #7c3aed)", marginBottom: "24px", borderRadius: "1px" }} />

        {/* Bill To */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            BILL TO
          </p>
          <div style={{ background: "#f8faff", border: "1px solid #e0e7ff", borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#111827", marginBottom: "4px" }}>
              {data.clientName || "Client Name"}
            </p>
            {data.clientGstin && (
              <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "3px" }}>
                GSTIN: {data.clientGstin}
              </p>
            )}
            {data.clientAddress && (
              <p style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-line" }}>{data.clientAddress}</p>
            )}
            {(data.clientPhone || data.clientEmail) && (
              <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
                {data.clientPhone}{data.clientPhone && data.clientEmail ? " · " : ""}{data.clientEmail}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #1e3a8a, #4c1d95)", color: "white" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "10px", borderRadius: "6px 0 0 6px" }}>#</th>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "10px" }}>Description</th>
              <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: "10px" }}>HSN/SAC</th>
              <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: "10px" }}>Qty</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px" }}>Rate</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px" }}>GST</th>
              <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "10px", borderRadius: "0 6px 6px 0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {totals.itemsWithTotals.map((item, i) => (
              <tr
                key={i}
                style={{ background: i % 2 === 0 ? "#f9fafb" : "white", borderBottom: "1px solid #f3f4f6" }}
              >
                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "11px" }}>{i + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: 500, fontSize: "11px" }}>
                  {item.description || "—"}
                  {item.discount > 0 && (
                    <span style={{ fontSize: "9px", color: "#10b981", display: "block" }}>
                      Discount: {item.discount}% (−₹{fmt(item.discountAmount || 0)})
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#6b7280", fontSize: "10px", fontFamily: "monospace" }}>
                  {item.hsnCode || "—"}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px" }}>
                  {item.quantity} {item.unit || ""}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "11px" }}>₹{fmt(item.rate)}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "10px", color: "#6b7280" }}>
                  {item.gstType === "CGST_SGST" ? `${item.gstRate}% (C+S)` : item.gstType === "IGST" ? `${item.gstRate}% IGST` : "Exempt"}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "11px" }}>₹{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Amount in Words */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          <div style={{ width: "240px", background: "#f8faff", borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
              <span style={{ color: "#6b7280" }}>Subtotal</span>
              <span>₹{fmt(totals.subtotal)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ color: "#6b7280" }}>Discount</span>
                <span style={{ color: "#ef4444" }}>−₹{fmt(totals.totalDiscount)}</span>
              </div>
            )}
            {totals.totalCgst > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ color: "#6b7280" }}>CGST</span>
                <span>₹{fmt(totals.totalCgst)}</span>
              </div>
            )}
            {totals.totalSgst > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ color: "#6b7280" }}>SGST</span>
                <span>₹{fmt(totals.totalSgst)}</span>
              </div>
            )}
            {totals.totalIgst > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ color: "#6b7280" }}>IGST</span>
                <span>₹{fmt(totals.totalIgst)}</span>
              </div>
            )}
            <div style={{ height: "1px", background: "#e0e7ff", margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "15px" }}>
              <span style={{ color: "#1e3a8a" }}>Total</span>
              <span style={{ color: "#2563eb" }}>₹{fmt(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", fontSize: "11px" }}>
          <strong style={{ color: "#1e40af" }}>Amount in words: </strong>
          <span style={{ color: "#374151" }}>{numToWords(totals.grandTotal)}</span>
        </div>

        {/* Notes & Terms */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {data.notes && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                NOTES
              </p>
              <p style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-line" }}>{data.notes}</p>
            </div>
          )}
          {data.terms && (
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                TERMS & CONDITIONS
              </p>
              <p style={{ fontSize: "11px", color: "#374151", whiteSpace: "pre-line" }}>{data.terms}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "10px", color: "#9ca3af" }}>
              Generated by QuoteFlow · quoteflow.in
            </p>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>
                Authorised Signature
              </p>
              <div style={{ width: "120px", height: "40px", borderBottom: "1px solid #d1d5db", marginLeft: "auto" }} />
              <p style={{ fontSize: "10px", color: "#374151", marginTop: "4px", fontWeight: 600 }}>
                {data.businessName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
