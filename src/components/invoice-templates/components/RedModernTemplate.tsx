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

export default function RedModernTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        backgroundColor: "#e9e7e4",
        color: "#0d1330",
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
              <div className="h-11 w-11 flex items-center justify-center text-white font-black text-lg" style={{ background: "#12121b", borderRadius: "2.4mm" }}>
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-black text-base tracking-tight">{company.name}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#6b6b70" }}>
                GST INVOICING SUITE
              </p>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black lowercase tracking-tight" style={{ color: "#ee1c3e" }}>invoice</div>
            <div className="text-xs text-right mt-0.5" style={{ color: "#6b6b70" }}>
              Invoice Number: {invoice.invoiceNumber}
            </div>
          </div>
        </header>

        <section className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#6b6b70" }}>Billed to:</p>
          <p className="font-semibold">{billTo.name}</p>
          {billTo.phone && <p className="text-xs" style={{ color: "#6b6b70" }}>{billTo.phone}</p>}
          {billTo.addressLines.map((l, i) => (
            <p key={i} className="text-xs" style={{ color: "#6b6b70" }}>{l}</p>
          ))}
        </section>

        <hr className="mb-4" style={{ border: "none", borderTop: "1px solid #0d1330", opacity: 0.15 }} />

        <table className="w-full text-sm mb-4" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#0d1330" }}>
              <th className="text-left pb-2">Item Description</th>
              <th className="text-right pb-2">Qty</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 text-sm font-medium">
                  {item.description}
                  {item.hsnSac && <span className="text-[10px] ml-1" style={{ color: "#6b6b70" }}>({item.hsnSac})</span>}
                </td>
                <td className="py-2.5 text-right text-sm">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</td>
                <td className="py-2.5 text-right text-sm">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                <td className="py-2.5 text-right text-sm font-semibold">{formatCurrency(item.lineTotal, invoice.currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="mb-4" style={{ border: "none", borderTop: "1px solid #0d1330", opacity: 0.15 }} />

        <div className="flex justify-end mb-6">
          <div className="text-right text-sm">
            <div className="flex justify-between gap-8 mb-1" style={{ color: "#6b6b70" }}>
              <span>Subtotal</span>
              <span className="font-medium" style={{ color: "#0d1330" }}>{formatCurrency(totals.subTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between gap-8 mb-1" style={{ color: "#6b6b70" }}>
                <span>Discount</span>
                <span className="font-medium" style={{ color: "#0d1330" }}>-{formatCurrency(totals.totalDiscount, invoice.currencySymbol)}</span>
              </div>
            )}
            {gstMode !== "none" && (
              <div className="flex justify-between gap-8 mb-1" style={{ color: "#6b6b70" }}>
                <span>GST</span>
                <span className="font-medium" style={{ color: "#0d1330" }}>{formatCurrency(totals.totalGst, invoice.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between gap-8 text-base font-bold" style={{ borderTop: "1px solid #0d1330", paddingTop: "6px" }}>
              <span>Total</span>
              <span style={{ color: "#ee1c3e" }}>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-6 text-xs relative z-[2]" style={{ color: "#6b6b70" }}>
          {invoice.bankDetails && (
            <div>
              <p className="font-semibold text-[10px] uppercase tracking-widest mb-1" style={{ color: "#0d1330" }}>Payment Info</p>
              {invoice.bankDetails.bankName && <p>Bank: {invoice.bankDetails.bankName}</p>}
              {invoice.bankDetails.accountName && <p>Account Name: {invoice.bankDetails.accountName}</p>}
              {invoice.bankDetails.accountNumber && <p>Account Number: {invoice.bankDetails.accountNumber}</p>}
              {invoice.bankDetails.ifsc && <p>IFSC: {invoice.bankDetails.ifsc}</p>}
            </div>
          )}
          <div className="text-right">
            <p className="font-black text-sm" style={{ color: "#0d1330" }}>{company.name}</p>
            <p>{company.addressLines[0]}</p>
            {company.phone && <p>{company.phone}</p>}
            {company.email && <p>{company.email}</p>}
            {company.website && <p>{company.website}</p>}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: "200px", height: "170px", overflow: "hidden" }}>
          <svg viewBox="0 0 360 300" style={{ width: "100%", height: "100%" }}>
            <path d="M0,0 L280,0 Q360,0 360,80 L360,300 L0,300 Z" fill="#ee1c3e" opacity="0.9" />
            <text x="20" y="290" fontFamily="Montserrat, sans-serif" fontWeight="900" fontSize="340" fill="#e9e7e4" opacity="0.3">
              {company.name.charAt(0)}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
