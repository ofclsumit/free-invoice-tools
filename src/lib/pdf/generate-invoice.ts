import type { InvoiceFormData } from "@/components/invoice/invoice-generator"
import { formatDate, fmt, numToWords, drawFooter, initPdfFonts } from "./shared"

interface InvoicePDFData extends InvoiceFormData {
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
    gstRate: number
    gstType: string
    taxableAmount: number
    cgst: number
    sgst: number
    igst: number
    taxAmount: number
    total: number
    discountAmount?: number
  }>
}

/* ─── Helpers ──────────────────────────────────────────────── */

const COLOR = {
  black: [33, 33, 33] as [number, number, number],
  dark: [55, 65, 81] as [number, number, number],
  mid: [107, 114, 128] as [number, number, number],
  light: [156, 163, 175] as [number, number, number],
  faint: [229, 231, 235] as [number, number, number],
  bg: [249, 250, 251] as [number, number, number],
  accent: [79, 70, 229] as [number, number, number],      // indigo-600
  accentBg: [238, 242, 255] as [number, number, number],   // indigo-50
  white: [255, 255, 255] as [number, number, number],
}

function setColor(doc: any, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2])
}

function hLine(doc: any, x1: number, x2: number, y: number, color = COLOR.faint, width = 0.4) {
  doc.setDrawColor(color[0], color[1], color[2])
  doc.setLineWidth(width)
  doc.line(x1, y, x2, y)
}

/* ─── Main Export ──────────────────────────────────────────── */

export async function generateInvoicePDF(data: InvoicePDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()  // 210
  const pageH = doc.internal.pageSize.getHeight()  // 297
  const M = 18  // margin
  const CW = pageW - M * 2  // content width
  let y = M

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEADER AREA  (From / Invoice title / Meta)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Business name (top-left, large)
  doc.setFont("Inter", "bold")
  doc.setFontSize(16)
  setColor(doc, COLOR.black)
  doc.text(data.businessName || "Your Business", M, y + 5)

  // "INVOICE" title (top-right, large)
  doc.setFont("Inter", "bold")
  doc.setFontSize(28)
  setColor(doc, COLOR.black)
  doc.text("INVOICE", pageW - M, y + 5, { align: "right" })
  y += 10

  // Business contact details (left column, smaller)
  doc.setFont("Inter", "normal")
  doc.setFontSize(8.5)
  setColor(doc, COLOR.mid)
  let ly = y + 2
  if (data.businessAddress) {
    const lines = doc.splitTextToSize(data.businessAddress, 85)
    lines.forEach((line: string) => {
      doc.text(line, M, ly)
      ly += 3.8
    })
  }
  if (data.businessPhone) { doc.text(data.businessPhone, M, ly); ly += 3.8 }
  if (data.businessEmail) { doc.text(data.businessEmail, M, ly); ly += 3.8 }
  if (data.businessGstin) {
    doc.setFont("Inter", "bold")
    doc.setFontSize(7.5)
    setColor(doc, COLOR.dark)
    doc.text(`GSTIN: ${data.businessGstin}`, M, ly)
    doc.setFont("Inter", "normal")
    ly += 4
  }

  // Invoice meta (right column – # , Date, Due Date, etc.)
  const metaLabelX = pageW - M - 68
  const metaValueX = pageW - M
  let ry = y + 2
  doc.setFontSize(8.5)

  const metaRows = [
    { label: "Invoice #", value: data.invoiceNumber || "INV-0001" },
    { label: "Invoice Date", value: formatDate(data.invoiceDate) },
    ...(data.dueDate ? [{ label: "Due Date", value: formatDate(data.dueDate) }] : []),
  ]

  metaRows.forEach(({ label, value }) => {
    doc.setFont("Inter", "normal")
    setColor(doc, COLOR.mid)
    doc.text(label, metaLabelX, ry)
    doc.setFont("Inter", "bold")
    setColor(doc, COLOR.black)
    doc.text(value, metaValueX, ry, { align: "right" })
    ry += 5
  })

  y = Math.max(ly, ry) + 6

  // Horizontal separator
  hLine(doc, M, pageW - M, y, COLOR.faint, 0.5)
  y += 8

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BILL TO / SHIP TO area
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // "Bill To" label
  doc.setFont("Inter", "bold")
  doc.setFontSize(8)
  setColor(doc, COLOR.accent)
  doc.text("BILL TO", M, y)

  doc.setFont("Inter", "bold")
  doc.setFontSize(10)
  setColor(doc, COLOR.black)
  doc.text(data.clientName || "Client Name", M, y + 5.5)

  doc.setFont("Inter", "normal")
  doc.setFontSize(8.5)
  setColor(doc, COLOR.mid)
  let cy = y + 11
  if (data.clientAddress) {
    const lines = doc.splitTextToSize(data.clientAddress, 85)
    lines.forEach((line: string) => {
      doc.text(line, M, cy)
      cy += 3.8
    })
  }
  if (data.clientPhone) { doc.text(data.clientPhone, M, cy); cy += 3.8 }
  if (data.clientEmail) { doc.text(data.clientEmail, M, cy); cy += 3.8 }
  if (data.clientGstin) {
    doc.setFont("Inter", "bold")
    doc.setFontSize(7.5)
    setColor(doc, COLOR.dark)
    doc.text(`GSTIN: ${data.clientGstin}`, M, cy)
    cy += 4
  }

  y = cy + 6

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ITEMS TABLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const hasHSN = data.itemsWithTotals.some(i => i.hsnCode && i.hsnCode.trim() !== "")
  const hasDiscount = data.itemsWithTotals.some(i => (i.discount || 0) > 0)

  const head: string[] = ["Item"]
  if (hasHSN) head.push("HSN/SAC")
  head.push("Qty", "Rate")
  if (hasDiscount) head.push("Disc")
  head.push("Tax", "Amount")

  const body = data.itemsWithTotals.map((item) => {
    const row: string[] = [item.description]
    if (hasHSN) row.push(item.hsnCode || "")
    row.push(`${item.quantity}${item.unit ? " " + item.unit : ""}`)
    row.push(`₹${fmt(item.rate)}`)
    if (hasDiscount) row.push(item.discount > 0 ? `${item.discount}%` : "—")
    const taxLabel = item.gstType === "EXEMPT" ? "Exempt" : `${item.gstRate}%`
    row.push(taxLabel)
    row.push(`₹${fmt(item.total)}`)
    return row
  })

  // Build column styles dynamically
  let colIdx = 0
  const colStyles: Record<number, any> = {}
  colStyles[colIdx] = { cellWidth: "auto" }  // Item description
  colIdx++
  if (hasHSN) { colStyles[colIdx] = { cellWidth: 22, halign: "center", fontStyle: "normal", fontSize: 7.5, font: "courier" }; colIdx++ }
  colStyles[colIdx] = { cellWidth: 20, halign: "center" }; colIdx++  // Qty
  colStyles[colIdx] = { cellWidth: 24, halign: "right" }; colIdx++   // Rate
  if (hasDiscount) { colStyles[colIdx] = { cellWidth: 16, halign: "center" }; colIdx++ }
  colStyles[colIdx] = { cellWidth: 18, halign: "center" }; colIdx++  // Tax
  colStyles[colIdx] = { cellWidth: 28, halign: "right", fontStyle: "bold" }  // Amount

  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: M, right: M },
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      textColor: COLOR.dark,
      lineColor: COLOR.faint,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: COLOR.bg,
      textColor: COLOR.dark,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    bodyStyles: {
      fillColor: COLOR.white,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    columnStyles: colStyles,
    tableLineColor: COLOR.faint,
    tableLineWidth: 0.3,
    didDrawPage: (data: any) => {
      // Draw header border bottom for every page
    },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOTALS SECTION (right-aligned, like invoice-generator.com)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const totalsBoxW = 80
  const totalsX = pageW - M - totalsBoxW
  const labelX = totalsX + 4
  const valueX = pageW - M - 4
  const rowH = 6

  const summaryRows: Array<{ label: string; value: string; bold?: boolean; accent?: boolean }> = [
    { label: "Subtotal", value: `₹${fmt(data.subtotal)}` },
  ]
  if (data.totalDiscount > 0) {
    summaryRows.push({ label: "Discount", value: `-₹${fmt(data.totalDiscount)}` })
  }
  if (data.totalCgst > 0) {
    summaryRows.push({ label: "CGST", value: `₹${fmt(data.totalCgst)}` })
  }
  if (data.totalSgst > 0) {
    summaryRows.push({ label: "SGST", value: `₹${fmt(data.totalSgst)}` })
  }
  if (data.totalIgst > 0) {
    summaryRows.push({ label: "IGST", value: `₹${fmt(data.totalIgst)}` })
  }

  // Draw summary rows
  summaryRows.forEach((row) => {
    doc.setFont("Inter", "normal")
    doc.setFontSize(9)
    setColor(doc, COLOR.mid)
    doc.text(row.label, labelX, y)
    doc.setFont("Inter", "bold")
    setColor(doc, COLOR.dark)
    doc.text(row.value, valueX, y, { align: "right" })
    y += rowH
  })

  // Separator before Total
  hLine(doc, totalsX, pageW - M, y - 1.5, COLOR.faint, 0.5)
  y += 3

  // GRAND TOTAL (highlighted row)
  doc.setFillColor(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2])
  doc.roundedRect(totalsX, y - 4, totalsBoxW, 11, 1.5, 1.5, "F")
  doc.setFont("Inter", "bold")
  doc.setFontSize(11)
  setColor(doc, COLOR.white)
  doc.text("Total", labelX, y + 3)
  doc.text(`₹${fmt(data.grandTotal)}`, valueX, y + 3, { align: "right" })
  y += 16

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AMOUNT IN WORDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  doc.setFont("Inter", "bold")
  doc.setFontSize(7.5)
  setColor(doc, COLOR.dark)
  doc.text("Amount in Words:", M, y)
  doc.setFont("Inter", "italic")
  doc.setFontSize(8)
  setColor(doc, COLOR.mid)
  const amtWords = numToWords(data.grandTotal)
  const wordLines = doc.splitTextToSize(amtWords, CW - 30)
  doc.text(wordLines, M + 28, y)
  y += (wordLines.length * 4) + 6

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NOTES & TERMS (two-column, bottom area)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const hasNotes = data.notes && data.notes.trim()
  const hasTerms = data.terms && data.terms.trim()

  if (hasNotes || hasTerms) {
    // Check if we need a new page
    if (y + 25 > pageH - 30) { doc.addPage(); y = M + 5 }

    hLine(doc, M, pageW - M, y, COLOR.faint, 0.3)
    y += 6

    const halfW = CW / 2 - 4

    if (hasNotes) {
      doc.setFont("Inter", "bold")
      doc.setFontSize(8)
      setColor(doc, COLOR.dark)
      doc.text("Notes", M, y)
      doc.setFont("Inter", "normal")
      doc.setFontSize(8)
      setColor(doc, COLOR.mid)
      const noteLines = doc.splitTextToSize(data.notes!, hasTerms ? halfW : CW)
      doc.text(noteLines, M, y + 5)
    }

    if (hasTerms) {
      const termsX = hasNotes ? M + halfW + 8 : M
      doc.setFont("Inter", "bold")
      doc.setFontSize(8)
      setColor(doc, COLOR.dark)
      doc.text("Terms & Conditions", termsX, y)
      doc.setFont("Inter", "normal")
      doc.setFontSize(8)
      setColor(doc, COLOR.mid)
      const termLines = doc.splitTextToSize(data.terms!, hasNotes ? halfW : CW)
      doc.text(termLines, termsX, y + 5)
    }

    y += 20
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SIGNATURE AREA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (y + 20 > pageH - 25) { doc.addPage(); y = M + 10 }

  const sigY = Math.max(y, pageH - 55)
  const sigLineW = 55

  // Authorized signature (right side)
  hLine(doc, pageW - M - sigLineW, pageW - M, sigY, COLOR.light, 0.4)
  doc.setFont("Inter", "normal")
  doc.setFontSize(7.5)
  setColor(doc, COLOR.mid)
  doc.text("Authorized Signature", pageW - M - sigLineW / 2, sigY + 5, { align: "center" })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FOOTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  drawFooter(doc, M, pageW, pageH)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SAVE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const fileName = `${data.invoiceNumber || "invoice"}-${data.clientName || "client"}.pdf`
    .replace(/\s+/g, "-")
    .toLowerCase()
  doc.save(fileName)
}
