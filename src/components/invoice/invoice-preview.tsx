"use client"

import { useEffect, useState } from "react"
import type { InvoiceData } from "@/lib/pdf/types"
import { registerInvoiceFonts } from "@/lib/pdf/fonts"

interface InvoicePreviewProps {
  data: InvoiceData
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const [RenderedPreview, setRenderedPreview] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    let mounted = true

    async function render() {
      const { PDFViewer, Font } = await import("@react-pdf/renderer")
      registerInvoiceFonts(Font)
      const { InvoiceDocument } = await import("@/lib/pdf/invoice-template")

      if (!mounted) return

      setRenderedPreview(
        <PDFViewer
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "8px",
          }}
          showToolbar={false}
        >
          {InvoiceDocument({ data })}
        </PDFViewer>,
      )
    }

    render()

    return () => {
      mounted = false
    }
  }, [data])

  if (!RenderedPreview) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        Loading preview...
      </div>
    )
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {RenderedPreview}
    </div>
  )
}
