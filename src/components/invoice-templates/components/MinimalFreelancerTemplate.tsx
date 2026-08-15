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

export default function MinimalFreelancerTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page mx-auto relative overflow-hidden bg-white ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Poppins', system-ui, sans-serif",
        color: "#1a1a1a",
      }}
    >
      {invoice.watermarkUrl && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
          <img src={invoice.watermarkUrl} alt="" className="max-w-[70%] max-h-[70%] object-contain" />
        </div>
      )}
      <div className="flex flex-col h-full px-12 py-10 relative z-[1]">
        <header className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="logo" className="h-10 w-10 object-contain" />
            ) : (
              <div className="h-10 w-10 bg-stone-800 text-white flex items-center justify-center font-bold text-sm">
                {company.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg">{company.name}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Baloo 2', 'Poppins', sans-serif" }}>
              INVOICE
            </div>
            <div className="text-xs text-stone-400 mt-0.5">NO. {invoice.invoiceNumber}</div>
          </div>
        </header>

        <div className="text-xs text-stone-500 mb-6">
          <span className="text-stone-400">Date:</span> {invoice.invoiceDate}
        </div>

        <section className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">Billed to:</p>
            <p className="font-semibold">{billTo.name}</p>
            {billTo.addressLines.map((l, i) => (
              <p key={i} className="text-stone-500 text-xs">{l}</p>
            ))}
            {billTo.email && <p className="text-stone-500 text-xs">{billTo.email}</p>}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">From:</p>
            <p className="font-semibold">{company.name}</p>
            {company.addressLines.map((l, i) => (
              <p key={i} className="text-stone-500 text-xs">{l}</p>
            ))}
            {company.email && <p className="text-stone-500 text-xs">{company.email}</p>}
          </div>
        </section>

        <table className="w-full text-sm mb-6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              <th className="text-left pb-2 border-b border-stone-200">Item</th>
              <th className="text-right pb-2 border-b border-stone-200">Quantity</th>
              <th className="text-right pb-2 border-b border-stone-200">Price</th>
              <th className="text-right pb-2 border-b border-stone-200">Amount</th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 border-b border-stone-100">
                  <span className="font-medium">{item.description}</span>
                  {item.hsnSac && <span className="text-[10px] text-stone-400 ml-1">({item.hsnSac})</span>}
                </td>
                <td className="py-2 border-b border-stone-100 text-right text-stone-600">
                  {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                </td>
                <td className="py-2 border-b border-stone-100 text-right text-stone-600">
                  {formatCurrency(item.rate, invoice.currencySymbol)}
                </td>
                <td className="py-2 border-b border-stone-100 text-right font-medium">
                  {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={3} className="text-right pt-3 text-sm">Total</td>
              <td className="text-right pt-3 text-sm">
                {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="text-xs text-stone-500 space-y-1 mt-auto">
          {invoice.bankDetails && (
            <p><span className="text-stone-400">Payment method:</span> {invoice.bankDetails.bankName || "Bank Transfer"}</p>
          )}
          {invoice.notes && (
            <p><span className="text-stone-400">Note:</span> {invoice.notes}</p>
          )}
        </div>

        <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 794 340" preserveAspectRatio="none" style={{ height: "140px" }}>
          <path d="M0,180 C150,120 300,260 500,190 C650,140 730,180 794,120 L794,340 L0,340 Z" fill="#d9d9d9" opacity="0.4" />
          <path d="M0,230 C180,150 340,300 560,220 C700,170 750,220 794,170 L794,340 L0,340 Z" fill="#3f3f3f" opacity="0.08" />
        </svg>
      </div>
    </div>
  );
}
