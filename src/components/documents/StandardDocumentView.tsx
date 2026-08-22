"use client"

import React from "react"
import { InvoiceData } from "@/components/invoice-templates/data/invoiceTypes"
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
}

export function StandardDocumentView({
  invoice,
  className = "",
}: StandardDocumentViewProps) {
  const docType = (invoice.documentType || "INVOICE").toUpperCase()

  // Routing dispatcher to render the appropriate custom layout
  switch (docType) {
    case "QUOTATION":
      return <QuotationDocument invoice={invoice} className={className} />
    case "PROFORMA INVOICE":
      return <ProformaDocument invoice={invoice} className={className} />
    case "PURCHASE ORDER":
      return <PurchaseOrderDocument invoice={invoice} className={className} />
    case "DELIVERY CHALLAN":
      return <DeliveryChallanDocument invoice={invoice} className={className} />
    case "ESTIMATE":
      return <EstimateDocument invoice={invoice} className={className} />
    case "CREDIT NOTE":
      return <CreditNoteDocument invoice={invoice} className={className} />
    case "DEBIT NOTE":
      return <DebitNoteDocument invoice={invoice} className={className} />
    case "INVOICE":
    default:
      return <InvoiceDocument invoice={invoice} className={className} />
  }
}
