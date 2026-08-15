"use client"

import { useState, useEffect } from "react"
import { PreviewShell } from "@/components/preview/preview-shell"
import { BusinessLetterView } from "@/components/preview/business-letter-view"
import { RentReceiptView } from "@/components/preview/rent-receipt-view"
import { SalarySlipView } from "@/components/preview/salary-slip-view"
import { InvoicePreview } from "@/components/invoice-templates/components"
import { StudioTemplate, LedgerTemplate, MinimalMonoTemplate, VyaparDesiTemplate, MinimalFreelancerTemplate, RedModernTemplate, MaroonGeometricTemplate } from "@/components/invoice-templates/components"
import { VelvetReceipt, SageReceipt, CarbonReceipt, SaffronReceipt } from "@/components/cash-receipt-templates"
import type { InvoiceData as TemplateInvoiceData } from "@/components/invoice-templates/data/invoiceTypes"

const TEMPLATE_MAP: Record<string, React.FC<{ invoice: TemplateInvoiceData }>> = {
  StudioTemplate,
  LedgerTemplate,
  MinimalMonoTemplate,
  VyaparDesiTemplate,
  MinimalFreelancerTemplate,
  RedModernTemplate,
  MaroonGeometricTemplate,
}

const RECEIPT_MAP: Record<string, React.FC<{ invoice: TemplateInvoiceData }>> = {
  VelvetReceipt,
  SageReceipt,
  CarbonReceipt,
  SaffronReceipt,
}

interface ShareClientProps {
  documentData: any
  documentType: string
  template?: string
}

export function ShareClient({ documentData, documentType, template }: ShareClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Support both wrapped PreviewStoreItem and raw data structures
  const isWrapped = documentData && typeof documentData === "object" && "docType" in documentData
  const actualDocType = isWrapped ? documentData.docType : documentType
  const actualTemplate = isWrapped ? documentData.templateName : template
  const actualTitle = isWrapped ? documentData.title : "Document Preview"
  const actualFileName = isWrapped ? documentData.fileName : "document.pdf"
  const actualInvoiceData = isWrapped ? documentData.invoiceData : documentData
  const actualCustomData = isWrapped ? documentData.data : documentData

  const renderContent = () => {
    switch (actualDocType) {
      case "template": {
        const Tpl = TEMPLATE_MAP[actualTemplate as string] || MinimalMonoTemplate
        return (
          <InvoicePreview hideToolbar={true}>
            <Tpl invoice={actualInvoiceData as TemplateInvoiceData} />
          </InvoicePreview>
        )
      }
      case "payment-receipt": {
        const Tpl = RECEIPT_MAP[actualTemplate as string] || VelvetReceipt
        return (
          <InvoicePreview hideToolbar={true}>
            <Tpl invoice={actualInvoiceData as TemplateInvoiceData} />
          </InvoicePreview>
        )
      }
      case "business-letter": {
        const d = actualCustomData as Record<string, string>
        return (
          <BusinessLetterView
            senderName={d.senderName || ""}
            senderCompany={d.senderCompany || ""}
            senderAddress={d.senderAddress || ""}
            recipientName={d.recipientName || ""}
            recipientCompany={d.recipientCompany || ""}
            recipientAddress={d.recipientAddress || ""}
            letterDate={d.letterDate || ""}
            subject={d.subject || ""}
            letterBody={d.letterBody || ""}
            signature={d.signature || ""}
            companyLogo={d.companyLogo || ""}
          />
        )
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
        const d = actualCustomData as Record<string, string>
        return (
          <SalarySlipView
            companyName={d.companyName || ""}
            companyLogo={d.companyLogo || ""}
            companyAddress={d.companyAddress || ""}
            employeeName={d.employeeName || ""}
            employeeId={d.employeeId || ""}
            designation={d.designation || ""}
            department={d.department || ""}
            pan={d.pan || ""}
            uan={d.uan || ""}
            bankName={d.bankName || ""}
            bankAccount={d.bankAccount || ""}
            payPeriod={d.payPeriod || ""}
            paidDays={d.paidDays || ""}
            lopDays={d.lopDays || ""}
            payDate={d.payDate || ""}
            basic={d.basic || ""}
            hra={d.hra || ""}
            da={d.da || ""}
            conveyance={d.conveyance || ""}
            medical={d.medical || ""}
            special={d.special || ""}
            pf={d.pf || ""}
            esi={d.esi || ""}
            profTax={d.profTax || ""}
            tds={d.tds || ""}
          />
        )
      }
      default:
        return <p className="text-center text-muted-foreground py-12">Unknown document type</p>
    }
  }

  return (
    <PreviewShell
      title={actualTitle}
      fileName={actualFileName}
      hideBack={true}
      hideShare={true}
    >
      {renderContent()}
    </PreviewShell>
  )
}
