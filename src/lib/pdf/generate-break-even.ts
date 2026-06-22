import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  initPdfFonts,
  getDefaultColors,
  drawDocumentBorder,
  drawDocTitle,
  drawAccentLine,
  drawTotalsBox,
  drawFooter,
  fmt
} from "./shared"

interface BreakEvenData {
  fixedCost: number
  variableCost: number
  sellingPrice: number
  breakEvenUnits: number
  breakEvenRevenue: number
  contribution: number
  sampleVolumes: { units: number; profit: number }[]
}

export async function generateBreakEvenPDF(data: BreakEvenData) {
  const doc = new jsPDF()
  await initPdfFonts(doc)

  const colors = getDefaultColors("invoice") // Using invoice colors (blue)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15

  drawDocumentBorder(doc, margin, pageW, pageH)
  drawAccentLine(doc, margin, pageW - margin * 2, margin, colors)

  drawDocTitle(doc, pageW, margin + 15, "Break-Even Analysis", colors)

  let y = margin + 30

  // Inputs
  doc.setFont("Inter", "bold")
  doc.setFontSize(12)
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.text("Input Variables", margin, y)
  y += 5

  const fmtUnits = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 0 })

  autoTable(doc, {
    startY: y,
    head: [["Description", "Value"]],
    body: [
      ["Fixed Costs", `Rs. ${fmt(data.fixedCost)}`],
      ["Variable Cost Per Unit", `Rs. ${fmt(data.variableCost)}`],
      ["Selling Price Per Unit", `Rs. ${fmt(data.sellingPrice)}`]
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
    ["Contribution Per Unit", `Rs. ${fmt(data.contribution)}`],
    ["Break-Even Point (Units)", `${fmtUnits(data.breakEvenUnits)} units`],
    ["Break-Even Revenue", `Rs. ${fmt(data.breakEvenRevenue)}`]
  ]

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: resultsBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]], textColor: [255, 255, 255], fontStyle: "bold" },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // Sample Volumes
  if (data.sampleVolumes && data.sampleVolumes.length > 0) {
    doc.setFont("Inter", "bold")
    doc.setFontSize(12)
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.text("Profit / Loss at Different Volumes", margin, y)
    y += 5

    const samplesBody = data.sampleVolumes.map(v => [
      `${fmtUnits(v.units)} units`,
      `${v.profit >= 0 ? "+" : ""}Rs. ${fmt(v.profit)}`
    ])

    autoTable(doc, {
      startY: y,
      head: [["Volume (Units)", "Profit / Loss"]],
      body: samplesBody,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        1: { halign: "right" }
      }
    })
    y = (doc as any).lastAutoTable.finalY + 15
  }

  drawFooter(doc, margin, pageW, pageH)

  doc.save("break_even_analysis.pdf")
}
