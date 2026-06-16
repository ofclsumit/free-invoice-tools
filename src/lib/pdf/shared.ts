import type jsPDF from "jspdf"

function arrayBufferToBinaryString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let result = ""
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    result += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return result
}

export async function initPdfFonts(doc: jsPDF): Promise<void> {
  const loadFont = async (path: string, name: string, style: string) => {
    const response = await fetch(path)
    const buffer = await response.arrayBuffer()
    const data = arrayBufferToBinaryString(buffer)
    doc.addFileToVFS(path.split("/").pop()!, data)
    doc.addFont(path.split("/").pop()!, name, style)
  }
  await loadFont("/fonts/Inter-Regular.ttf", "Inter", "normal")
  await loadFont("/fonts/Inter-Bold.ttf", "Inter", "bold")
  await loadFont("/fonts/Inter-Italic.ttf", "Inter", "italic")
  doc.setFont("Inter", "normal")
}

export interface PartyInfo {
  name: string
  phone?: string
  address?: string
  email?: string
  gstin?: string
}

export interface IssuerInfo {
  name: string
  contact?: string
  email?: string
  address?: string
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

export const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function numToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  if (num === 0) return "Zero"
  const inWords = (n: number): string => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "")
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "")
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "")
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "")
  }
  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)
  let result = inWords(intPart) + " Rupees"
  if (decPart > 0) result += " and " + inWords(decPart) + " Paise"
  return result + " Only"
}

export interface PdfColors {
  accent: [number, number, number]
  title: [number, number, number]
  cardBg: [number, number, number]
  cardBorder: [number, number, number]
  primary: [number, number, number]
}

export function getDefaultColors(type: string): PdfColors {
  switch (type) {
    case "invoice":
      return { accent: [37, 99, 235], title: [37, 99, 235], cardBg: [248, 250, 252], cardBorder: [226, 232, 240], primary: [37, 99, 235] }
    case "quotation":
      return { accent: [124, 58, 237], title: [124, 58, 237], cardBg: [250, 245, 255], cardBorder: [233, 213, 255], primary: [124, 58, 237] }
    case "challan":
      return { accent: [8, 145, 178], title: [8, 145, 178], cardBg: [236, 254, 255], cardBorder: [207, 250, 254], primary: [8, 145, 178] }
    case "gst":
      return { accent: [37, 99, 235], title: [37, 99, 235], cardBg: [248, 250, 252], cardBorder: [226, 232, 240], primary: [37, 99, 235] }
    case "gstin":
      return { accent: [5, 150, 105], title: [5, 150, 105], cardBg: [240, 253, 244], cardBorder: [187, 247, 208], primary: [5, 150, 105] }
    case "hsn":
      return { accent: [234, 88, 12], title: [234, 88, 12], cardBg: [255, 247, 237], cardBorder: [254, 215, 170], primary: [234, 88, 12] }
    case "profit":
      return { accent: [217, 119, 6], title: [217, 119, 6], cardBg: [254, 243, 199], cardBorder: [253, 230, 138], primary: [217, 119, 6] }
    case "purchase":
      return { accent: [13, 148, 136], title: [13, 148, 136], cardBg: [240, 253, 250], cardBorder: [204, 251, 241], primary: [13, 148, 136] }
    case "receipt":
      return { accent: [219, 39, 119], title: [219, 39, 119], cardBg: [255, 241, 248], cardBorder: [251, 207, 232], primary: [219, 39, 119] }
    default:
      return { accent: [37, 99, 235], title: [37, 99, 235], cardBg: [248, 250, 252], cardBorder: [226, 232, 240], primary: [37, 99, 235] }
  }
}

export function drawDocumentBorder(doc: jsPDF, margin: number, pageW: number, pageH: number) {
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.rect(margin - 3, margin - 3, pageW - margin * 2 + 6, pageH - margin * 2 + 6)
  doc.setLineWidth(0.2)
}

export function drawAccentLine(doc: jsPDF, margin: number, contentW: number, y: number, colors: PdfColors) {
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2])
  doc.rect(margin, y, contentW, 2.5, "F")
}

export function drawDocTitle(doc: jsPDF, pageW: number, y: number, title: string, colors: PdfColors) {
  doc.setFont("Inter", "bold")
  doc.setFontSize(22)
  doc.setTextColor(colors.title[0], colors.title[1], colors.title[2])
  doc.text(title, pageW / 2, y, { align: "center" })
}

export function drawMetaRow(
  doc: jsPDF,
  margin: number,
  pageW: number,
  y: number,
  leftMeta: string,
  centerMeta: string,
  rightMeta: string,
) {
  const contentW = pageW - margin * 2
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, y, contentW, 9, 2, 2, "FD")

  doc.setFont("Inter", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)

  if (leftMeta) doc.text(leftMeta, margin + 6, y + 6)
  if (centerMeta) doc.text(centerMeta, pageW / 2, y + 6, { align: "center" })
  if (rightMeta) doc.text(rightMeta, pageW - margin - 6, y + 6, { align: "right" })
}

export function drawPartyCards(
  doc: jsPDF,
  margin: number,
  pageW: number,
  y: number,
  leftLabel: string,
  leftParty: PartyInfo,
  rightLabel: string,
  rightParty: IssuerInfo,
  colors: PdfColors,
): number {
  const contentW = pageW - margin * 2
  const halfW = contentW / 2 - 3
  const cardH = 32

  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2])
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2])

  // Left card
  doc.roundedRect(margin, y, halfW, cardH, 2, 2, "FD")
  doc.setFont("Inter", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text(leftLabel.toUpperCase(), margin + 5, y + 5)

  doc.setFont("Inter", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text(leftParty.name || "\u2014", margin + 5, y + 13)
  doc.setFont("Inter", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)

  let ly = y + 19
  if (leftParty.phone) {
    doc.text(`Ph: ${leftParty.phone}`, margin + 5, ly)
    ly += 4
  }
  if (leftParty.address) {
    const addrLines = doc.splitTextToSize(leftParty.address, halfW - 10)
    addrLines.slice(0, 2).forEach((l: string) => {
      doc.text(l, margin + 5, ly)
      ly += 3.5
    })
  }

  // Right card
  const rx = pageW - margin - halfW
  doc.roundedRect(rx, y, halfW, cardH, 2, 2, "FD")
  doc.setFont("Inter", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text(rightLabel.toUpperCase(), rx + 5, y + 5)

  doc.setFont("Inter", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text(rightParty.name || "\u2014", rx + 5, y + 13)
  doc.setFont("Inter", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)

  let ry = y + 19
  if (rightParty.contact) {
    doc.text(`Ph: ${rightParty.contact}`, rx + 5, ry)
    ry += 4
  }
  if (rightParty.email) {
    doc.text(rightParty.email, rx + 5, ry)
    ry += 4
  }
  if (rightParty.address) {
    const addrLines = doc.splitTextToSize(rightParty.address, halfW - 10)
    addrLines.slice(0, 1).forEach((l: string) => {
      doc.text(l, rx + 5, ry)
      ry += 3.5
    })
  }

  return y + cardH + 6
}

export function drawTotalsBox(
  doc: jsPDF,
  pageW: number,
  margin: number,
  y: number,
  rows: Array<{ label: string; value: string; highlight?: boolean }>,
  colors: PdfColors,
): number {
  const boxW = 80
  const x = pageW - margin - boxW
  const rowH = 6.5
  const headerH = 8
  const totalH = rows.length * rowH + headerH

  doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2])
  doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2])
  doc.roundedRect(x, y, boxW, totalH, 2, 2, "FD")

  let ty = y + 5
  rows.forEach((row) => {
    if (row.highlight) {
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2])
      doc.roundedRect(x, ty - 1.5, boxW, rowH + 3, 1.5, 1.5, "F")
      doc.setFont("Inter", "bold")
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text(row.label, x + 5, ty + 4)
      doc.text(row.value, x + boxW - 5, ty + 4, { align: "right" })
      ty += rowH + 3
    } else {
      doc.setFont("Inter", "normal")
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139)
      doc.text(row.label, x + 5, ty + 1.5)
      doc.setTextColor(15, 23, 42)
      doc.setFont("Inter", "bold")
      doc.text(row.value, x + boxW - 5, ty + 1.5, { align: "right" })
      ty += rowH
    }
  })

  return y + totalH + 6
}

export function drawTableWithAutoTable(
  doc: jsPDF,
  autoTable: any,
  y: number,
  margin: number,
  head: string[],
  body: string[][],
  colors: PdfColors,
  colStyles?: Record<number, any>,
): number {
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]] },
    columnStyles: colStyles || {},
  })
  return (doc as any).lastAutoTable.finalY + 6
}

export function drawFooter(
  doc: jsPDF,
  margin: number,
  pageW: number,
  pageH: number,
  extraY?: number,
) {
  const bottomY = pageH - 12

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, bottomY - 3, pageW - margin, bottomY - 3)

  doc.setFont("Inter", "normal")
  doc.setFontSize(7)
  doc.setTextColor(160, 160, 160)
  doc.text("Create your own billing documents at quoteflow.in", pageW / 2, bottomY + 1, { align: "center" })
}

export function drawSignatureArea(
  doc: jsPDF,
  margin: number,
  pageW: number,
  y: number,
  customerLabel = "Customer Signature",
  authorizedLabel = "Authorized Signature",
) {
  const lineW = 50
  const gap = 30
  const centerX = pageW / 2
  const leftX = centerX - gap - lineW
  const rightX = centerX + gap

  doc.setDrawColor(209, 213, 219)
  doc.line(leftX, y, leftX + lineW, y)
  doc.line(rightX, y, rightX + lineW, y)

  doc.setFont("Inter", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text(customerLabel, leftX + lineW / 2, y + 5, { align: "center" })
  doc.text(authorizedLabel, rightX + lineW / 2, y + 5, { align: "center" })
}
