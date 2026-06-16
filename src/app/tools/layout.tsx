import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | QuoteFlow",
    default: "Free Business Tools — GST Invoice, Quotation & more | QuoteFlow",
  },
  description:
    "Free online tools for Indian businesses: GST invoice generator, quotation maker, GST calculator, HSN code finder, GSTIN validator, receipt generator, delivery challan, purchase order, and profit margin calculator.",
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
