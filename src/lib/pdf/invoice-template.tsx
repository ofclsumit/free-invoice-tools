import React from "react"
import { Document, Page, View, Text } from "@react-pdf/renderer"
import type { InvoiceData } from "./types"

const BRAND_COLOR = "#2563eb"
const ACCENT_COLOR = "#1e40af"
const TEXT_PRIMARY = "#111827"
const TEXT_SECONDARY = "#6b7280"
const TEXT_MUTED = "#9ca3af"
const BORDER_COLOR = "#e5e7eb"
const BG_LIGHT = "#f8faff"
const BG_HEADER = "#1e3a8a"

const PADDING = 36

const styles = {
  page: {
    padding: PADDING,
    fontFamily: "Inter",
    fontSize: 9,
    color: TEXT_PRIMARY,
    backgroundColor: "#ffffff",
  } as const,

  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end" as const,
  },

  businessName: {
    fontSize: 18,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    lineHeight: 1.5,
    maxWidth: 220,
  },
  businessGstin: {
    fontSize: 7.5,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: ACCENT_COLOR,
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    marginTop: 2,
  },

  metaRow: {
    flexDirection: "row" as const,
    marginTop: 2,
  },
  metaLabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    width: 60,
    textAlign: "right" as const,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 8,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    textAlign: "right" as const,
  },

  headerDivider: {
    height: 3,
    backgroundColor: BRAND_COLOR,
    marginBottom: 20,
    borderRadius: 1.5,
  },

  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND_COLOR,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },

  clientCard: {
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 8.5,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
  },
  clientGstin: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row" as const,
    backgroundColor: BG_HEADER,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row" as const,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid" as const,
    minHeight: 24,
    alignItems: "center" as const,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 8.5,
    color: TEXT_PRIMARY,
  },
  tableCellMuted: {
    fontSize: 8,
    color: TEXT_SECONDARY,
  },
  tableCellRight: {
    fontSize: 8.5,
    color: TEXT_PRIMARY,
    textAlign: "right" as const,
  },
  tableCellCenter: {
    fontSize: 8.5,
    color: TEXT_PRIMARY,
    textAlign: "center" as const,
  },

  colSno: { width: "6%" },
  colDesc: { width: "34%" },
  colHsn: { width: "14%" },
  colQty: { width: "10%", textAlign: "center" as const },
  colRate: { width: "12%", textAlign: "right" as const },
  colDisc: { width: "8%", textAlign: "center" as const },
  colTax: { width: "8%", textAlign: "center" as const },
  colAmount: { width: "14%", textAlign: "right" as const },

  totalsSection: {
    marginBottom: 16,
    alignItems: "flex-end" as const,
  },
  totalsBox: {
    width: "45%",
    minWidth: 200,
  },
  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
  } as const,
  totalLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    textAlign: "right" as const,
  },
  totalHighlightRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    backgroundColor: BRAND_COLOR,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
  } as const,
  totalHighlightLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ffffff",
  },
  totalHighlightValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "right" as const,
  },
  totalDivider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 4,
  },

  amountInWordsSection: {
    backgroundColor: BG_LIGHT,
    borderRadius: 3,
    padding: 10,
    marginBottom: 16,
  },
  amountInWordsLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: ACCENT_COLOR,
  },
  amountInWordsValue: {
    fontSize: 8.5,
    color: TEXT_PRIMARY,
    marginTop: 2,
    lineHeight: 1.5,
  },

  notesTermsSection: {
    flexDirection: "row" as const,
    gap: 16,
    marginBottom: 20,
  },
  notesTermsColumn: {
    flex: 1,
  },
  notesTermsTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND_COLOR,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  notesTermsContent: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    lineHeight: 1.5,
  },

  signatureSection: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    marginTop: 8,
  } as const,
  signatureBlock: {
    alignItems: "center" as const,
    width: 140,
  },
  signatureLine: {
    width: 140,
    height: 1,
    backgroundColor: TEXT_MUTED,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: TEXT_SECONDARY,
    textAlign: "center" as const,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    textAlign: "center" as const,
    marginTop: 2,
  },

  footer: {
    position: "absolute" as const,
    bottom: 20,
    left: PADDING,
    right: PADDING,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    borderTopStyle: "solid" as const,
    paddingTop: 6,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
  } as const,
  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
    textAlign: "center" as const,
  },
}

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatDate(dateStr: string): string {
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

function numToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ]
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

function getGstLabel(item: InvoiceData["itemsWithTotals"][number]): string {
  if (item.gstType === "EXEMPT") return "Exempt"
  return `${item.gstRate}%`
}

interface HeaderRowProps {
  hasHsn: boolean
  hasDiscount: boolean
}

function TableHeaderRow({ hasHsn, hasDiscount }: HeaderRowProps) {
  return (
    <View style={styles.tableHeader} fixed>
      <Text style={[styles.tableHeaderCell, styles.colSno]}>#</Text>
      <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
      {hasHsn && <Text style={[styles.tableHeaderCell, styles.colHsn]}>HSN/SAC</Text>}
      <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
      <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
      {hasDiscount && <Text style={[styles.tableHeaderCell, styles.colDisc]}>Disc</Text>}
      <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax</Text>
      <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
    </View>
  )
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const hasHsn = data.itemsWithTotals.some((i) => i.hsnCode && i.hsnCode.trim() !== "")
  const hasDiscount = data.itemsWithTotals.some((i) => (i.discount || 0) > 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{data.businessName || "Your Business"}</Text>
            {data.businessAddress && (
              <Text style={styles.businessDetail}>{data.businessAddress}</Text>
            )}
            {(data.businessPhone || data.businessEmail) && (
              <Text style={styles.businessDetail}>
                {[data.businessPhone, data.businessEmail].filter(Boolean).join(" · ")}
              </Text>
            )}
            {data.businessGstin && (
              <Text style={styles.businessGstin}>GSTIN: {data.businessGstin}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{data.invoiceNumber || "INV-0001"}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{formatDate(data.invoiceDate)}</Text>
            </View>
            {data.dueDate && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date:</Text>
                <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerDivider} />

        {/* ── BILL TO ── */}
        <Text style={styles.sectionTitle}>Bill To</Text>
        <View style={styles.clientCard}>
          <Text style={styles.clientName}>{data.clientName || "Client Name"}</Text>
          {data.clientGstin && (
            <Text style={styles.clientGstin}>GSTIN: {data.clientGstin}</Text>
          )}
          {data.clientAddress && (
            <Text style={[styles.clientDetail, { marginTop: 2 }]}>{data.clientAddress}</Text>
          )}
          {(data.clientPhone || data.clientEmail) && (
            <Text style={[styles.clientDetail, { marginTop: 2 }]}>
              {[data.clientPhone, data.clientEmail].filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>

        {/* ── ITEMS TABLE ── */}
        <View style={styles.table}>
          <TableHeaderRow hasHsn={hasHsn} hasDiscount={hasDiscount} />
          {data.itemsWithTotals.map((item, i) => (
            <View
              key={i}
              style={[
                styles.tableRow,
                i % 2 === 1 ? styles.tableRowAlt : {},
              ]}
              wrap={false}
            >
              <Text style={[styles.tableCellMuted, styles.colSno]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description || "—"}</Text>
              {hasHsn && (
                <Text style={[styles.tableCellMuted, styles.colHsn, { fontFamily: "Courier" }]}>
                  {item.hsnCode || "—"}
                </Text>
              )}
              <Text style={[styles.tableCell, styles.colQty, { textAlign: "center" }]}>
                {item.quantity} {item.unit || ""}
              </Text>
              <Text style={[styles.tableCellRight, styles.colRate]}>₹{fmt(item.rate)}</Text>
              {hasDiscount && (
                <Text style={[styles.tableCellMuted, styles.colDisc, { textAlign: "center" }]}>
                  {item.discount > 0 ? `${item.discount}%` : "—"}
                </Text>
              )}
              <Text style={[styles.tableCellMuted, styles.colTax, { textAlign: "center" }]}>
                {getGstLabel(item)}
              </Text>
              <Text style={[styles.tableCellRight, styles.colAmount, { fontWeight: 700 }]}>
                ₹{fmt(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── TOTALS ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={[styles.totalRow, { borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, borderBottomStyle: "solid" as const }]}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{fmt(data.subtotal)}</Text>
            </View>
            {data.totalDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: "#ef4444" }]}>−₹{fmt(data.totalDiscount)}</Text>
              </View>
            )}
            {data.totalCgst > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST</Text>
                <Text style={styles.totalValue}>₹{fmt(data.totalCgst)}</Text>
              </View>
            )}
            {data.totalSgst > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST</Text>
                <Text style={styles.totalValue}>₹{fmt(data.totalSgst)}</Text>
              </View>
            )}
            {data.totalIgst > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST</Text>
                <Text style={styles.totalValue}>₹{fmt(data.totalIgst)}</Text>
              </View>
            )}
            <View style={styles.totalHighlightRow}>
              <Text style={styles.totalHighlightLabel}>Total</Text>
              <Text style={styles.totalHighlightValue}>₹{fmt(data.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ── AMOUNT IN WORDS ── */}
        <View style={styles.amountInWordsSection}>
          <Text style={styles.amountInWordsLabel}>Amount in Words</Text>
          <Text style={styles.amountInWordsValue}>{numToWords(data.grandTotal)}</Text>
        </View>

        {/* ── NOTES & TERMS ── */}
        {(data.notes || data.terms) && (
          <View style={styles.notesTermsSection}>
            {data.notes && (
              <View style={styles.notesTermsColumn}>
                <Text style={styles.notesTermsTitle}>Notes</Text>
                <Text style={styles.notesTermsContent}>{data.notes}</Text>
              </View>
            )}
            {data.terms && (
              <View style={styles.notesTermsColumn}>
                <Text style={styles.notesTermsTitle}>Terms & Conditions</Text>
                <Text style={styles.notesTermsContent}>{data.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── SIGNATURE ── */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <Text style={styles.signatureName}>{data.businessName}</Text>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Turnivo · Turnivo.in
          </Text>
        </View>
      </Page>
    </Document>
  )
}
