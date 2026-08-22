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

export function ProformaDocument({ invoice, className = "", config }: DocumentProps) {
  const docConfig = config || getDocumentConfig(invoice.documentType || "proforma")
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo, shipTo, bankDetails, gstMode } = invoice
  const isGstEnabled = gstMode && gstMode !== "none"

  return (
    <div
      className={`proforma-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Proforma Identification Notice Banner */}
        <div className="mb-4 py-1.5 px-3 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#333333]">
            {docConfig.badgeLabel || "Pre-Billing Commercial Document"} • Advance Payment Against Proforma
          </p>
        </div>

        {/* Header */}
        <header className="pb-5 border-b-2 border-[#111111] flex items-start justify-between gap-6">
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
                {company.name || "Supplier / Company"}
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
                  <strong className="text-[#444444]">GSTIN:</strong> <span className="font-mono font-bold">{company.gstin}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[230px]">
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
                  <span className="text-[#555555] font-medium">{docConfig.dueDateLabel || "Valid Until:"}</span>
                  <span className="font-medium text-[#111111]">{invoice.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Commercial Parties */}
        <section className="my-5 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Customer / Buyer
            </p>
            <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Customer Name"}</p>
            {billTo.addressLines && (
              <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>
            )}
            <div className="text-[14px] text-[#444444] pt-0.5 space-y-0.5">
              {billTo.phone && <p><strong>Phone:</strong> {billTo.phone}</p>}
              {billTo.email && <p><strong>Email:</strong> {billTo.email}</p>}
              {billTo.gstin && <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-[#111111]">{billTo.gstin}</span></p>}
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Delivery Destination (Consignee)
            </p>
            {shipTo?.name ? (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{shipTo.name}</p>
                {shipTo.addressLines && <p className="text-[14px] text-[#444444] leading-normal">{shipTo.addressLines.filter(Boolean).join(", ")}</p>}
              </>
            ) : (
              <>
                <p className="text-[14px] font-semibold text-[#111111] pt-0.5">Same as Buyer Address</p>
                <p className="text-[13px] text-[#555555]">Goods/services to be delivered directly to the billing address upon receipt of advance payment.</p>
              </>
            )}
          </div>
        </section>

        {/* Commercial Items Table */}
        <section className="my-2 flex-1">
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#181818] text-white text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 border-r border-[#333333] w-10 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-[#333333]">Product / Service Description</th>
                {isGstEnabled && <th className="py-2.5 px-2.5 border-r border-[#333333] w-20 text-center">HSN/SAC</th>}
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-right">Qty</th>
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-center">Unit</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-24 text-right">Unit Price</th>
                {isGstEnabled && <th className="py-2.5 px-2 border-r border-[#333333] w-14 text-center">GST %</th>}
                <th className="py-2.5 px-3 text-right w-28">Amount</th>
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

        {/* Payment Box & Financial Summary */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6">
          {/* Left: Prominent Wire / Bank Remittance Box */}
          <div className="col-span-7 space-y-3.5">
            <div className="p-3.5 bg-[#F4F4F4] border-2 border-[#181818] rounded space-y-2">
              <div className="flex items-center justify-between border-b border-[#D0D0D0] pb-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#181818]">
                  Proforma Payment Instructions (Remittance Bank)
                </span>
                <span className="text-[11px] font-bold bg-[#181818] text-white px-2 py-0.5 rounded">WIRE TRANSFER</span>
              </div>
              {bankDetails && (bankDetails.accountNumber || bankDetails.bankName) ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13.5px]">
                  {bankDetails.accountName && <div><span className="text-[#555555]">Beneficiary:</span> <strong>{bankDetails.accountName}</strong></div>}
                  {bankDetails.bankName && <div><span className="text-[#555555]">Bank Name:</span> <strong>{bankDetails.bankName}</strong></div>}
                  {bankDetails.accountNumber && <div><span className="text-[#555555]">Account No:</span> <strong className="font-mono text-[#111111]">{bankDetails.accountNumber}</strong></div>}
                  {(bankDetails.ifsc || (bankDetails as any).ifscCode) && <div><span className="text-[#555555]">IFSC Code:</span> <strong className="font-mono">{bankDetails.ifsc || (bankDetails as any).ifscCode}</strong></div>}
                  {bankDetails.upiId && <div className="col-span-2"><span className="text-[#555555]">UPI ID:</span> <strong className="font-mono text-[#111111]">{bankDetails.upiId}</strong></div>}
                </div>
              ) : (
                <p className="text-[13px] text-[#555555]">Please remit advance payment to the supplier's designated corporate bank account.</p>
              )}
            </div>

            {invoice.notes && (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Proforma Notes & Commercial Conditions:</strong>
                <p className="whitespace-pre-line mt-0.5">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Totals Box & Signatory */}
          <div className="col-span-5 flex flex-col justify-between items-end space-y-4">
            <table className="w-full text-[14px] border border-[#D6D6D6] rounded overflow-hidden">
              <tbody>
                <tr className="border-b border-[#E5E5E5]">
                  <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Subtotal</td>
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
                    {docConfig.totalLabel || "Proforma Total"} ({invoice.currencySymbol || "INR"})
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[18px] font-mono tabular-nums text-white">
                    {format(totals.grandTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Issuer Signatory */}
            <div className="text-center min-w-[180px] pt-2">
              <p className="text-[12px] font-bold text-[#111111] mb-1">For {company.name || "Company"}</p>
              {(company.signatureUrl || (invoice as any).signatureUrl) ? (
                <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-10 max-w-[130px] object-contain mx-auto my-1" />
              ) : (
                <div className="h-8" />
              )}
              <div className="border-t border-[#111111] pt-1 px-3 mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
