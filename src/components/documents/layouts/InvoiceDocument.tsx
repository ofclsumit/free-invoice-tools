import React from "react"
import {
  InvoiceData,
  computeInvoiceTotals,
  numberToWords,
} from "@/components/invoice-templates/data/invoiceTypes"
import { sheetStyle, format, Watermark } from "./shared"

interface DocumentProps {
  invoice: InvoiceData
  className?: string
}

export function InvoiceDocument({ invoice, className = "" }: DocumentProps) {
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo, shipTo, transportDetails, bankDetails, gstMode } = invoice
  const isGstEnabled = gstMode && gstMode !== "none"

  return (
    <div
      className={`invoice-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Header */}
        <header className="pb-5 border-b-2 border-[#111111] flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 max-w-[58%]">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt="Logo"
                className="h-14 max-w-[150px] object-contain shrink-0 rounded border border-[#E5E5E5] p-1"
              />
            )}
            <div className="space-y-1 min-w-0">
              <h1 className="text-[20px] font-bold text-[#111111] tracking-tight leading-tight break-words">
                {company.name || "Business Name"}
              </h1>
              {company.addressLines && company.addressLines.length > 0 && (
                <p className="text-[14px] text-[#444444] leading-normal break-words">
                  {company.addressLines.filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#444444] pt-0.5">
                {company.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#111111] pt-0.5">
                {company.gstin && (
                  <span>
                    <strong className="text-[#444444]">GSTIN:</strong>{" "}
                    <span className="font-mono font-bold">{company.gstin}</span>
                  </span>
                )}
                {company.pan && (
                  <span>
                    <strong className="text-[#444444]">PAN:</strong>{" "}
                    <span className="font-mono font-bold">{company.pan}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[220px]">
            <h2 className="text-[26px] font-black uppercase tracking-tight text-[#111111]">INVOICE</h2>
            {isGstEnabled && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555] -mt-0.5 mb-1.5">
                Tax Invoice
              </p>
            )}
            <div className="mt-2 text-[14px] space-y-1.5">
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Invoice No:</span>
                <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Invoice Date:</span>
                <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Due Date:</span>
                  <span className="font-medium text-[#111111]">{invoice.dueDate}</span>
                </div>
              )}
              {(invoice as any).placeOfSupply && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Place of Supply:</span>
                  <span className="font-medium text-[#111111]">{(invoice as any).placeOfSupply}</span>
                </div>
              )}
              {(invoice as any).purchaseOrderNumber && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">PO Ref:</span>
                  <span className="font-mono font-medium text-[#111111]">{(invoice as any).purchaseOrderNumber}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Address Grid */}
        <section className="my-5 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              Billed To (Customer)
            </p>
            <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Customer Name"}</p>
            {billTo.addressLines && billTo.addressLines.length > 0 && (
              <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>
            )}
            <div className="text-[14px] text-[#444444] pt-0.5 space-y-0.5">
              {billTo.phone && <p><strong>Phone:</strong> {billTo.phone}</p>}
              {billTo.email && <p><strong>Email:</strong> {billTo.email}</p>}
              {billTo.gstin && <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-[#111111]">{billTo.gstin}</span></p>}
              {(billTo as any).pan && <p><strong>PAN:</strong> <span className="font-mono font-bold text-[#111111]">{(billTo as any).pan}</span></p>}
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
              {shipTo?.name ? "Shipped To (Delivery Address)" : "Supplier Details"}
            </p>
            {shipTo?.name ? (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{shipTo.name}</p>
                {shipTo.addressLines && (
                  <p className="text-[14px] text-[#444444] leading-normal">{shipTo.addressLines.filter(Boolean).join(", ")}</p>
                )}
                {shipTo.gstin && <p className="text-[14px] text-[#444444]"><strong>GSTIN:</strong> {shipTo.gstin}</p>}
              </>
            ) : (
              <>
                <p className="text-[15px] font-bold text-[#111111] pt-0.5">{company.name}</p>
                <p className="text-[14px] text-[#444444]">Dispatched from registered business address.</p>
                {company.gstin && <p className="text-[14px] text-[#444444]"><strong>GSTIN:</strong> <span className="font-mono">{company.gstin}</span></p>}
              </>
            )}
          </div>
        </section>

        {/* Transport Details (if applicable) */}
        {transportDetails && (transportDetails.vehicleNumber || (transportDetails as any).lrNumber || transportDetails.transportDocNo || transportDetails.transporterName) && (
          <section className="mb-4 p-2.5 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-[13.5px] grid grid-cols-4 gap-3">
            {transportDetails.transporterName && <div><span className="text-[#555555]">Transporter:</span> <strong>{transportDetails.transporterName}</strong></div>}
            {transportDetails.vehicleNumber && <div><span className="text-[#555555]">Vehicle No:</span> <strong className="font-mono">{transportDetails.vehicleNumber}</strong></div>}
            {((transportDetails as any).lrNumber || transportDetails.transportDocNo) && <div><span className="text-[#555555]">LR/RR No:</span> <strong className="font-mono">{(transportDetails as any).lrNumber || transportDetails.transportDocNo}</strong></div>}
            {(transportDetails as any).eWayBillNumber && <div><span className="text-[#555555]">E-Way Bill:</span> <strong className="font-mono">{(transportDetails as any).eWayBillNumber}</strong></div>}
          </section>
        )}

        {/* Accounting Item Table */}
        <section className="my-2 flex-1">
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#181818] text-white text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 border-r border-[#333333] w-10 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-[#333333]">Item Description</th>
                {isGstEnabled && <th className="py-2.5 px-2.5 border-r border-[#333333] w-20 text-center">HSN/SAC</th>}
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-right">Qty</th>
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-14 text-center">Unit</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-24 text-right">Rate</th>
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
                      {gstMode === "split" ? `${(item.cgstPercent || 0) + (item.sgstPercent || 0) + (item.igstPercent || 0)}%` : `${item.gstPercent || 0}%`}
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

        {/* Financial Summary & Bank/Signature Footer */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6">
          {/* Left: Words, Bank Details, Notes */}
          <div className="col-span-7 space-y-3.5">
            <div className="p-2.5 bg-[#F8F8F8] border border-[#D6D6D6] rounded text-[13.5px]">
              <span className="text-[#555555] block font-medium text-[11px] uppercase tracking-wide">Total Amount in Words:</span>
              <strong className="text-[#111111] leading-tight block mt-0.5">{numberToWords(totals.grandTotal)}</strong>
            </div>

            {bankDetails && (bankDetails.accountNumber || bankDetails.bankName || bankDetails.upiId) && (
              <div className="p-3 bg-[#FAFAFA] border border-[#D6D6D6] rounded text-[13.5px] space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
                  Bank & Payment Instructions
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-[13.5px]">
                  {bankDetails.accountName && <div><span className="text-[#555555]">A/C Name:</span> <strong>{bankDetails.accountName}</strong></div>}
                  {bankDetails.bankName && <div><span className="text-[#555555]">Bank:</span> <strong>{bankDetails.bankName}</strong></div>}
                  {bankDetails.accountNumber && <div><span className="text-[#555555]">A/C No:</span> <strong className="font-mono">{bankDetails.accountNumber}</strong></div>}
                  {(bankDetails.ifsc || (bankDetails as any).ifscCode) && <div><span className="text-[#555555]">IFSC:</span> <strong className="font-mono">{bankDetails.ifsc || (bankDetails as any).ifscCode}</strong></div>}
                  {bankDetails.upiId && <div className="col-span-2"><span className="text-[#555555]">UPI ID:</span> <strong className="font-mono text-[#111111]">{bankDetails.upiId}</strong></div>}
                </div>
              </div>
            )}

            {invoice.notes && (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Notes & Terms:</strong>
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
                {isGstEnabled && (
                  <>
                    {totals.totalCgst > 0 && (
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">CGST</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.totalCgst, invoice.currencySymbol)}</td>
                      </tr>
                    )}
                    {totals.totalSgst > 0 && (
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">SGST</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.totalSgst, invoice.currencySymbol)}</td>
                      </tr>
                    )}
                    {totals.totalIgst > 0 && (
                      <tr className="border-b border-[#E5E5E5]">
                        <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">IGST</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.totalIgst, invoice.currencySymbol)}</td>
                      </tr>
                    )}
                  </>
                )}
                {totals.shippingCharge > 0 && (
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-2 px-3 text-[#444444] bg-[#FAFAFA] border-r border-[#D6D6D6]">Shipping</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#111111]">{format(totals.shippingCharge, invoice.currencySymbol)}</td>
                  </tr>
                )}
                <tr className="bg-[#F4F4F4] border-t-2 border-[#111111]">
                  <td className="py-3 px-3 font-bold uppercase tracking-wider text-[#111111] text-[13.5px] border-r border-[#D6D6D6]">
                    Amount Due ({invoice.currencySymbol || "INR"})
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[18px] font-mono tabular-nums text-[#111111]">
                    {format(totals.grandTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Authorized Signatory */}
            <div className="text-center min-w-[180px] pt-3">
              <p className="text-[12px] font-bold text-[#111111] mb-1">For {company.name || "Company"}</p>
              {(company.signatureUrl || (invoice as any).signatureUrl) ? (
                <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-11 max-w-[140px] object-contain mx-auto my-1" />
              ) : (
                <div className="h-10" />
              )}
              <div className="border-t border-[#111111] pt-1.5 px-3 mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
