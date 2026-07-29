import React from "react"
import { Document, Page, View, Text } from "@react-pdf/renderer"

interface GSTCalcData {
  amount: number
  rate: number
  mode: "exclusive" | "inclusive"
  baseAmount: number
  gstAmount: number
  cgst: number
  sgst: number
  totalAmount: number
}

const BRAND = "#2563eb"
const DARK = "#111827"
const MID = "#4b5563"
const LIGHT = "#6b7280"
const MUTED = "#9ca3af"
const BORDER = "#e5e7eb"
const BG_CARD = "#f8faff"
const BG_HIGHLIGHT = "#1e3a8a"
const GREEN = "#059669"

const PADDING = 36

const styles = {
  page: {
    padding: PADDING,
    fontFamily: "Inter",
    fontSize: 9,
    color: DARK,
    backgroundColor: "#ffffff",
  } as const,

  headerRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    borderBottomStyle: "solid" as const,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: BG_HIGHLIGHT,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 7,
    color: LIGHT,
    textAlign: "right" as const,
  },

  modeBadge: {
    alignSelf: "flex-start" as const,
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
    fontSize: 7.5,
    color: BRAND,
    fontWeight: 700,
    textTransform: "uppercase" as const,
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    borderRadius: 4,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  } as const,
  summaryLeft: {},
  summaryLabel: {
    fontSize: 7.5,
    color: LIGHT,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: 700,
    color: DARK,
  },
  summaryRight: {
    alignItems: "flex-end" as const,
  },
  summaryTotalLabel: {
    fontSize: 7.5,
    color: LIGHT,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 1,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: BG_HIGHLIGHT,
  },

  /* Section title */
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },

  /* Breakdown Table */
  table: {
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: "row" as const,
    backgroundColor: BG_HIGHLIGHT,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    paddingVertical: 5.5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid" as const,
    alignItems: "center" as const,
    minHeight: 22,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableRowTotal: {
    flexDirection: "row" as const,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: BG_CARD,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e7ff",
    borderBottomStyle: "solid" as const,
    alignItems: "center" as const,
  },
  tableRowFinal: {
    flexDirection: "row" as const,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: BRAND,
    borderRadius: 4,
    alignItems: "center" as const,
    marginTop: 4,
  } as const,

  colParam: { width: "50%" },
  colValue: { width: "25%", textAlign: "right" as const },
  colSplit: { width: "25%", textAlign: "right" as const },

  cellParam: { fontSize: 8.5, color: DARK },
  cellValue: { fontSize: 8.5, fontWeight: 700, color: DARK, textAlign: "right" as const },
  cellSplit: { fontSize: 8, color: LIGHT, textAlign: "right" as const },

  cellFinalLabel: { fontSize: 10, fontWeight: 700, color: "#ffffff" },
  cellFinalValue: { fontSize: 10, fontWeight: 700, color: "#ffffff", textAlign: "right" as const },

  /* Formula Section */
  formulaBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 3,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  formulaTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: MID,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  formulaLine: {
    fontSize: 8,
    color: LIGHT,
    lineHeight: 1.6,
    fontFamily: "Courier",
  },

  /* Footer */
  footer: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: "solid" as const,
    paddingTop: 6,
    flexDirection: "row" as const,
    justifyContent: "center",
    position: "absolute" as const,
    bottom: 20,
    left: PADDING,
    right: PADDING,
  } as const,
  footerText: {
    fontSize: 6.5,
    color: MUTED,
    textAlign: "center" as const,
  },
}

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function GSTCalcDocument({ data }: { data: GSTCalcData }) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const breakdownRows = [
    { label: "Input Amount", value: fmt(data.amount), split: "" },
    { label: "GST Rate", value: `${data.rate}%`, split: "" },
    { label: "Base (Taxable) Amount", value: fmt(data.baseAmount), split: "" },
  ]

  const taxRows = [
    {
      label: "CGST",
      value: fmt(data.cgst),
      split: `${(data.rate / 2).toFixed(1)}% of base`,
      alt: false,
    },
    {
      label: "SGST",
      value: fmt(data.sgst),
      split: `${(data.rate / 2).toFixed(1)}% of base`,
      alt: true,
    },
  ]

  const formulaText =
    data.mode === "exclusive"
      ? [
          `GST Amount = ${fmt(data.amount)} × ${data.rate}% = ${fmt(data.gstAmount)}`,
          `Net Total = ${fmt(data.amount)} + ${fmt(data.gstAmount)} = ${fmt(data.totalAmount)}`,
        ]
      : [
          `Base Amount = ${fmt(data.amount)} ÷ (1 + ${data.rate}%) = ${fmt(data.baseAmount)}`,
          `GST Amount = ${fmt(data.baseAmount)} × ${data.rate}% = ${fmt(data.gstAmount)}`,
        ]

  const modeLabel =
    data.mode === "exclusive"
      ? `GST Exclusive (Amount + GST)`
      : `GST Inclusive (Amount incl. GST)`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>GST Calculation Report</Text>
          <View>
            <Text style={styles.headerSub}>Date: {today}</Text>
            <Text style={styles.headerSub}>Ref: GST-{Math.floor(Date.now() / 1000)}</Text>
          </View>
        </View>

        <View style={styles.modeBadge}>
          <Text>{modeLabel}</Text>
        </View>

        {/* ── SUMMARY CARD ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Input Amount</Text>
            <Text style={styles.summaryAmount}>₹{fmt(data.amount)}</Text>
            <Text style={[styles.summaryLabel, { marginTop: 4 }]}>GST Rate</Text>
            <Text style={[styles.summaryAmount, { fontSize: 11 }]}>{data.rate}%</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>₹{fmt(data.totalAmount)}</Text>
          </View>
        </View>

        {/* ── TAX BREAKDOWN ── */}
        <Text style={styles.sectionTitle}>Tax Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colParam]}>Parameter</Text>
            <Text style={[styles.tableHeaderCell, styles.colValue]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, styles.colSplit]}>Calculation</Text>
          </View>

          {breakdownRows.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cellParam, styles.colParam]}>{row.label}</Text>
              <Text style={[styles.cellValue, styles.colValue]}>₹{row.value}</Text>
              <Text style={[styles.cellSplit, styles.colSplit]}>{row.split}</Text>
            </View>
          ))}

          <View style={styles.tableRowTotal}>
            <Text style={[styles.cellParam, styles.colParam, { fontWeight: 700 }]}>
              Total GST ({data.rate}%)
            </Text>
            <Text style={[styles.cellValue, styles.colValue, { color: BRAND }]}>
              ₹{fmt(data.gstAmount)}
            </Text>
            <Text style={[styles.cellSplit, styles.colSplit]} />
          </View>

          {taxRows.map((row, i) => (
            <View key={row.label} style={[styles.tableRow, row.alt ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cellParam, styles.colParam, { paddingLeft: 12, fontSize: 8, color: LIGHT }]}>
                ↳ {row.label}
              </Text>
              <Text style={[styles.cellValue, styles.colValue, { fontSize: 8, color: LIGHT }]}>
                ₹{row.value}
              </Text>
              <Text style={[styles.cellSplit, styles.colSplit]}>{row.split}</Text>
            </View>
          ))}

          {/* Final Amount */}
          <View style={styles.tableRowFinal}>
            <Text style={[styles.cellFinalLabel, styles.colParam]}>Final Amount</Text>
            <Text style={[styles.cellFinalValue, styles.colValue]}>₹{fmt(data.totalAmount)}</Text>
            <Text style={[styles.cellFinalValue, styles.colSplit]}>
              {data.mode === "exclusive" ? "Base + GST" : "Incl. GST"}
            </Text>
          </View>
        </View>

        {/* ── CALCULATION FORMULA ── */}
        <View style={styles.formulaBox}>
          <Text style={styles.formulaTitle}>Calculation Formula</Text>
          {formulaText.map((line, i) => (
            <Text key={i} style={styles.formulaLine}>{line}</Text>
          ))}
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
