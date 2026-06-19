"use client"

import type { InvoiceData } from "./types"
import { loadFonts, registerFonts } from "./fonts"

export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  try {
    await loadFonts()

    const [{ pdf, Font }, { InvoiceDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./invoice-template"),
    ])

    registerFonts(Font)

    const blob = await pdf(InvoiceDocument({ data })).toBlob()

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${data.invoiceNumber || "invoice"}-${data.clientName || "client"}.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("[PDF] Generation failed:", err)
    throw err
  }
}
