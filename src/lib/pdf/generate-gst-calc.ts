import {
  fmt,
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawTableWithAutoTable, drawFooter, drawDocumentBorder, initPdfFonts,
} from "./shared"

export interface GSTCalcPDFData {
  amount: number
  rate: number
  mode: "exclusive" | "inclusive"
  baseAmount: number
  gstAmount: number
  cgst: number
  sgst: number
  totalAmount: number
}

export async function generateGSTCalcPDF(data: GSTCalcPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("gst")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "GST CALCULATION REPORT", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Date: ${new Date().toLocaleDateString("en-IN")}`,
    `GST ${data.mode === "exclusive" ? "Exclusive (+ GST)" : "Inclusive (incl. GST)"}`,
    "",
  )
  y += 14

  const tableBody = [
    ["Input Amount", `₹${fmt(data.amount)}`],
    ["GST Rate Selected", `${data.rate}%`],
    ["Base (Taxable) Amount", `₹${fmt(data.baseAmount)}`],
    ["CGST Portion", `₹${fmt(data.cgst)}`],
    ["SGST Portion", `₹${fmt(data.sgst)}`],
    ["Total Tax Amount (GST)", `₹${fmt(data.gstAmount)}`],
    ["Final Net Amount", `₹${fmt(data.totalAmount)}`, "bold"],
  ]
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["PARAMETER", "VALUE"],
    tableBody.map(r => [r[0], r[1]]),
    colors,
    { 0: { cellWidth: "auto" }, 1: { cellWidth: 60, halign: "right", fontStyle: "bold" } },
  )

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `gst-calculation-${Math.floor(Date.now() / 1000)}.pdf`
  doc.save(fileName)
}
