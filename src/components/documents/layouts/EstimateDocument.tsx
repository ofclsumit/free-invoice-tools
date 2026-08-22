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

export function EstimateDocument({ invoice, className = "" }: DocumentProps) {
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo } = invoice

  return (
    <div
      className={`estimate-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={sheetStyle}
    >
      {invoice.watermarkUrl && <Watermark url={invoice.watermarkUrl} />}
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* Estimate Disclaimer Banner */}
        <div className="mb-4 py-1 px-3 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555]">
            Non-Binding Cost Estimate • For Planning & Budgetary Purposes Only
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
                {company.name || "Business Name"}
              </h1>
              {company.addressLines && (
                <p className="text-[14px] text-[#444444] leading-normal">{company.addressLines.filter(Boolean).join(", ")}</p>
              )}
              <div className="flex flex-wrap gap-x-4 text-[14px] text-[#444444] pt-0.5">
                {company.phone && <span><strong>Phone:</strong> {company.phone}</span>}
                {company.email && <span><strong>Email:</strong> {company.email}</span>}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 min-w-[220px]">
            <h2 className="text-[24px] font-black uppercase tracking-tight text-[#111111]">
              COST ESTIMATE
            </h2>
            <div className="mt-2 text-[14px] space-y-1.5 text-left">
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Estimate Ref:</span>
                <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                <span className="text-[#555555] font-medium">Date:</span>
                <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Estimated Valid Until:</span>
                  <span className="font-medium text-[#111111]">{invoice.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Client Box */}
        <section className="my-5 p-3.5 rounded bg-[#F8F8F8] border border-[#D6D6D6] space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#444444] border-b border-[#E0E0E0] pb-1">
            Estimate Prepared For
          </p>
          <p className="text-[15px] font-bold text-[#111111] pt-0.5">{billTo.name || "Client Name"}</p>
          {billTo.addressLines && (
            <p className="text-[14px] text-[#444444] leading-normal">{billTo.addressLines.filter(Boolean).join(", ")}</p>
          )}
        </section>

        {/* Estimate Scope Table */}
        <section className="my-2 flex-1">
          <table className="w-full text-left border-collapse border border-[#D6D6D6]">
            <thead>
              <tr className="bg-[#181818] text-white text-[11.5px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 border-r border-[#333333] w-10 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-[#333333]">Scope Item / Description</th>
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-16 text-right">Est Qty</th>
                <th className="py-2.5 px-2.5 border-r border-[#333333] w-16 text-center">Unit</th>
                <th className="py-2.5 px-3 border-r border-[#333333] w-28 text-right">Estimated Rate</th>
                <th className="py-2.5 px-3 text-right w-32">Estimated Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6] text-[14px]">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"}>
                  <td className="py-2.5 px-3 text-center text-[#555555] border-r border-[#D6D6D6]">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r border-[#D6D6D6] font-semibold text-[#111111]">{item.description}</td>
                  <td className="py-2.5 px-2.5 text-right font-mono border-r border-[#D6D6D6]">{item.quantity}</td>
                  <td className="py-2.5 px-2.5 text-center text-[#555555] border-r border-[#D6D6D6]">{item.unit || "NOS"}</td>
                  <td className="py-2.5 px-3 text-right font-mono border-r border-[#D6D6D6]">{format(item.rate, invoice.currencySymbol)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#111111]">
                    {format((item as any).lineTotal || (item.quantity * item.rate), invoice.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Estimate Summary */}
        <div className="mt-4 pt-3 border-t border-[#D6D6D6] grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-3">
            <div className="p-2.5 bg-[#F8F8F8] border border-[#D6D6D6] rounded text-[13.5px]">
              <span className="text-[#555555] block font-medium text-[11px] uppercase tracking-wide">Estimated Value in Words:</span>
              <strong className="text-[#111111] block mt-0.5">{numberToWords(totals.grandTotal)}</strong>
            </div>
            {invoice.notes && (
              <div className="text-[13px] text-[#444444] leading-relaxed">
                <strong className="text-[#111111] text-[11px] uppercase tracking-wide block">Estimation Notes:</strong>
                <p className="whitespace-pre-line mt-0.5">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="col-span-5 flex flex-col justify-between items-end space-y-4">
            <div className="w-full p-4 bg-[#F4F4F4] border-2 border-[#181818] rounded text-right space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#555555] block">Total Estimated Cost</span>
              <span className="text-[22px] font-mono font-bold text-[#111111] block">{format(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>

            <div className="text-center min-w-[180px] pt-2">
              <p className="text-[12px] font-bold text-[#111111] mb-1">For {company.name || "Company"}</p>
              {(company.signatureUrl || (invoice as any).signatureUrl) ? (
                <img src={company.signatureUrl || (invoice as any).signatureUrl} alt="Signature" className="h-10 max-w-[130px] object-contain mx-auto my-1" />
              ) : (
                <div className="h-8" />
              )}
              <div className="border-t border-[#111111] pt-1 px-3 mt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">Prepared By</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
