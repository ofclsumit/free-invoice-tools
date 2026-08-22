import React from "react"
import {
  InvoiceData,
  computeInvoiceTotals,
  numberToWords,
} from "@/components/invoice-templates/data/invoiceTypes"
import { sheetStyle, format, Watermark } from "./shared"
import { DocumentTypeConfig, getDocumentConfig } from "../documentConfig"

interface DocumentProps {
  invoice: InvoiceData
  className?: string
  config?: DocumentTypeConfig
}

export function PurchaseOrderDocument({ invoice, className = "", config }: DocumentProps) {
  const docConfig = config || getDocumentConfig(invoice.documentType || "purchase-order")
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo, shipTo, gstMode } = invoice
  const isGstEnabled = gstMode && gstMode !== "none"

  return (
    <div
      className={`po-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Buyer-Dominant Header */}
        <header className="pb-5 border-b-2 border-[#111111] flex items-start justify-between gap-6">
          {/* Top-Left: BUYER Organization */}
          <div className="flex items-start gap-4 max-w-[58%]">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt="Buyer Logo"
                className="h-14 max-w-[150px] object-contain shrink-0 rounded border border-[#E5E5E5] p-1"
              />
            )}
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#555555] block">
                Purchasing Organization (Buyer)
              </span>
              <h1 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight">
                {company.name || "Purchasing Company"}
              </h1>
              {company.addressLines && (
                <p className="text-[14px] text-[#444444] leading-normal">{company.addressLines.filter(Boolean).join(", ")}</p>
              )}
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#444444] pt-0.5">
                {company.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
              {company.gstin && (
                <p className="text-[14px] text-[#111111] pt-0.5">
                  <strong className="text-[#444444]">Buyer GSTIN:</strong> <span className="font-mono font-bold">{company.gstin}</span>
                </p>
              )}
            </div>
          </div>

          {/* Top-Right: PURCHASE ORDER Badge & Metadata */}
          <div className="text-right shrink-0 min-w-[230px]">
            <div className="inline-block bg-[#111111] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-sm mb-1.5">
              {docConfig.badgeLabel || "Official Procurement"}
            </div>
            <h2 className="text-[24px] font-black uppercase tracking-tight text-[#111111]">
              {docConfig.title}
            </h2>
            <div className="mt-2 text-[14px] space-y-1.5">
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">{docConfig.numberLabel}</span>
                <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">{docConfig.dateLabel}</span>
                <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">{docConfig.dueDateLabel || "Delivery Due:"}</span>
                  <span className="font-bold text-[#111111]">{invoice.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Vendor vs Delivery Destination Grid */}
        <section className="my-5 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Vendor / Supplier (Order Issued To)
            </p>
            <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Vendor / Supplier Name"}</p>
            {billTo.addressLines && (
              <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>
            )}
            <div className="text-[14px] text-[#444444] pt-0.5 space-y-0.5">
              {billTo.phone && <p><strong>Contact:</strong> {billTo.phone}</p>}
              {billTo.email && <p><strong>Email:</strong> {billTo.email}</p>}
              {billTo.gstin && <p><strong>Vendor GSTIN:</strong> <span className="font-mono font-bold text-[#111111]">{billTo.gstin}</span></p>}
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Delivery Destination (Ship To Warehouse / Site)
            </p>
            {shipTo?.name ? (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{shipTo.name}</p>
                {shipTo.addressLines && <p className="text-[14px] text-[#444444] leading-normal">{shipTo.addressLines.filter(Boolean).join(", ")}</p>}
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{company.name || "Buyer Main Facility"}</p>
                {company.addressLines && <p className="text-[14px] text-[#444444] leading-normal">{company.addressLines.filter(Boolean).join(", ")}</p>}
              </>
            )}
          </div>
        </section>

        {/* Procurement Items Table */}
        <section className="my-2 flex-1">
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#181818] text-white text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 border-r border-[#333333] w-10 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-[#333333]">Material / Service Description</th>
                {isGstEnabled && <th className="py-2.5 px-2.5 border-r border-[#333333] w-20 text-center">HSN/SAC</th>}
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-right">Ordered Qty</th>
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-center">Unit</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-24 text-right">Unit Rate</th>
                {isGstEnabled && <th className="py-2.5 px-2 border-r border-[#333333] w-14 text-center">GST %</th>}
                <th className="py-2.5 px-3 text-right w-28">Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6] text-[14px]">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}>
                  <td className="py-2.5 px-3 text-center text-[#555555] border-r border-[#D6D6D6]">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r border-[#D6D6D6]">
                    <p className="font-semibold text-[#111111]">{item.description}</p>
                    {item.hsnSac && !isGstEnabled && <p className="text-[12px] text-[#555555]">HSN/SAC: {item.hsnSac}</p>}
                  </td>
                  {isGstEnabled && <td className="py-2.5 px-2.5 text-center font-mono text-[13px] border-r border-[#D6D6D6]">{item.hsnSac || "—"}</td>}
                  <td className="py-2.5 px-2.5 text-right font-mono border-r border-[#D6D6D6]">{item.quantity}</td>
                  <td className="py-2.5 px-2.5 text-center text-[#555555] border-r border-[#D6D6D6]">{item.unit || "NOS"}</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r border-[#D6D6D6]">{format(item.rate, invoice.currencySymbol)}</td>
                  {isGstEnabled && (
                    <td className="py-2.5 px-2 text-center font-mono text-[13px] border-r border-[#D6D6D6]">
                      {item.gstPercent || 0}%
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#111111]">
                    {format((item as any).lineTotal || (item.quantity * item.rate), invoice.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Order Summary & Procurement Terms */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-3">
            <div className="p-2.5 bg-[#F8F8F8] border border-[#D6D6D6] rounded text-[13.5px]">
              <span className="text-[#555555] block font-medium text-[11px] uppercase tracking-wide">Total Order Value in Words:</span>
              <strong className="text-[#111111] block mt-0.5">{numberToWords(totals.grandTotal)}</strong>
            </div>

            {invoice.notes && (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Procurement Terms & Delivery Instructions:</strong>
                <p className="whitespace-pre-line mt-0.5">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-between items-end space-y-4">
            <table className="w-full text-[14px] border border-[#D6D6D6] rounded overflow-hidden">
              <tbody>
                <tr className="border-b border-[#E5E5E5]">
                  <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Net Order Value</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.subTotal, invoice.currencySymbol)}</td>
                </tr>
                {totals.totalDiscount > 0 && (
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Discount</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-red-600">-{format(totals.totalDiscount, invoice.currencySymbol)}</td>
                  </tr>
                )}
                {isGstEnabled && totals.totalGst > 0 && (
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Taxes</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.totalGst, invoice.currencySymbol)}</td>
                  </tr>
                )}
                <tr className="bg-[#181818] text-white">
                  <td className="py-3 px-3 font-bold uppercase tracking-wider text-[13px] border-r border-[#333333]">
                    {docConfig.totalLabel || "Authorized PO Value"}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[17px] font-mono tabular-nums text-white">
                    {format(totals.grandTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Purchaser Authorized Signatory */}
            <div className="text-center min-w-[190px] pt-2">
              <p className="text-[12px] font-bold text-[#111111] mb-1">For {company.name || "Purchasing Entity"}</p>
              {(company.signatureUrl || (invoice as any).signatureUrl) ? (
                <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-10 max-w-[130px] object-contain mx-auto my-1" />
              ) : (
                <div className="h-8" />
              )}
              <div className="border-t border-[#111111] pt-1 px-3 mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Authorized Procurement Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
