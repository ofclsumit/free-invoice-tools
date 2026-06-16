import {
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawTableWithAutoTable, drawFooter, drawDocumentBorder, initPdfFonts,
} from "./shared"

export interface GSTINValidationPDFData {
  gstin: string
  valid: boolean
  state?: string
  msg: string
}

export async function generateGSTINValidationPDF(data: GSTINValidationPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("gstin")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "GSTIN VALIDATION REPORT", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `GSTIN: ${data.gstin.toUpperCase()}`,
    data.valid ? "Status: VALID" : "Status: INVALID",
    `Verified: ${new Date().toLocaleString("en-IN")}`,
  )
  y += 14

  const tableBody = [
    ["GSTIN Entered", data.gstin.toUpperCase().trim()],
    ["Format Validity", data.valid ? "Valid" : "Invalid"],
    ["Associated State", data.state || "—"],
    ["Message", data.msg],
  ]
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["VERIFICATION PARAMETER", "DETAILS"],
    tableBody,
    colors,
    { 0: { cellWidth: 60 }, 1: { cellWidth: "auto", fontStyle: "bold" } },
  )

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `gstin-validation-${data.gstin.toUpperCase()}.pdf`
  doc.save(fileName)
}
