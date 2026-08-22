"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { PreviewShell } from "@/components/preview/preview-shell"
import { BusinessLetterView } from "@/components/preview/business-letter-view"
import { RentReceiptView } from "@/components/preview/rent-receipt-view"
import { SalarySlipView } from "@/components/preview/salary-slip-view"
import { InvoicePreview } from "@/components/invoice-templates/components"
import { StandardDocumentView, StandardPaymentReceiptView } from "@/components/documents"
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
            <StandardDocumentView invoice={invoiceData as TemplateInvoiceData} />
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
        const d = customData as Record<string, string>
        return <BusinessLetterView senderName={d.senderName || ""} senderCompany={d.senderCompany || ""} senderAddress={d.senderAddress || ""} recipientName={d.recipientName || ""} recipientCompany={d.recipientCompany || ""} recipientAddress={d.recipientAddress || ""} letterDate={d.letterDate || ""} subject={d.subject || ""} letterBody={d.letterBody || ""} signature={d.signature || ""} companyLogo={d.companyLogo || ""} />
      }
      case "rent-receipt": {
        const d = customData as Record<string, string>
        return <RentReceiptView tenantName={d.tenantName || ""} landlordName={d.landlordName || ""} landlordPan={d.landlordPan || ""} propertyAddress={d.propertyAddress || ""} monthlyRent={d.monthlyRent || ""} startDate={d.startDate || ""} endDate={d.endDate || ""} paymentDate={d.paymentDate || ""} />
      }
      case "salary-slip": {
        const d = customData as Record<string, string>
        return <SalarySlipView companyName={d.companyName || ""} companyLogo={d.companyLogo || ""} companyAddress={d.companyAddress || ""} employeeName={d.employeeName || ""} employeeId={d.employeeId || ""} designation={d.designation || ""} department={d.department || ""} pan={d.pan || ""} uan={d.uan || ""} bankName={d.bankName || ""} bankAccount={d.bankAccount || ""} payPeriod={d.payPeriod || ""} paidDays={d.paidDays || ""} lopDays={d.lopDays || ""} payDate={d.payDate || ""} basic={d.basic || ""} hra={d.hra || ""} da={d.da || ""} conveyance={d.conveyance || ""} medical={d.medical || ""} special={d.special || ""} pf={d.pf || ""} esi={d.esi || ""} profTax={d.profTax || ""} tds={d.tds || ""} />
      }
      default:
        return (
          <InvoicePreview hideToolbar={true}>
            <StandardDocumentView invoice={invoiceData as TemplateInvoiceData} />
          </InvoicePreview>
        )
    }
  }

  return (
    <PreviewShell
      title={title}
      fileName={fileName}
      onBack={handleBack}
      documentType={docType}
      documentData={data}
    >
      {renderContent()}
    </PreviewShell>
  )
}
