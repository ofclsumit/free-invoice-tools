"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { PreviewShell } from "@/components/preview/preview-shell"
import { BusinessLetterView } from "@/components/preview/business-letter-view"
import { RentReceiptView } from "@/components/preview/rent-receipt-view"
import { SalarySlipView } from "@/components/preview/salary-slip-view"
import { InvoicePreview } from "@/components/invoice-templates/components"
import { StandardDocumentView, StandardPaymentReceiptView } from "@/components/documents"
import {
  GstDocument,
  EmiDocument,
  BreakEvenDocument,
  ProfitMarginDocument,
  InterestDocument,
  CommissionDocument,
} from "@/components/calculator-documents"
import { fetchPreviewData } from "@/lib/preview-store"
import type { PreviewStoreItem } from "@/lib/preview-store"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/data/invoiceTypes"

import { FullScreenLoader } from "@/components/shared/loading"

export default function PreviewPage() {
  const router = useRouter()
  const params = useParams()
  const [data, setData] = useState<PreviewStoreItem | null>(null)
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!params?.id) { setError(true); return }
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    fetchPreviewData(id).then(item => {
      if (item) setData(item)
      else setError(true)
    })
  }, [mounted, params])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  if (!mounted || (!data && !error)) {
    return <FullScreenLoader delayMs={150} message="Preparing preview..." />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Preview not available</h2>
          <p className="text-sm text-muted-foreground mb-6">This preview link has expired or is invalid. Please go back and generate a new preview.</p>
          <button onClick={() => router.push("/")} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const { docType, title, fileName, invoiceData, data: customData } = data

  const renderContent = () => {
    switch (docType) {
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
            <StandardDocumentView invoice={invoiceData as TemplateInvoiceData} documentType={docType} />
          </InvoicePreview>
        )
      }
      case "payment-receipt": {
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardPaymentReceiptView invoice={invoiceData as TemplateInvoiceData} />
          </InvoicePreview>
        )
      }
      case "business-letter": {
        return <BusinessLetterView {...(customData as any)} />
      }
      case "rent-receipt": {
        const d = customData as Record<string, string>
        return <RentReceiptView tenantName={d.tenantName || ""} landlordName={d.landlordName || ""} landlordPan={d.landlordPan || ""} propertyAddress={d.propertyAddress || ""} monthlyRent={d.monthlyRent || ""} startDate={d.startDate || ""} endDate={d.endDate || ""} paymentDate={d.paymentDate || ""} />
      }
      case "salary-slip": {
        return <SalarySlipView {...(customData as any)} />
      }
      case "gst-calculator":
      case "reverse-gst-calculator":
      case "gst-split-calculator": {
        return <GstDocument {...(customData as any)} />
      }
      case "emi-calculator":
      case "loan-calculator": {
        return <EmiDocument {...(customData as any)} />
      }
      case "break-even-calculator": {
        return <BreakEvenDocument {...(customData as any)} />
      }
      case "profit-margin":
      case "discount-calculator": {
        return <ProfitMarginDocument {...(customData as any)} />
      }
      case "interest-calculator": {
        return <InterestDocument {...(customData as any)} />
      }
      case "commission-calculator": {
        return <CommissionDocument {...(customData as any)} />
      }
      case "calculator-report": {
        const d = customData as any
        if (d?.calcType === "emi" || d?.calcType === "loan") return <EmiDocument {...d} />
        if (d?.calcType === "break-even") return <BreakEvenDocument {...d} />
        if (d?.calcType === "profit-margin" || d?.calcType === "discount") return <ProfitMarginDocument {...d} />
        if (d?.calcType === "interest") return <InterestDocument {...d} />
        if (d?.calcType === "commission") return <CommissionDocument {...d} />
        return <GstDocument {...d} />
      }
      default:
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardDocumentView invoice={invoiceData as TemplateInvoiceData} documentType={docType} />
          </InvoicePreview>
        )
    }
  }

  const isCalculator = docType.includes("calculator") || docType === "profit-margin" || docType === "calculator-report"

  return (
    <PreviewShell
      title={title}
      fileName={fileName}
      onBack={handleBack}
      documentType={docType}
      documentData={data}
      printRootId={isCalculator ? "calculator-print-root" : "preview-print-root"}
    >
      {renderContent()}
    </PreviewShell>
  )
}
