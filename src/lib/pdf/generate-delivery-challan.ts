import {
  formatDate, fmt,
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawPartyCards, drawTableWithAutoTable, drawFooter, drawSignatureArea, drawDocumentBorder, initPdfFonts,
  type PartyInfo, type IssuerInfo,
} from "./shared"

export interface DeliveryChallanPDFData {
  challanNo: string
  date: string
  consignee: string
  transporter: string
  vehicleNo: string
  items: Array<{ description: string; quantity: number }>
}

export async function generateDeliveryChallanPDF(data: DeliveryChallanPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("challan")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "DELIVERY CHALLAN", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `Challan #: ${data.challanNo}`,
    "",
    `Date: ${data.date}`,
  )
  y += 14

  const party: PartyInfo = {
    name: data.consignee || "Consignee Name",
    address: data.transporter ? `Transporter: ${data.transporter}` : "",
  }
  const issuer: IssuerInfo = {
    name: "Service Center",
    contact: data.vehicleNo ? `Vehicle: ${data.vehicleNo}` : "",
  }
  y = drawPartyCards(doc, margin, pageW, y, "Consignee (Receiver)", party, "Transport Details", issuer, colors)

  const tableBody = data.items.map((item) => [
    item.description || "—",
    String(item.quantity),
    "",
    "",
    "",
  ])
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["DESCRIPTION", "QTY", "", "", ""],
    tableBody,
    colors,
    { 0: { cellWidth: "auto" }, 1: { cellWidth: 25, halign: "center", fontStyle: "bold" }, 2: { cellWidth: 0 }, 3: { cellWidth: 0 }, 4: { cellWidth: 0 } },
  )

  if (y + 15 > pageH - 28) { doc.addPage(); y = margin + 10 }
  drawSignatureArea(doc, margin, pageW, y, "Receiver's Signature", "Authorised Signatory")
  y += 12

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `delivery-challan-${data.challanNo}.pdf`
  doc.save(fileName)
}
