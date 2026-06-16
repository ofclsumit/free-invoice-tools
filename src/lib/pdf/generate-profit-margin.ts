import {
  fmt,
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawTableWithAutoTable, drawFooter, drawDocumentBorder, initPdfFonts,
} from "./shared"

export interface ProfitMarginPDFData {
  cost: number
  selling: number
  profit: number
  margin: number
  markup: number
}

export async function generateProfitMarginPDF(data: ProfitMarginPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("profit")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "PROFIT MARGIN ANALYSIS", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    "",
  )
  y += 14

  const tableBody = [
    ["Cost Price (Investment)", `₹${fmt(data.cost)}`],
    ["Selling Price (Revenue)", `₹${fmt(data.selling)}`],
    ["Net Profit / Loss", `₹${fmt(data.profit)}`],
    ["Gross Profit Margin", `${data.margin.toFixed(2)}%`],
    ["Markup Percentage", `${data.markup.toFixed(2)}%`],
  ]
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["FINANCIAL METRICS", "RESULT"],
    tableBody,
    colors,
    { 0: { cellWidth: "auto" }, 1: { cellWidth: 60, halign: "right", fontStyle: "bold" } },
  )

  // Formula guide
  doc.setFillColor(254, 252, 232)
  doc.setDrawColor(254, 240, 138)
  doc.roundedRect(margin, y, contentW, 16, 2, 2, "FD")
  doc.setFont("Inter", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(180, 83, 9)
  doc.text("FORMULA GUIDE:", margin + 5, y + 5)
  doc.setFont("Inter", "normal")
  doc.setTextColor(120, 113, 108)
  doc.setFontSize(7)
  doc.text("Profit Margin = (SP - CP) / SP x 100     |     Markup = (SP - CP) / CP x 100", margin + 5, y + 11.5)
  y += 20

  drawFooter(doc, margin, pageW, pageH, y)

  const fileName = `profit-margin-analysis.pdf`
  doc.save(fileName)
}
