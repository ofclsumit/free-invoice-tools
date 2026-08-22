import React from "react"
import { formatCurrency } from "@/components/invoice-templates/data/invoiceTypes"

export const sheetStyle: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#111111",
  width: "100%",
  maxWidth: "210mm",
  minHeight: "297mm",
}

export const format = (amount: number, symbol?: string) =>
  formatCurrency(amount, symbol || "")

export function Watermark({ url }: { url: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
      <img src={url} alt="Watermark" className="max-w-[70%] max-h-[70%] object-contain" />
    </div>
  )
}
