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

export default function GarageBrandTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode, bankDetails } = invoice;

  return (
    <div
      className={`invoice-page bg-[#f8f9fa] text-[#0f172a] mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Stamp Status */}
      {invoice.status && (
        <div
          className={`absolute top-16 right-16 border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] z-10 ${
            invoice.status === "Paid"
              ? "border-[#ef4444] text-[#ef4444]"
              : "border-slate-400 text-slate-500"
          }`}
          style={{ transform: "rotate(8deg)", opacity: 0.85 }}
        >
          {invoice.status}
        </div>
      )}

      {/* Signature Red Corner Box in Bottom Left */}
      <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-[#ef4444] rounded-tr-[40px] overflow-hidden flex items-center justify-center z-0">
        <span className="text-[180px] font-black text-white/20 select-none leading-none -translate-x-4 translate-y-4">
          {company.name.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col justify-between h-full min-h-[297mm] px-14 py-12 relative z-10">
        <div>
          {/* Header */}
          <header className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#ef4444] w-12 h-12 flex items-center justify-center font-black text-white text-3xl rounded-sm">
                {company.logoUrl ? (
                  <img src={company.logoUrl} className="h-full w-full object-contain" />
                ) : (
                  company.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-wider text-[#0f172a] uppercase leading-none">{company.name}</span>
                <span className="text-[9px] text-[#ef4444] font-bold uppercase tracking-widest mt-0.5">Premium Services</span>
              </div>
            </div>
          </header>

          {/* Document Title */}
          <h1 className="text-7xl font-black text-[#0f172a] uppercase tracking-tight mt-6 mb-2">
            {invoice.documentType || "INVOICE"}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mb-8">
            Invoice Number: {invoice.invoiceNumber || "01234"}
          </p>

          {/* Billed To block */}
          <section className="mb-8 text-xs">
            <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Billed to:</p>
            <p className="font-bold text-[#0f172a] text-sm mb-1">{billTo.name}</p>
            {billTo.phone && <p className="text-slate-600 font-semibold mb-0.5">{billTo.phone}</p>}
            {billTo.addressLines.map((l, i) => (
              <p key={i} className="text-slate-600">{l}</p>
            ))}
            {billTo.gstin && <p className="text-slate-500 font-mono mt-1">GSTIN: {billTo.gstin}</p>}
          </section>

          {/* Line Items Table */}
          <section className="mb-8 border-t border-b border-slate-900/10 py-2">
            <table className="w-full border-collapse" style={{ fontSize: "11px" }}>
              <thead>
                <tr className="text-[#0f172a] font-bold uppercase border-b border-slate-950 pb-2">
                  <th className="text-left py-2 px-1 w-[40%]">Item Description</th>
                  {gstMode !== "none" && <th className="text-left py-2 px-1 w-[12%]">HSN/SAC</th>}
                  <th className="text-center py-2 px-1 w-[10%]">Qty</th>
                  <th className="text-right py-2 px-1 w-[13%]">Price</th>
                  {gstMode === "split" && (
                    <>
                      <th className="text-right py-2 px-1 w-[8%]">CGST</th>
                      <th className="text-right py-2 px-1 w-[8%]">SGST</th>
                    </>
                  )}
                  {gstMode === "single" && <th className="text-right py-2 px-1 w-[8%]">GST</th>}
                  <th className="text-right py-2 px-1 w-[17%]">Total</th>
                </tr>
              </thead>
              <tbody>
                {totals.items.map((item, idx) => (
                  <tr key={item.id} className="text-[#0f172a]">
                    <td className="py-3 px-1">
                      <p className="font-semibold">{item.description}</p>
                      {item.discountPercent ? (
                        <p className="text-[9px] text-[#ef4444] font-medium mt-0.5">Discount: {item.discountPercent}%</p>
                      ) : null}
                    </td>
                    {gstMode !== "none" && (
                      <td className="py-3 px-1 font-mono text-slate-500">{item.hsnSac || "—"}</td>
                    )}
                    <td className="py-3 px-1 text-center">{item.quantity}</td>
                    <td className="py-3 px-1 text-right">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                    {gstMode === "split" && (
                      <>
                        <td className="py-3 px-1 text-right text-slate-500 font-mono">{item.cgstPercent ?? 0}%</td>
                        <td className="py-3 px-1 text-right text-slate-500 font-mono">{item.sgstPercent ?? 0}%</td>
                      </>
                    )}
                    {gstMode === "single" && (
                      <td className="py-3 px-1 text-right text-slate-500 font-mono">{item.gstPercent ?? 0}%</td>
                    )}
                    <td className="py-3 px-1 text-right font-bold">
                      {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Grand Total */}
          <section className="flex justify-end mb-8">
            <div className="w-1/3 flex justify-between text-base font-extrabold text-[#0f172a] border-b-2 border-slate-900 pb-2">
              <span>TOTAL</span>
              <span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
          </section>
        </div>

        {/* Footer Details */}
        <footer className="grid grid-cols-2 gap-8 text-xs relative z-10 mt-auto">
          {/* Empty left side to allow space for the red corner block */}
          <div></div>

          {/* Right side: Bank and Business info */}
          <div className="flex flex-col gap-4 text-right">
            {bankDetails && bankDetails.bankName && (
              <div>
                <p className="font-bold text-[#0f172a] uppercase mb-1">Bank Details</p>
                <p className="text-slate-600">Bank: {bankDetails.bankName}</p>
                <p className="text-slate-600">Account Name: {bankDetails.accountName || company.name}</p>
                <p className="text-slate-600">Account Number: {bankDetails.accountNumber}</p>
                {bankDetails.ifsc && <p className="text-slate-600 font-mono text-[10px]">IFSC: {bankDetails.ifsc}</p>}
              </div>
            )}

            <div>
              <p className="font-bold text-[#0f172a] uppercase mb-1">{company.name}</p>
              {company.addressLines.map((l, i) => (
                <p key={i} className="text-slate-500">{l}</p>
              ))}
              {company.phone && <p className="text-slate-500 mt-1">Ph: {company.phone}</p>}
              {company.email && <p className="text-slate-500">{company.email}</p>}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
