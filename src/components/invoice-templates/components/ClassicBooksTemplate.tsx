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

/**
 * TEMPLATE 2 — "Classic Books"
 * Inspired by: QuickBooks
 * Identity: forest green accent, banker's-ledger feel, serif display
 * face (Source Serif 4) for headings paired with Inter body text,
 * traditional ruled table with horizontal hairlines only (no zebra
 * striping) — evokes a printed accounting ledger.
 *
 * Usage:
 *   <ClassicBooksTemplate invoice={myInvoiceData} />
 */
export default function ClassicBooksTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, shipTo, gstMode } = invoice;
  const green = "#1B4D3E";

  return (
    <div
      className={`invoice-page bg-white text-stone-900 mx-auto ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="flex flex-col h-full px-12 py-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between pb-6">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div
                className="h-16 w-16 flex items-center justify-center text-white text-2xl font-serif"
                style={{ backgroundColor: green }}
              >
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <h1
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: green }}
              >
                {company.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {company.addressLines.join(" · ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2
              className="text-2xl font-bold tracking-wide"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: green }}
            >
              Invoice
            </h2>
            {invoice.status && (
              <span
                className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border"
                style={{ borderColor: green, color: green }}
              >
                {invoice.status}
              </span>
            )}
          </div>
        </header>

        <div className="h-[2px]" style={{ backgroundColor: green }} />
        <div className="h-px bg-stone-300 mt-1 mb-6" />

        {/* ── Meta + parties ─────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-10 mb-6">
          <div className="space-y-4">
            <PartyBlock title="Billed To" party={billTo} green={green} />
            {shipTo && <PartyBlock title="Shipped To" party={shipTo} green={green} />}
          </div>
          <div className="space-y-2 text-sm">
            <DetailLine label="Invoice No." value={invoice.invoiceNumber} green={green} />
            <DetailLine label="Invoice Date" value={invoice.invoiceDate} green={green} />
            <DetailLine label="Due Date" value={invoice.dueDate || "—"} green={green} />
            {company.gstin && (
              <DetailLine label="Seller GSTIN" value={company.gstin} green={green} />
            )}
            {billTo.gstin && gstMode !== "none" && (
              <DetailLine label="Buyer GSTIN" value={billTo.gstin} green={green} />
            )}
            {billTo.placeOfSupply && (
              <DetailLine label="Place of Supply" value={billTo.placeOfSupply} green={green} />
            )}
          </div>
        </section>

        {/* ── Line items — ruled ledger style ───────────────────── */}
        <section className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                className="text-xs uppercase tracking-wide text-stone-600"
                style={{ borderBottom: `2px solid ${green}` }}
              >
                <th className="text-left font-semibold py-2 pr-2">Description</th>
                {gstMode !== "none" && (
                  <th className="text-left font-semibold py-2 px-2">HSN/SAC</th>
                )}
                <th className="text-right font-semibold py-2 px-2">Qty</th>
                <th className="text-right font-semibold py-2 px-2">Rate</th>
                {gstMode === "split" && (
                  <>
                    <th className="text-right font-semibold py-2 px-2">CGST</th>
                    <th className="text-right font-semibold py-2 px-2">SGST</th>
                  </>
                )}
                {gstMode === "single" && (
                  <th className="text-right font-semibold py-2 px-2">GST</th>
                )}
                <th className="text-right font-semibold py-2 pl-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item) => (
                <tr key={item.id} className="border-b border-stone-200">
                  <td className="py-3 pr-2 align-top">
                    <p className="text-stone-800">{item.description}</p>
                    {item.discountPercent ? (
                      <p className="text-xs text-stone-400 mt-0.5">
                        Less {item.discountPercent}% discount
                      </p>
                    ) : null}
                  </td>
                  {gstMode !== "none" && (
                    <td className="py-3 px-2 align-top text-stone-500 text-xs">
                      {item.hsnSac || "—"}
                    </td>
                  )}
                  <td className="py-3 px-2 align-top text-right">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </td>
                  <td className="py-3 px-2 align-top text-right">
                    {formatCurrency(item.rate, invoice.currencySymbol)}
                  </td>
                  {gstMode === "split" && (
                    <>
                      <td className="py-3 px-2 align-top text-right text-xs text-stone-500">
                        {item.cgstPercent ?? 0}%
                      </td>
                      <td className="py-3 px-2 align-top text-right text-xs text-stone-500">
                        {item.sgstPercent ?? 0}%
                      </td>
                    </>
                  )}
                  {gstMode === "single" && (
                    <td className="py-3 px-2 align-top text-right text-xs text-stone-500">
                      {item.gstPercent ?? 0}%
                    </td>
                  )}
                  <td className="py-3 pl-2 align-top text-right font-medium">
                    {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Totals ─────────────────────────────────────────────── */}
        <section className="flex justify-end mt-4">
          <div className="w-72 space-y-1.5 text-sm">
            <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} />
            {totals.totalDiscount > 0 && (
              <Row label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} />
            )}
            {gstMode === "split" && (
              <>
                <Row label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} />
                <Row label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} />
                {totals.totalIgst > 0 && (
                  <Row label="IGST" value={totals.totalIgst} symbol={invoice.currencySymbol} />
                )}
              </>
            )}
            {gstMode === "single" && (
              <Row label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} />
            )}
            {totals.shippingCharge > 0 && (
              <Row label="Shipping" value={totals.shippingCharge} symbol={invoice.currencySymbol} />
            )}
            <div
              className="flex justify-between items-baseline pt-2 mt-1"
              style={{ borderTop: `2px solid ${green}` }}
            >
              <span
                className="font-bold text-base"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: green }}
              >
                Total Due
              </span>
              <span className="font-bold text-lg" style={{ color: green }}>
                {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
              </span>
            </div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} />
                <div className="flex justify-between items-baseline text-stone-800 font-semibold pt-1">
                  <span>Balance</span>
                  <span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Notes / Terms / Bank ──────────────────────────────── */}
        <section className="grid grid-cols-2 gap-10 mt-8 pt-6 border-t border-stone-200 text-xs text-stone-500">
          <div className="space-y-3">
            {invoice.notes && (
              <div>
                <p className="font-semibold text-stone-700 mb-1">Notes</p>
                <p className="leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <p className="font-semibold text-stone-700 mb-1">Terms</p>
                <p className="leading-relaxed">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {invoice.bankDetails && (
              <div>
                <p className="font-semibold text-stone-700 mb-1">Remit Payment To</p>
                <div className="space-y-0.5">
                  {invoice.bankDetails.accountName && <p>{invoice.bankDetails.accountName}</p>}
                  {invoice.bankDetails.bankName && (
                    <p>
                      {invoice.bankDetails.bankName}
                      {invoice.bankDetails.branch ? `, ${invoice.bankDetails.branch}` : ""}
                    </p>
                  )}
                  {invoice.bankDetails.accountNumber && <p>A/C: {invoice.bankDetails.accountNumber}</p>}
                  {invoice.bankDetails.ifsc && <p>IFSC: {invoice.bankDetails.ifsc}</p>}
                </div>
              </div>
            )}
            <div>
              {company.signatureUrl ? (
                <img src={company.signatureUrl} alt="Signature" className="h-12 object-contain mb-1" />
              ) : (
                <div className="h-10"></div>
              )}
              <p className="font-semibold text-stone-700 pt-1 border-t border-stone-300 inline-block px-2">Authorized Signatory</p>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-8 text-center text-[10px] text-stone-400">
          {company.name} {company.website ? `· ${company.website}` : ""}
        </footer>
      </div>
    </div>
  );
}

function PartyBlock({
  title,
  party,
  green,
}: {
  title: string;
  party: { name: string; addressLines: string[]; gstin?: string; email?: string };
  green: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: green }}
      >
        {title}
      </p>
      <p className="font-semibold text-stone-900">{party.name}</p>
      <p className="text-xs text-stone-500 leading-snug">
        {party.addressLines.join(", ")}
      </p>
      {party.email && <p className="text-xs text-stone-500">{party.email}</p>}
    </div>
  );
}

function DetailLine({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green: string;
}) {
  return (
    <div className="flex justify-between border-b border-dotted border-stone-300 pb-1">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-800">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  symbol,
}: {
  label: string;
  value: number;
  symbol: string;
}) {
  return (
    <div className="flex justify-between text-stone-600">
      <span>{label}</span>
      <span>{formatCurrency(value, symbol)}</span>
    </div>
  );
}
