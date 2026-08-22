"use client"

import { useState, useEffect } from "react"
import { PreviewShell } from "@/components/preview/preview-shell"
import { BusinessLetterView } from "@/components/preview/business-letter-view"
import { RentReceiptView } from "@/components/preview/rent-receipt-view"
import { SalarySlipView } from "@/components/preview/salary-slip-view"
import { InvoicePreview } from "@/components/invoice-templates/components"
import { StandardDocumentView, StandardPaymentReceiptView } from "@/components/documents"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/data/invoiceTypes"

import { FullScreenLoader } from "@/components/shared/loading"

interface ShareClientProps {
  documentData: any
  documentType: string
  template?: string
}

export function ShareClient({ documentData, documentType }: ShareClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <FullScreenLoader delayMs={150} message="Loading shared document..." />

  // Support both wrapped PreviewStoreItem and raw data structures
  const isWrapped = documentData && typeof documentData === "object" && "docType" in documentData
  const actualDocType = isWrapped ? documentData.docType : documentType
  const actualTitle = isWrapped ? documentData.title : "Document Preview"
  const actualFileName = isWrapped ? documentData.fileName : "document.pdf"
  const actualInvoiceData = isWrapped ? documentData.invoiceData : documentData
  const actualCustomData = isWrapped ? documentData.data : documentData

  const renderContent = () => {
    switch (actualDocType) {
      case "template":
      case "invoice":
      case "quotation":
      case "delivery-challan":
      case "purchase-order":
      case "proforma-invoice":
      case "estimate":
      case "credit-note":
      case "debit-note": {
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardDocumentView invoice={actualInvoiceData as TemplateInvoiceData} documentType={actualDocType} />
          </InvoicePreview>
        )
      }
      case "payment-receipt": {
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardPaymentReceiptView invoice={actualInvoiceData as TemplateInvoiceData} />
          </InvoicePreview>
        )
      }
      case "business-letter": {
        return <BusinessLetterView {...(actualCustomData as any)} />
      }
      case "rent-receipt": {
        const d = actualCustomData as Record<string, string>
        return (
          <RentReceiptView
            tenantName={d.tenantName || ""}
            landlordName={d.landlordName || ""}
            landlordPan={d.landlordPan || ""}
            propertyAddress={d.propertyAddress || ""}
            monthlyRent={d.monthlyRent || ""}
            startDate={d.startDate || ""}
            endDate={d.endDate || ""}
            paymentDate={d.paymentDate || ""}
          />
        )
      }
      case "salary-slip": {
        return <SalarySlipView {...(actualCustomData as any)} />
      }
      default:
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardDocumentView invoice={actualInvoiceData as TemplateInvoiceData} documentType={actualDocType} />
          </InvoicePreview>
        )
    }
  }

  return (
    <PreviewShell
      title={actualTitle}
      fileName={actualFileName}
      documentType={actualDocType}
      documentData={documentData}
    >
      {renderContent()}
    </PreviewShell>
  )
}

export default ShareClient
