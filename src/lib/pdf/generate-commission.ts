import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  initPdfFonts,
  getDefaultColors,
  drawDocumentBorder,
  drawDocTitle,
  drawAccentLine,
  drawFooter,
  fmt
} from "./shared"

interface CommissionData {
  sale: number
  rate: number
  split: number
  commissionAmount: number
  yourShare: number
  otherShare: number
  netAmount: number
}

export async function generateCommissionPDF(data: CommissionData) {
  const doc = new jsPDF()
  await initPdfFonts(doc)

  const colors = getDefaultColors("invoice") // Using invoice colors
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, pageW - margin * 2, margin, colors)

  drawDocTitle(doc, pageW, margin + 15, "Commission Analysis", colors)

  let y = margin + 30

  // Inputs
  doc.setFont("Inter", "bold")
  doc.setFontSize(12)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text("Input Variables", margin, y)
  y += 5

  autoTable(doc, {
    startY: y,
    head: [["Description", "Value"]],
    body: [
      ["Sale Amount", `Rs. ${fmt(data.sale)}`],
      ["Commission Rate", `${data.rate}%`],
      ["Your Split Share", `${data.split}%`]
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
  })
  
  y = (doc as any).lastAutoTable.finalY + 15

  // Results
  doc.setFont("Inter", "bold")
  doc.setFontSize(12)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text("Analysis Results", margin, y)
  y += 5

  const resultsBody = [
    ["Total Commission", `Rs. ${fmt(data.commissionAmount)}`],
    ["Your Share", `Rs. ${fmt(data.yourShare)}`]
  ]

  if (data.split < 100) {
    resultsBody.push(["Other Party Share", `Rs. ${fmt(data.otherShare)}`])
  }

  resultsBody.push(["Net Amount After Commission", `Rs. ${fmt(data.netAmount)}`])

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: resultsBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]], textColor: [255, 255, 255], fontStyle: "bold" },
  })

  drawFooter(doc, margin, pageW, pageH)

  doc.save("commission_analysis.pdf")
}
