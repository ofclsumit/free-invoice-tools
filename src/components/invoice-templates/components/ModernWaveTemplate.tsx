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

export default function ModernWaveTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page bg-white text-slate-800 mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Dynamic Status Stamp */}
      {invoice.status && (
        <div
          className={`absolute top-16 right-16 border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] z-10 ${
            invoice.status === "Paid"
              ? "border-emerald-500 text-emerald-600"
              : "border-amber-500 text-amber-600"
          }`}
          style={{ transform: "rotate(8deg)", opacity: 0.85 }}
        >
          {invoice.status}
        </div>
      )}

      <div className="flex flex-col justify-between h-full min-h-[297mm] px-14 py-12 relative z-10">
        <div>
          {/* Header */}
          <header className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="logo" className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 bg-slate-900 flex items-center justify-center font-bold text-white text-lg rounded">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">{company.name} Logo</span>
            </div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
              NO. {invoice.invoiceNumber || "000001"}
            </p>
          </header>

          {/* Document Title */}
          <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tight mb-8">
            {invoice.documentType || "INVOICE"}
          </h1>

          <p className="text-xs font-semibold text-slate-600 mb-8">
            Date: {invoice.invoiceDate || "02 June, 2030"}
          </p>

          {/* Parties Block */}
          <section className="grid grid-cols-2 gap-8 mb-10 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Billed to:</p>
              <p className="font-bold text-slate-900 text-sm mb-1">{billTo.name}</p>
              {billTo.addressLines.map((l, i) => (
                <p key={i} className="text-slate-600">{l}</p>
              ))}
              {billTo.phone && <p className="text-slate-500 mt-1">Ph: {billTo.phone}</p>}
              {billTo.email && <p className="text-slate-500">{billTo.email}</p>}
              {billTo.gstin && <p className="text-slate-500 font-mono mt-0.5">GSTIN: {billTo.gstin}</p>}
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">From:</p>
              <p className="font-bold text-slate-900 text-sm mb-1">{company.name}</p>
              {company.addressLines.map((l, i) => (
                <p key={i} className="text-slate-600">{l}</p>
              ))}
              {company.phone && <p className="text-slate-500 mt-1">Ph: {company.phone}</p>}
              {company.email && <p className="text-slate-500">{company.email}</p>}
              {company.gstin && <p className="text-slate-500 font-mono mt-0.5">GSTIN: {company.gstin}</p>}
            </div>
          </section>

          {/* Line Items Table */}
          <section className="mb-8">
            <table className="w-full border-collapse" style={{ fontSize: "11px" }}>
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="text-left py-2.5 px-3">Item</th>
                  {gstMode !== "none" && <th className="text-left py-2.5 px-3">HSN/SAC</th>}
                  <th className="text-center py-2.5 px-3">Quantity</th>
                  <th className="text-right py-2.5 px-3">Price</th>
                  {gstMode === "split" && (
                    <>
                      <th className="text-right py-2.5 px-3">CGST</th>
                      <th className="text-right py-2.5 px-3">SGST</th>
                    </>
                  )}
                  {gstMode === "single" && <th className="text-right py-2.5 px-3">GST</th>}
                  <th className="text-right py-2.5 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {totals.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100 text-slate-600">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{item.description}</p>
                      {item.discountPercent ? (
                        <p className="text-[9px] text-slate-500 mt-0.5">Discount: {item.discountPercent}%</p>
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

          {/* Total & Additional Info */}
          <section className="flex justify-between items-start mb-12">
            <div className="text-xs text-slate-500">
              {invoice.notes && (
                <p>
                  <span className="font-bold text-slate-700">Note:</span> {invoice.notes}
                </p>
              )}
            </div>

            <div className="text-right w-1/3 border-t border-slate-200 pt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subTotal, invoice.currencySymbol)}</span>
              </div>
              {totals.totalGst > 0 && (
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Tax Total:</span>
                  <span>{formatCurrency(totals.totalGst, invoice.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Accent Waves (SVG curves) */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none z-0">
          <svg viewBox="0 0 800 100" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M 0 50 Q 220 20, 420 80 T 800 60 L 800 100 L 0 100 Z"
              fill="#e2e8f0"
              opacity="0.9"
            />
            <path
              d="M 0 85 Q 220 90, 420 70 T 800 45 L 800 100 L 0 100 Z"
              fill="#1e293b"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
