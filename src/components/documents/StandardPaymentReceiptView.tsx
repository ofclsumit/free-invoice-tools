"use client"

import React from "react"
import {
  InvoiceData,
  computeInvoiceTotals,
  formatCurrency,
  numberToWords,
} from "@/components/invoice-templates/data/invoiceTypes"

interface StandardPaymentReceiptViewProps {
  invoice: InvoiceData
  className?: string
}

export function StandardPaymentReceiptView({
  invoice,
  className = "",
}: StandardPaymentReceiptViewProps) {
  const totals = computeInvoiceTotals(invoice)
  const { company, billTo } = invoice

  return (
    <div
      className={`receipt-sheet bg-white text-[#111111] mx-auto relative overflow-hidden print:p-0 print:m-0 print:shadow-none print:w-full ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "14px",
        lineHeight: "1.45",
        boxSizing: "border-box",
        color: "#111111",
      }}
    >
      <div className="flex flex-col min-h-[297mm] p-10 relative z-[1] box-border">
        {/* ── Top Header ─────────────────────────────────────────────── */}
        <header className="pb-5 border-b-2 border-[#111111]">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Issuer Info */}
            <div className="flex items-start gap-4 max-w-[58%]">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name || "Company Logo"}
                  className="h-14 max-w-[150px] object-contain shrink-0 rounded border border-[#E5E5E5] p-1"
                />
              ) : null}
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

            {/* Right: Payment Receipt Title & Meta */}
            <div className="text-right shrink-0 min-w-[220px]">
              <h2 className="text-[26px] font-black uppercase tracking-tight text-[#111111]">
                PAYMENT RECEIPT
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#555555] -mt-0.5 mb-1.5">
                Official Voucher
              </p>

              <div className="mt-2 text-[14px] space-y-1.5">
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Receipt No:</span>
                  <span className="font-mono font-bold text-[#111111]">{invoice.invoiceNumber || "—"}</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-[#EAEAEA] pb-1">
                  <span className="text-[#555555] font-medium">Receipt Date:</span>
                  <span className="font-medium text-[#111111]">{invoice.invoiceDate || "—"}</span>
                </div>
                <div className="flex justify-between gap-4 pt-0.5">
                  <span className="text-[#555555] font-medium">Status:</span>
                  <span className="font-bold uppercase text-[11px] px-2 py-0.5 bg-[#F4F4F4] border border-[#D6D6D6] rounded text-[#111111]">
                    PAID
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Enterprise Amount Banner ───────────────────────────────── */}
        <section className="my-4 p-4 bg-[#F4F4F4] border border-[#D6D6D6] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#555555]">
              Amount Received
            </p>
            <p className="text-[26px] font-black text-[#111111] font-mono tracking-tight tabular-nums mt-0.5">
              {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
            </p>
          </div>
          <div className="text-right max-w-[60%]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#555555]">
              Amount in Words
            </p>
            <p className="text-[14px] font-bold text-[#111111] italic leading-snug mt-0.5">
              {numberToWords(totals.grandTotal, invoice.currencySymbol === "₹" ? "Rupees" : "")}
            </p>
          </div>
        </section>

        {/* ── Parties Grid ───────────────────────────────────────────── */}
        <section className="my-3 border border-[#D6D6D6] text-[14px]">
          <div className="grid grid-cols-2 divide-x divide-[#D6D6D6]">
            {/* Received From */}
            <div>
              <div className="bg-[#F4F4F4] px-3.5 py-1.5 font-bold text-[12px] uppercase tracking-wider text-[#333333] border-b border-[#D6D6D6]">
                Received From (Payer)
              </div>
              <div className="p-3.5 space-y-1">
                <p className="font-bold text-[15px] text-[#111111]">{billTo.name || "—"}</p>
                {billTo.addressLines && billTo.addressLines.length > 0 && (
                  <p className="text-[#444444] break-words leading-relaxed">
                    {billTo.addressLines.filter(Boolean).join(", ")}
                  </p>
                )}
                {billTo.phone && <p className="text-[#444444]"><strong>Phone:</strong> {billTo.phone}</p>}
                {billTo.email && <p className="text-[#444444]"><strong>Email:</strong> {billTo.email}</p>}
              </div>
            </div>

            {/* Issued By */}
            <div>
              <div className="bg-[#F4F4F4] px-3.5 py-1.5 font-bold text-[12px] uppercase tracking-wider text-[#333333] border-b border-[#D6D6D6]">
                Issued By (Recipient)
              </div>
              <div className="p-3.5 space-y-1">
                <p className="font-bold text-[15px] text-[#111111]">{company.name || "—"}</p>
                {company.phone && <p className="text-[#444444]"><strong>Phone:</strong> {company.phone}</p>}
                {company.email && <p className="text-[#444444]"><strong>Email:</strong> {company.email}</p>}
                {company.gstin && (
                  <p className="text-[#111111] pt-0.5">
                    <strong>GSTIN:</strong> <span className="font-mono font-semibold">{company.gstin}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Transaction Details & Notes ────────────────────────────── */}
        <section className="my-3 flex-1 space-y-3">
          {invoice.notes && (
            <div className="border border-[#D6D6D6] text-[13.5px]">
              <div className="bg-[#F4F4F4] px-3.5 py-1.5 font-bold text-[12px] uppercase tracking-wider text-[#333333] border-b border-[#D6D6D6]">
                Payment Particulars & Notes
              </div>
              <div className="p-3.5 text-[#222222] whitespace-pre-wrap leading-relaxed">
                {invoice.notes}
              </div>
            </div>
          )}
        </section>

        {/* ── Footer & Signatory ──────────────────────────────────────── */}
        <footer
          className="mt-auto pt-5 border-t border-[#D6D6D6] flex items-end justify-between text-[12px]"
          style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
        >
          <div className="max-w-[60%] space-y-1 text-[#555555]">
            <p className="font-semibold text-[#111111] text-[12.5px]">Acknowledgement:</p>
            <p className="leading-relaxed">
              Received payment with thanks. Subject to realization of payment instruments.
            </p>
            <p className="text-[11px] text-[#777777] pt-1">
              This is a computer generated payment voucher.
            </p>
          </div>

          {/* Authorized Signatory */}
          <div className="text-center min-w-[170px]">
            <p className="text-[12px] font-bold text-[#111111] mb-1">
              For {company.name || "Company"}
            </p>
            {company.signatureUrl ? (
              <img
                src={company.signatureUrl}
                alt="Authorized Signature"
                className="h-11 max-w-[140px] object-contain mx-auto my-1"
              />
            ) : (
              <div className="h-10" />
            )}
            <div className="border-t border-[#111111] pt-1.5 px-3 mt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                Authorized Signatory
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default StandardPaymentReceiptView
