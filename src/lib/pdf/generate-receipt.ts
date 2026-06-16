import {
  fmt,
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawPartyCards, drawFooter, drawSignatureArea, drawDocumentBorder, initPdfFonts,
  type PartyInfo, type IssuerInfo,
} from "./shared"

export interface ReceiptPDFData {
  receiptNo: string
  date: string
  payer: string
  amount: number
  purpose: string
  mode: string
}

export async function generateReceiptPDF(data: ReceiptPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("receipt")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "RECEIPT", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Receipt #: ${data.receiptNo}`,
    "",
    `Date: ${data.date}`,
  )
  y += 14

  const party: PartyInfo = {
    name: data.payer || "Payer Name",
  }
  const issuer: IssuerInfo = {
    name: "Service Center",
  }
  y = drawPartyCards(doc, margin, pageW, y, "Received From", party, "Issued By", issuer, colors)

  // Payment details as a simple table
  const tableBody = [
    ["Amount Received", `₹${fmt(data.amount)}`],
    ["Payment Mode", data.mode || "—"],
    ["Purpose", data.purpose || "—"],
  ]
  autoTable(doc, {
    startY: y,
    head: [["Payment Details", "Information"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4, textColor: [51, 65, 85] },
    headStyles: { fillColor: [colors.accent[0], colors.accent[1], colors.accent[2]], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]] },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto", fontStyle: "bold" } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  if (y + 15 > pageH - 28) { doc.addPage(); y = margin + 10 }
  drawSignatureArea(doc, margin, pageW, y, "Customer Signature", "Authorised Signatory")
  y += 12

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `receipt-${data.receiptNo}.pdf`
  doc.save(fileName)
}
