import type { QuotationFormData } from "@/components/quotation/quotation-generator"
import {
  formatDate, fmt,
  getDefaultColors, drawAccentLine,   drawDocTitle, drawMetaRow,
  drawPartyCards, drawTableWithAutoTable, drawTotalsBox, drawFooter, drawSignatureArea, drawDocumentBorder, initPdfFonts,
  type PartyInfo, type IssuerInfo,
} from "./shared"

interface QuotationPDFData extends QuotationFormData {
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
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
  businessPhone?: string
  businessEmail?: string
  subject?: string
}

export async function generateQuotationPDF(data: QuotationPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("quotation")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "QUOTATION", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Quote #: ${data.quoteNumber || "QUO-0001"}`,
    "",
    `Date: ${formatDate(data.quoteDate)}  Valid: ${formatDate(data.validUntil || "")}`,
  )
  y += 14

  const party: PartyInfo = {
    name: data.clientName || "Client Name",
    address: data.clientAddress,
    email: data.clientEmail,
  }
  const issuer: IssuerInfo = {
    name: data.businessName || "Your Business",
    contact: data.businessPhone,
    email: data.businessEmail,
    address: data.businessAddress,
  }
  y = drawPartyCards(doc, margin, pageW, y, "Quote For", party, "Issued By", issuer, colors)

  if (data.subject) {
    doc.setFont("Inter", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(124, 58, 237)
    doc.text(`Subject: ${data.subject}`, margin, y)
    y += 5
  }

  const tableBody = data.itemsWithTotals.map((item) => [
    item.description,
    String(item.quantity) + (item.unit ? ` ${item.unit}` : ""),
    `₹${fmt(item.rate)}`,
    item.taxRate > 0 ? `${item.taxRate}%` : "—",
    `₹${fmt(item.total)}`,
  ])
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["DESCRIPTION", "QTY", "RATE", "TAX", "AMOUNT"],
    tableBody,
    colors,
    { 0: { cellWidth: "auto" }, 1: { cellWidth: 18, halign: "center" }, 2: { cellWidth: 22, halign: "right" }, 3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 26, halign: "right", fontStyle: "bold" } },
  )

  const totals = [
    { label: "SUBTOTAL", value: `₹${fmt(data.subtotal)}` },
    ...(data.totalDiscount > 0 ? [{ label: "DISCOUNT", value: `-₹${fmt(data.totalDiscount)}` }] : []),
    ...(data.totalTax > 0 ? [{ label: "TAX", value: `₹${fmt(data.totalTax)}` }] : []),
    { label: "TOTAL", value: `₹${fmt(data.grandTotal)}`, highlight: true },
  ]
  y = drawTotalsBox(doc, pageW, margin, y, totals, colors)
  y += 2

  if (y + 15 > pageH - 28) { doc.addPage(); y = margin + 10 }
  drawSignatureArea(doc, margin, pageW, y)
  y += 12

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `${data.quoteNumber || "quotation"}-${data.clientName || "client"}.pdf`.replace(/\s+/g, "-").toLowerCase()
  doc.save(fileName)
}
