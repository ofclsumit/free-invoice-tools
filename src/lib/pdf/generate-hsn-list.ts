import {
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawTableWithAutoTable, drawFooter, drawDocumentBorder, initPdfFonts,
} from "./shared"

export interface HsnListPDFData {
  searchQuery: string
  items: Array<{ code: string; description: string; rate: string }>
}

export async function generateHsnListPDF(data: HsnListPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("hsn")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "HSN / SAC SEARCH RESULTS", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Search: "${data.searchQuery || "All Codes"}"`,
    `${data.items.length} result(s)`,
    `Exported: ${new Date().toLocaleDateString("en-IN")}`,
  )
  y += 14

  const tableBody = data.items.map(h => [
    h.code,
    h.description,
    h.rate,
  ])
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["HSN/SAC CODE", "DESCRIPTION", "GST RATE"],
    tableBody,
    colors,
    { 0: { cellWidth: 28, halign: "center", fontStyle: "bold" }, 1: { cellWidth: "auto" }, 2: { cellWidth: 22, halign: "center", fontStyle: "bold" } },
  )

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `hsn-search-results.pdf`
  doc.save(fileName)
}
