import {
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawTableWithAutoTable, drawFooter, drawDocumentBorder, initPdfFonts,
} from "./shared"

export interface GstRatesPDFData {
  searchQuery: string
  category: string
  items: Array<{ category: string; hsn: string; description: string; rate: number; cgst: number; sgst: number }>
}

export async function generateGstRatesPDF(data: GstRatesPDFData): Promise<void> {
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

  drawDocTitle(doc, pageW, y, "GST RATES FINDER REPORT", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Search: "${data.searchQuery || "All"}"`,
    `Category: ${data.category}`,
    `Exported: ${new Date().toLocaleDateString("en-IN")}`,
  )
  y += 14

  const tableBody = data.items.map(item => [
    item.category,
    item.description,
    item.hsn,
    `${item.rate}%`,
    `${item.cgst}%`,
    `${item.sgst}%`,
  ])

  y = drawTableWithAutoTable(
    doc,
    autoTable,
    y,
    margin,
    ["CATEGORY", "DESCRIPTION", "HSN CODE", "GST RATE", "CGST", "SGST"],
    tableBody,
    colors,
    { 
      0: { cellWidth: 32 }, 
      1: { cellWidth: "auto" }, 
      2: { cellWidth: 20, halign: "center", fontStyle: "bold" }, 
      3: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 15, halign: "center" }
    },
  )

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `gst-rates-report.pdf`
  doc.save(fileName)
}
