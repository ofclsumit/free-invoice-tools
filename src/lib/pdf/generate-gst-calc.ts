"use client"

import { loadFonts, registerFonts } from "./fonts"

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
  try {
    await loadFonts()

    const [{ pdf, Font }, { GSTCalcDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./gst-calc-template"),
    ])

    registerFonts(Font)

    const blob = await pdf(GSTCalcDocument({ data })).toBlob()

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `gst-calculation-${Math.floor(Date.now() / 1000)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("[PDF GST] Generation failed:", err)
    throw err
  }
}
