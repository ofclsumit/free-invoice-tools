export type DocumentTypeKey =
  | "invoice"
  | "quotation"
  | "proforma-invoice"
  | "purchase-order"
  | "delivery-challan"
  | "credit-note"
  | "debit-note"
  | "estimate"
  | "payment-receipt"

export interface DocumentTypeConfig {
  key: DocumentTypeKey
  title: string
  subTitle?: string
  badgeLabel?: string
  numberLabel: string
  dateLabel: string
  dueDateLabel?: string
  referenceLabel?: string
  totalLabel?: string
}

export const documentTypeConfig: Record<DocumentTypeKey, DocumentTypeConfig> = {
  invoice: {
    key: "invoice",
    title: "INVOICE",
    subTitle: "Tax Invoice",
    numberLabel: "Invoice No:",
    dateLabel: "Invoice Date:",
    dueDateLabel: "Due Date:",
    totalLabel: "Amount Due",
  },
  quotation: {
    key: "quotation",
    title: "QUOTATION",
    badgeLabel: "Commercial Proposal",
    numberLabel: "Quotation No:",
    dateLabel: "Quotation Date:",
    dueDateLabel: "Valid Until:",
    totalLabel: "Total Quoted Value",
  },
  "proforma-invoice": {
    key: "proforma-invoice",
    title: "PROFORMA INVOICE",
    badgeLabel: "Pre-Billing Commercial Document",
    numberLabel: "Proforma No:",
    dateLabel: "Proforma Date:",
    dueDateLabel: "Valid Until:",
    totalLabel: "Proforma Total",
  },
  "purchase-order": {
    key: "purchase-order",
    title: "PURCHASE ORDER",
    badgeLabel: "Official Procurement",
    numberLabel: "PO No:",
    dateLabel: "PO Date:",
    dueDateLabel: "Delivery Due:",
    totalLabel: "Authorized PO Value",
  },
  "delivery-challan": {
    key: "delivery-challan",
    title: "DELIVERY CHALLAN",
    badgeLabel: "Goods Transport & Delivery Document",
    numberLabel: "Challan No:",
    dateLabel: "Challan Date:",
    totalLabel: "Total Units Dispatched",
  },
  "credit-note": {
    key: "credit-note",
    title: "CREDIT NOTE",
    numberLabel: "Credit Note No:",
    dateLabel: "Credit Note Date:",
    referenceLabel: "Orig. Invoice Ref:",
    totalLabel: "Total Credit Amount",
  },
  "debit-note": {
    key: "debit-note",
    title: "DEBIT NOTE",
    numberLabel: "Debit Note No:",
    dateLabel: "Debit Note Date:",
    referenceLabel: "Orig. Invoice Ref:",
    totalLabel: "Total Debit Amount",
  },
  estimate: {
    key: "estimate",
    title: "COST ESTIMATE",
    badgeLabel: "Non-Binding Cost Estimate",
    numberLabel: "Estimate No:",
    dateLabel: "Estimate Date:",
    dueDateLabel: "Estimated Valid Until:",
    totalLabel: "Total Estimated Cost",
  },
  "payment-receipt": {
    key: "payment-receipt",
    title: "PAYMENT RECEIPT",
    subTitle: "Official Voucher",
    numberLabel: "Receipt No:",
    dateLabel: "Receipt Date:",
    totalLabel: "Amount Received",
  },
}

export function getDocumentConfig(type?: string): DocumentTypeConfig {
  if (!type) return documentTypeConfig.invoice

  const normalized = type.toLowerCase().replace(/[\s_-]+/g, "-").trim()

  if (normalized.includes("credit-note") || normalized === "creditnote") {
    return documentTypeConfig["credit-note"]
  }
  if (normalized.includes("debit-note") || normalized === "debitnote") {
    return documentTypeConfig["debit-note"]
  }
  if (normalized.includes("proforma")) {
    return documentTypeConfig["proforma-invoice"]
  }
  if (
    normalized.includes("purchase-order") ||
    normalized === "po" ||
    normalized === "purchaseorder"
  ) {
    return documentTypeConfig["purchase-order"]
  }
  if (
    normalized.includes("delivery-challan") ||
    normalized === "challan" ||
    normalized === "deliverychallan"
  ) {
    return documentTypeConfig["delivery-challan"]
  }
  if (normalized.includes("quotation") || normalized.includes("quote")) {
    return documentTypeConfig.quotation
  }
  if (normalized.includes("estimate")) {
    return documentTypeConfig.estimate
  }
  if (normalized.includes("receipt") || normalized.includes("payment-receipt")) {
    return documentTypeConfig["payment-receipt"]
  }
  return documentTypeConfig.invoice
}
