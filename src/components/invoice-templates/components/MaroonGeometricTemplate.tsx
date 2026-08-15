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

export default function MaroonGeometricTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const maroon = "#a41149";
  const dark = "#1c1c1c";

  return (
    <div
      className={`invoice-page mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', system-ui, sans-serif",
        backgroundColor: "#f7f6f5",
        color: dark,
      }}
    >
      {invoice.watermarkUrl && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
          <img src={invoice.watermarkUrl} alt="" className="max-w-[70%] max-h-[70%] object-contain" />
        </div>
      )}

      <svg className="absolute top-0 right-0 pointer-events-none" viewBox="0 0 440 240" style={{ width: "240px", height: "130px" }}>
        <polygon points="440,0 180,0 310,150" fill={maroon} />
        <polygon points="440,0 440,240 240,0" fill={dark} />
      </svg>

      <div className="flex flex-col h-full px-12 pt-10 pb-0 relative z-[1]">
        <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: maroon }}>
          {company.name.toUpperCase()}
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            INVOICE
          </div>
          <div className="text-xs text-right mt-2" style={{ color: "#59595c" }}>
            NO: {invoice.invoiceNumber}
          </div>
        </div>

        <section className="grid grid-cols-2 gap-6 mb-5 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: maroon }}>Bill To:</p>
            <p className="font-semibold">{billTo.name}</p>
            {billTo.phone && <p className="text-xs" style={{ color: "#59595c" }}>{billTo.phone}</p>}
            {billTo.addressLines.map((l, i) => (
              <p key={i} className="text-xs" style={{ color: "#59595c" }}>{l}</p>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: maroon }}>From:</p>
            <p className="font-semibold">{company.name}</p>
            {company.phone && <p className="text-xs" style={{ color: "#59595c" }}>{company.phone}</p>}
            {company.addressLines.map((l, i) => (
              <p key={i} className="text-xs" style={{ color: "#59595c" }}>{l}</p>
            ))}
          </div>
        </section>

        <div className="text-xs mb-6" style={{ color: "#59595c" }}>
          Date: {invoice.invoiceDate}
        </div>

        <table className="w-full text-sm mb-4" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-white text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: maroon }}>
              <th className="text-left py-2.5 px-3">Description</th>
              <th className="text-right py-2.5 px-3">Qty</th>
              <th className="text-right py-2.5 px-3">Price</th>
              <th className="text-right py-2.5 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item) => (
              <tr key={item.id} className="border-b border-dashed" style={{ borderColor: "#c8395c" }}>
                <td className="py-2.5 px-3 font-medium">{item.description}</td>
                <td className="py-2.5 px-3 text-right" style={{ color: "#59595c" }}>
                  {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                </td>
                <td className="py-2.5 px-3 text-right" style={{ color: "#59595c" }}>
                  {formatCurrency(item.rate, invoice.currencySymbol)}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold">
                  {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="px-5 py-3 text-sm" style={{ backgroundColor: dark, color: "white" }}>
            <div className="flex justify-between gap-10">
              <span className="text-xs font-semibold uppercase tracking-widest">Sub Total</span>
              <span className="font-bold">{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-xs mt-auto mb-8" style={{ color: "#59595c" }}>
          <div>
            <p className="font-bold text-[10px] uppercase tracking-widest mb-1" style={{ color: maroon }}>Payment Information:</p>
            {invoice.bankDetails?.bankName && <p className="mb-0.5"><span className="font-medium">Bank:</span> {invoice.bankDetails.bankName}</p>}
            {invoice.company?.email && <p className="mb-0.5"><span className="font-medium">Email:</span> {invoice.company.email}</p>}
            {!invoice.bankDetails?.bankName && !invoice.company?.email && <p>No payment details provided.</p>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold italic" style={{ fontFamily: "'Dancing Script', cursive", color: maroon }}>
              Thank You!
            </p>
          </div>
        </div>

        <div style={{ height: "6px", backgroundColor: dark, marginLeft: "-48px", marginRight: "-48px" }} />
      </div>
    </div>
  );
}
