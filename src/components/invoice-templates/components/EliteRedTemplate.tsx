import React from "react";
import {
  InvoiceData,
  computeInvoiceTotals,
  formatCurrency,
} from "../data/invoiceTypes";

interface Props {
  invoice: InvoiceData;
  className?: string;
}

export default function EliteRedTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode, bankDetails } = invoice;

  return (
    <div
      className={`invoice-page bg-white text-slate-800 mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top Right Crimson & Charcoal Diagonal Corner Shapes */}
      <div className="absolute top-0 right-0 w-[240px] h-[100px] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="0,0 100,0 100,100" fill="#991b1b" />
          <polygon points="40,0 100,0 100,60" fill="#1e293b" />
        </svg>
      </div>

      {/* Dynamic Status Badge */}
      {invoice.status && (
        <div
          className={`absolute top-28 right-16 border px-3 py-1 text-[10px] font-bold uppercase tracking-wider z-10 rounded ${
            invoice.status === "Paid"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-amber-600 bg-amber-50 text-amber-700"
          }`}
        >
          {invoice.status}
        </div>
      )}

      <div className="flex flex-col justify-between h-full min-h-[297mm] px-14 py-12 relative z-10">
        <div>
          {/* Header */}
          <header className="flex justify-between items-start mb-10 pt-4">
            <div>
              <p className="font-extrabold text-slate-900 tracking-wider text-xs uppercase mb-1">{company.name}</p>
              <h1 className="text-4xl font-black text-[#991b1b] uppercase tracking-wide">
                {invoice.documentType || "INVOICE"}
              </h1>
            </div>
            <div className="text-right pr-16">
              <p className="text-xs font-mono font-bold text-slate-700">
                NO: {invoice.invoiceNumber || "INV-12345-1"}
              </p>
            </div>
          </header>

          {/* Parties Block */}
          <section className="grid grid-cols-2 gap-8 mb-4 text-xs">
            <div>
              <p className="text-[#991b1b] font-bold uppercase tracking-wider mb-2">Bill To:</p>
              <p className="font-bold text-slate-900 text-sm mb-1">{billTo.name}</p>
              {billTo.phone && <p className="text-slate-600 font-semibold mb-0.5">{billTo.phone}</p>}
              {billTo.addressLines.map((l, i) => (
                <p key={i} className="text-slate-600">{l}</p>
              ))}
              {billTo.gstin && <p className="text-slate-500 font-mono mt-1">GSTIN: {billTo.gstin}</p>}
            </div>

            <div>
              <p className="text-[#991b1b] font-bold uppercase tracking-wider mb-2">From:</p>
              <p className="font-bold text-slate-900 text-sm mb-1">{company.name}</p>
              {company.phone && <p className="text-slate-600 font-semibold mb-0.5">{company.phone}</p>}
              {company.addressLines.map((l, i) => (
                <p key={i} className="text-slate-600">{l}</p>
              ))}
              {company.gstin && <p className="text-slate-500 font-mono mt-1">GSTIN: {company.gstin}</p>}
            </div>
          </section>

          {/* Date */}
          <div className="text-xs font-semibold text-slate-500 mb-8 border-b border-slate-100 pb-4">
            Date: {invoice.invoiceDate || "21 October 2022"}
          </div>

          {/* Line Items Table */}
          <section className="mb-6">
            <table className="w-full border-collapse" style={{ fontSize: "11px" }}>
              <thead>
                <tr className="bg-[#991b1b] text-white font-semibold">
                  <th className="text-left py-2.5 px-3">Description</th>
                  {gstMode !== "none" && <th className="text-left py-2.5 px-3">HSN/SAC</th>}
                  <th className="text-center py-2.5 px-3">Qty</th>
                  <th className="text-right py-2.5 px-3">Price</th>
                  {gstMode === "split" && (
                    <>
                      <th className="text-right py-2.5 px-3">CGST</th>
                      <th className="text-right py-2.5 px-3">SGST</th>
                    </>
                  )}
                  {gstMode === "single" && <th className="text-right py-2.5 px-3">GST</th>}
                  <th className="text-right py-2.5 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {totals.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-[#991b1b]/10 text-slate-600 bg-white">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{item.description}</p>
                      {item.discountPercent ? (
                        <p className="text-[9px] text-red-600 mt-0.5">Discount: {item.discountPercent}%</p>
                      ) : null}
                    </td>
                    {gstMode !== "none" && (
                      <td className="py-3 px-3 font-mono text-slate-500">{item.hsnSac || "—"}</td>
                    )}
                    <td className="py-3 px-3 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                    {gstMode === "split" && (
                      <>
                        <td className="py-3 px-3 text-right text-slate-500 font-mono">{item.cgstPercent ?? 0}%</td>
                        <td className="py-3 px-3 text-right text-slate-500 font-mono">{item.sgstPercent ?? 0}%</td>
                      </>
                    )}
                    {gstMode === "single" && (
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">{item.gstPercent ?? 0}%</td>
                    )}
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Sub Total / Grand Total Box */}
          <section className="flex justify-end mb-12">
            <div className="w-1/3 bg-[#1e293b] text-white rounded p-3 text-xs">
              <div className="flex justify-between mb-1.5 opacity-80">
                <span>Sub Total</span>
                <span>{formatCurrency(totals.subTotal, invoice.currencySymbol)}</span>
              </div>
              {totals.totalGst > 0 && (
                <div className="flex justify-between mb-1.5 opacity-80 border-b border-white/10 pb-1.5">
                  <span>GST Total</span>
                  <span>{formatCurrency(totals.totalGst, invoice.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#ef4444] pt-1">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-end text-xs border-t border-slate-100 pt-6">
          {/* Left Side Payment Info */}
          <div>
            {bankDetails && bankDetails.bankName && (
              <div className="text-slate-500 leading-relaxed">
                <p className="font-bold text-slate-700 uppercase mb-1">Payment Information:</p>
                <p>Bank: {bankDetails.bankName}</p>
                <p>Account Name: {bankDetails.accountName || company.name}</p>
                <p>Account Number: {bankDetails.accountNumber}</p>
                {bankDetails.ifsc && <p className="font-mono text-[10px]">IFSC: {bankDetails.ifsc}</p>}
                {company.email && <p>Email: {company.email}</p>}
              </div>
            )}
          </div>

          {/* Right Side Handwriting Style thank you */}
          <div className="text-right">
            <p className="font-serif italic text-3xl text-slate-800 tracking-wide">Thank You!</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
