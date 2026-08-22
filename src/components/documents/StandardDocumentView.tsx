"use client"

import React from "react"
import { InvoiceData } from "@/components/invoice-templates/data/invoiceTypes"
import { getDocumentConfig } from "./documentConfig"
import {
  InvoiceDocument,
  QuotationDocument,
  ProformaDocument,
  PurchaseOrderDocument,
  DeliveryChallanDocument,
  EstimateDocument,
  CreditNoteDocument,
  DebitNoteDocument,
} from "./layouts"

interface StandardDocumentViewProps {
  invoice: InvoiceData
  className?: string
  documentType?: string
}

export function StandardDocumentView({
  invoice,
  className = "",
  documentType,
}: StandardDocumentViewProps) {
  const config = getDocumentConfig(documentType || invoice.documentType)

  // Routing dispatcher to render the appropriate custom layout with centralized terminology
  switch (config.key) {
    case "quotation":
      return <QuotationDocument invoice={invoice} className={className} config={config} />
    case "proforma-invoice":
      return <ProformaDocument invoice={invoice} className={className} config={config} />
    case "purchase-order":
      return <PurchaseOrderDocument invoice={invoice} className={className} config={config} />
    case "delivery-challan":
      return <DeliveryChallanDocument invoice={invoice} className={className} config={config} />
    case "estimate":
      return <EstimateDocument invoice={invoice} className={className} config={config} />
    case "credit-note":
      return <CreditNoteDocument invoice={invoice} className={className} config={config} />
    case "debit-note":
      return <DebitNoteDocument invoice={invoice} className={className} config={config} />
    case "invoice":
    default:
      return <InvoiceDocument invoice={invoice} className={className} config={config} />
  }
}

