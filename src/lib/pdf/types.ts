export interface InvoiceItemInput {
  description: string
  hsnCode?: string
  quantity: number
  unit?: string
  rate: number
  discount: number
  gstRate: number
  gstType: "CGST_SGST" | "IGST" | "EXEMPT"
}

export interface InvoiceItemTotals {
  description: string
  hsnCode?: string
  quantity: number
  unit?: string
  rate: number
  discount: number
  gstRate: number
  gstType: "CGST_SGST" | "IGST" | "EXEMPT"
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  taxAmount: number
  total: number
  discountAmount: number
}

export interface InvoiceFormData {
  businessName: string
  businessGstin?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  clientName: string
  clientGstin?: string
  clientAddress?: string
  clientEmail?: string
  clientPhone?: string
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  currency: string
  items: InvoiceItemInput[]
  notes?: string
  terms?: string
  upiId?: string
}

export interface InvoiceTotals {
  subtotal: number
  totalCgst: number
  totalSgst: number
  totalIgst: number
  totalTax: number
  grandTotal: number
  totalDiscount: number
  itemsWithTotals: InvoiceItemTotals[]
}

export interface InvoiceData extends InvoiceFormData {
  subtotal: number
  totalCgst: number
  totalSgst: number
  totalIgst: number
  totalTax: number
  grandTotal: number
  totalDiscount: number
  itemsWithTotals: InvoiceItemTotals[]
}
