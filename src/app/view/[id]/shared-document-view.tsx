"use client"

import { useState, useEffect } from "react"
import { InvoicePreview, StudioTemplate, LedgerTemplate, MinimalMonoTemplate, VyaparDesiTemplate, ClassicBooksTemplate } from "@/components/invoice-templates/components"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/components"
import { decodeShareData } from "@/lib/share-utils"

const TEMPLATE_MAP: Record<string, React.FC<{ invoice: TemplateInvoiceData }>> = {
  StudioTemplate,
  LedgerTemplate,
  MinimalMonoTemplate,
  VyaparDesiTemplate,
  ClassicBooksTemplate,
}

interface SharedDocumentViewProps {
  invoiceData?: TemplateInvoiceData
  template?: string
  encodedData?: string
}

export function SharedDocumentView({ invoiceData, template, encodedData }: SharedDocumentViewProps) {
  const [mounted, setMounted] = useState(false)
  const [decodedData, setDecodedData] = useState<any>(null)
  const [decodeError, setDecodeError] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (encodedData) {
      try {
        const decoded = decodeShareData(encodedData)
        setDecodedData(decoded)
      } catch {
        setDecodeError(true)
      }
    }
  }, [encodedData])

  if (!mounted) return null

  if (decodeError) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-red-500 font-semibold">This share link is invalid or corrupted.</p>
        <p className="text-sm text-muted-foreground mt-2">Please ask the sender to generate a new link.</p>
      </div>
    )
  }

  const actualData = decodedData || invoiceData
  const actualTemplate = decodedData?.template || template || "StudioTemplate"
  const actualInvoiceData = decodedData?.invoiceData || actualData

  if (!actualInvoiceData) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-border">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    )
  }

  const Template = TEMPLATE_MAP[actualTemplate] || StudioTemplate

  return (
    <InvoicePreview hideToolbar={true}>
      <Template invoice={actualInvoiceData as TemplateInvoiceData} />
    </InvoicePreview>
  )
}
