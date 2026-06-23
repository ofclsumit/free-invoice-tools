"use client"

import { useState, useEffect } from "react"
import { InvoicePreview, StudioTemplate, LedgerTemplate, MinimalMonoTemplate, VyaparDesiTemplate, ClassicBooksTemplate } from "@/components/invoice-templates/components"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/components"

const TEMPLATE_MAP: Record<string, React.FC<{ invoice: TemplateInvoiceData }>> = {
  StudioTemplate,
  LedgerTemplate,
  MinimalMonoTemplate,
  VyaparDesiTemplate,
  ClassicBooksTemplate,
}

export function SharedDocumentView({ invoiceData, template }: { invoiceData: TemplateInvoiceData; template: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const Template = TEMPLATE_MAP[template] || StudioTemplate

  if (!mounted) return null

  return (
    <InvoicePreview hideToolbar={true}>
      <Template invoice={invoiceData} />
    </InvoicePreview>
  )
}
