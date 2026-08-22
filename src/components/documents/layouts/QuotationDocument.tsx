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

export function QuotationDocument({ invoice, className = "", config }: DocumentProps) {
  const docConfig = config || getDocumentConfig(invoice.documentType || "quotation")
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo, bankDetails, gstMode } = invoice
  const isGstEnabled = gstMode && gstMode !== "none"

  return (
    <div
      className={`quotation-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Proposal Header */}
        <header className="pb-5 border-b border-[#D6D6D6] flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 max-w-[55%]">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt="Logo"
                className="h-14 max-w-[150px] object-contain shrink-0 rounded border border-[#E5E5E5] p-1"
              />
            )}
            <div className="space-y-1 min-w-0">
              <h1 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight">
                {company.name || "Business Name"}
              </h1>
              {company.addressLines && company.addressLines.length > 0 && (
                <p className="text-[14px] text-[#444444] leading-normal">
                  {company.addressLines.filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#444444] pt-0.5">
                {company.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
              {company.gstin && (
                <p className="text-[14px] text-[#111111] pt-0.5">
                  <strong className="text-[#444444]">GSTIN:</strong>{" "}
                  <span className="font-mono font-bold">{company.gstin}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[230px]">
            <div className="inline-block bg-[#181818] text-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-sm mb-1.5">
              {docConfig.badgeLabel || "Commercial Proposal"}
            </div>
            <h2 className="text-[24px] font-black uppercase tracking-tight text-[#111111]">
              {docConfig.title}
            </h2>
            <div className="mt-2 text-[14px] space-y-1.5 text-left">
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">{docConfig.numberLabel}</span>
                <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">{docConfig.dateLabel}</span>
                <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between gap-4 border-b border-[#181818] bg-[#F4F4F4] px-1.5 py-1 rounded-sm">
                  <span className="text-[#181818] font-bold text-[12.5px] uppercase">{docConfig.dueDateLabel || "Valid Until:"}</span>
                  <span className="font-bold text-[#181818] text-[13px]">{invoice.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Client / Prepared For Section */}
        <section className="my-5 p-4 rounded bg-[#F8F8F8] border border-[#D6D6D6]">
          <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-1.5 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#444444]">
              Proposal Prepared For (Client / Prospect)
            </span>
            <span className="text-[11px] text-[#666666] font-medium italic">Confidential Commercial Offer</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[16px] font-bold text-[#111111]">{billTo.name || "Client / Company Name"}</p>
              {billTo.addressLines && billTo.addressLines.length > 0 && (
                <p className="text-[14px] text-[#444444] leading-normal pt-1">{billTo.addressLines.filter(Boolean).join(", ")}</p>
              )}
            </div>
            <div className="text-[14px] text-[#444444] space-y-0.5 sm:text-right">
              {billTo.phone && <p><strong>Contact:</strong> {billTo.phone}</p>}
              {billTo.email && <p><strong>Email:</strong> {billTo.email}</p>}
              {billTo.gstin && <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-[#111111]">{billTo.gstin}</span></p>}
            </div>
          </div>
        </section>

        {/* Proposed Scope & Pricing Schedule Table */}
        <section className="my-2 flex-1">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[#333333] mb-1.5 flex justify-between">
            <span>Proposed Scope of Deliverables & Services</span>
            <span className="text-[11px] text-[#666666] font-normal">All values in {invoice.currencySymbol || "INR"}</span>
          </div>
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#EAEAEA] text-[#111111] text-[11.5px] uppercase tracking-wider font-bold border-b-2 border-[#111111]">
                <th className="py-2.5 px-3 border-r border-[#D6D6D6] w-10 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-[#D6D6D6]">Scope / Service Description</th>
                {isGstEnabled && <th className="py-2.5 px-2.5 border-r border-[#D6D6D6] w-20 text-center">HSN/SAC</th>}
                <th className="py-2.5 px-2.5 border-r border-[#D6D6D6] w-14 text-right">Qty</th>
                <th className="py-2.5 px-2.5 border-r border-[#D6D6D6] w-14 text-center">Unit</th>
                <th className="py-2.5 px-3 border-r border-[#D6D6D6] w-24 text-right">Proposed Rate</th>
                {isGstEnabled && <th className="py-2.5 px-2 border-r border-[#D6D6D6] w-14 text-center">GST</th>}
                <th className="py-2.5 px-3 text-right w-28">Estimated Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6] text-[14px]">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}>
                  <td className="py-2.5 px-3 text-center text-[#555555] border-r border-[#D6D6D6]">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r border-[#D6D6D6]">
                    <p className="font-semibold text-[#111111]">{item.description}</p>
                    {item.hsnSac && !isGstEnabled && <p className="text-[12px] text-[#666666]">Code: {item.hsnSac}</p>}
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

        {/* Quotation Financial Summary */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-3">
            <div className="p-2.5 bg-[#F8F8F8] border border-[#D6D6D6] rounded text-[13.5px]">
              <span className="text-[#555555] block font-medium text-[11px] uppercase tracking-wide">Total Quoted Value in Words:</span>
              <strong className="text-[#111111] block mt-0.5">{numberToWords(totals.grandTotal)}</strong>
            </div>

            {invoice.notes && (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Commercial Terms & Scope Conditions:</strong>
                <p className="whitespace-pre-line mt-0.5">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-between items-end space-y-4">
            <table className="w-full text-[14px] border border-[#D6D6D6] rounded overflow-hidden">
              <tbody>
                <tr className="border-b border-[#E5E5E5]">
                  <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Scope Subtotal</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.subTotal, invoice.currencySymbol)}</td>
                </tr>
                {totals.totalDiscount > 0 && (
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Special Discount</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-600">-{format(totals.totalDiscount, invoice.currencySymbol)}</td>
                  </tr>
                )}
                {isGstEnabled && totals.totalGst > 0 && (
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Estimated Taxes</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.totalGst, invoice.currencySymbol)}</td>
                  </tr>
                )}
                <tr className="bg-[#181818] text-white">
                  <td className="py-3 px-3 font-bold uppercase tracking-wider text-[13px] border-r border-[#333333]">
                    {docConfig.totalLabel || "Total Quoted Value"}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[17px] font-mono tabular-nums text-white">
                    {format(totals.grandTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dual Sign-Off / Acceptance Block */}
        <section className="mt-6 pt-4 border-t-2 border-[#111111] grid grid-cols-2 gap-8">
          {/* Issuer Signature */}
          <div className="text-left space-y-1">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">Submitted By</p>
            <p className="text-[14px] font-semibold text-[#333333]">{company.name || "Company"}</p>
            {(company.signatureUrl || (invoice as any).signatureUrl) ? (
              <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-10 max-w-[130px] object-contain my-1" />
            ) : (
              <div className="h-8" />
            )}
            <div className="border-t border-[#888888] pt-1 max-w-[200px]">
              <p className="text-[11px] text-[#666666] uppercase">Authorized Signatory</p>
            </div>
          </div>

          {/* Client Acceptance Block */}
          <div className="p-3 bg-[#FAFAFA] border border-[#D6D6D6] rounded text-left space-y-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-[#111111] border-b border-[#E0E0E0] pb-1">
              Client Acceptance & Authorization
            </p>
            <p className="text-[11.5px] text-[#555555] italic">
              I/We hereby accept the proposed scope, estimated pricing, and commercial terms stated in this quotation.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="border-b border-[#999999] pb-0.5">
                <span className="text-[10px] text-[#666666] uppercase block">Accepted By Name:</span>
              </div>
              <div className="border-b border-[#999999] pb-0.5">
                <span className="text-[10px] text-[#666666] uppercase block">Signature & Date:</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
