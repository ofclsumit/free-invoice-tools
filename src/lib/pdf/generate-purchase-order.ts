import {
  fmt,
  getDefaultColors, drawAccentLine, drawDocTitle, drawMetaRow,
  drawPartyCards, drawTableWithAutoTable, drawTotalsBox, drawFooter, drawSignatureArea, drawDocumentBorder, initPdfFonts,
  type PartyInfo, type IssuerInfo,
} from "./shared"

export interface PurchaseOrderPDFData {
  poNo: string
  date: string
  supplier: string
  items: Array<{ description: string; quantity: number; rate: number }>
  total: number
}

export async function generatePurchaseOrderPDF(data: PurchaseOrderPDFData): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  await initPdfFonts(doc)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentW = pageW - margin * 2
  const colors = getDefaultColors("purchase")
  let y = margin + 5

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, contentW, y, colors)
  y += 7

  drawDocTitle(doc, pageW, y, "PURCHASE ORDER", colors)
  y += 10

  drawMetaRow(doc, margin, pageW, y,
    `PO #: ${data.poNo}`,
    "",
    `Date: ${data.date}`,
  )
  y += 14

  const party: PartyInfo = {
    name: data.supplier || "Supplier Name",
  }
  const issuer: IssuerInfo = {
    name: "Service Center",
  }
  y = drawPartyCards(doc, margin, pageW, y, "Supplier", party, "Issued By", issuer, colors)

  const tableBody = data.items.map((item) => [
    item.description || "—",
    String(item.quantity),
    `₹${fmt(item.rate)}`,
    "",
    `₹${fmt(item.quantity * item.rate)}`,
  ])
  y = drawTableWithAutoTable(doc, autoTable, y, margin,
    ["DESCRIPTION", "QTY", "RATE", "", "AMOUNT"],
    tableBody,
    colors,
    { 0: { cellWidth: "auto" }, 1: { cellWidth: 18, halign: "center" }, 2: { cellWidth: 22, halign: "right" }, 3: { cellWidth: 0 }, 4: { cellWidth: 28, halign: "right", fontStyle: "bold" } },
  )

  const totals = [
    { label: "SUBTOTAL", value: `₹${fmt(data.total)}` },
    { label: "TOTAL PO VALUE", value: `₹${fmt(data.total)}`, highlight: true },
  ]
  y = drawTotalsBox(doc, pageW, margin, y, totals, colors)
  y += 2

  if (y + 15 > pageH - 28) { doc.addPage(); y = margin + 10 }
  drawSignatureArea(doc, margin, pageW, y, "Requested By", "Authorised Signatory")
  y += 12

  drawFooter(doc, margin, pageW, pageH)

  const fileName = `purchase-order-${data.poNo}.pdf`
  doc.save(fileName)
}
