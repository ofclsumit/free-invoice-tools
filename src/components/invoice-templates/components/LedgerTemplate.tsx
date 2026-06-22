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
 * TEMPLATE 1 — "Ledger"
 * Inspired by: Zoho Invoice
 * Identity: corporate blue, structured grid, condensed data table,
 * right-rail totals block. Inter for UI text, IBM Plex Mono for all
 * numerals so columns of figures align perfectly.
 *
 * Usage:
 *   <LedgerTemplate invoice={myInvoiceData} />
 *
 * Print: sized to A4 (210mm x 297mm) via the .invoice-page class.
 * Wrap in a parent with `id="invoice-print-root"` if using the
 * PDF export helper in utils/exportPdf.ts.
 */
export default function LedgerTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, shipTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page bg-white text-slate-900 mx-auto ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="flex flex-col h-full px-12 py-10">
        {/* ── Header band ───────────────────────────────────────── */}
        <header className="flex items-start justify-between pb-6 border-b-[3px] border-blue-700">
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-14 w-14 object-contain rounded"
              />
            ) : (
              <div className="h-14 w-14 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xl">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {company.name}
              </h1>
              {company.addressLines.map((line, i) => (
                <p key={i} className="text-xs text-slate-500 leading-snug">
                  {line}
                </p>
              ))}
              <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-slate-500">
                {company.email && <span>{company.email}</span>}
                {company.phone && <span>{company.phone}</span>}
              </div>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-700">
              INVOICE
            </h2>
            <p
              className="text-sm font-semibold text-slate-700 mt-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {invoice.invoiceNumber}
            </p>
            {invoice.status && (
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClasses(
                  invoice.status
                )}`}
              >
                {invoice.status}
              </span>
            )}
          </div>
        </header>

        {/* ── Meta row: dates + GSTIN ───────────────────────────── */}
        <section className="grid grid-cols-4 gap-4 py-5 text-sm border-b border-slate-200">
          <MetaCell label="Invoice Date" value={invoice.invoiceDate} />
          <MetaCell label="Due Date" value={invoice.dueDate || "—"} />
          <MetaCell label="GSTIN" value={company.gstin || "—"} mono />
          <MetaCell
            label="Place of Supply"
            value={billTo.placeOfSupply || "—"}
          />
        </section>

        {/* ── Bill To / Ship To ─────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-8 py-6">
          <PartyBlock title="Bill To" party={billTo} accent="blue" />
          {shipTo && <PartyBlock title="Ship To" party={shipTo} accent="blue" />}
        </section>

        {/* ── Line items table ──────────────────────────────────── */}
        <section className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white text-xs uppercase tracking-wide">
                <th className="text-left font-semibold py-2.5 px-3 rounded-l">
                  #
                </th>
                <th className="text-left font-semibold py-2.5 px-3">
                  Item & Description
                </th>
                {gstMode !== "none" && (
                  <th className="text-left font-semibold py-2.5 px-3">HSN/SAC</th>
                )}
                <th className="text-right font-semibold py-2.5 px-3">Qty</th>
                <th className="text-right font-semibold py-2.5 px-3">Rate</th>
                {gstMode === "split" && (
                  <>
                    <th className="text-right font-semibold py-2.5 px-3">CGST</th>
                    <th className="text-right font-semibold py-2.5 px-3">SGST</th>
                  </>
                )}
                {gstMode === "single" && (
                  <th className="text-right font-semibold py-2.5 px-3">GST</th>
                )}
                <th className="text-right font-semibold py-2.5 px-3 rounded-r">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="py-3 px-3 text-slate-400 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-slate-800">
                      {item.description}
                    </p>
                    {item.discountPercent ? (
                      <p className="text-xs text-blue-600 mt-0.5">
                        {item.discountPercent}% discount applied
                      </p>
                    ) : null}
                  </td>
                  {gstMode !== "none" && (
                    <td className="py-3 px-3 align-top text-slate-500 font-mono text-xs">
                      {item.hsnSac || "—"}
                    </td>
                  )}
                  <td className="py-3 px-3 align-top text-right font-mono">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono">
                    {formatCurrency(item.rate, invoice.currencySymbol)}
                  </td>
                  {gstMode === "split" && (
                    <>
                      <td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">
                        {item.cgstPercent ?? 0}%
                      </td>
                      <td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">
                        {item.sgstPercent ?? 0}%
                      </td>
                    </>
                  )}
                  {gstMode === "single" && (
                    <td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">
                      {item.gstPercent ?? 0}%
                    </td>
                  )}
                  <td className="py-3 px-3 align-top text-right font-mono font-semibold">
                    {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Totals + Notes row ────────────────────────────────── */}
        <section className="grid grid-cols-5 gap-8 pt-6 mt-2 border-t border-slate-200">
          <div className="col-span-3 space-y-4">
            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Notes
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.bankDetails && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Payment Details
                </p>
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono">
                  {invoice.bankDetails.accountName && (
                    <span>A/C Name: {invoice.bankDetails.accountName}</span>
                  )}
                  {invoice.bankDetails.accountNumber && (
                    <span>A/C No: {invoice.bankDetails.accountNumber}</span>
                  )}
                  {invoice.bankDetails.ifsc && (
                    <span>IFSC: {invoice.bankDetails.ifsc}</span>
                  )}
                  {invoice.bankDetails.upiId && (
                    <span>UPI: {invoice.bankDetails.upiId}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} />
              {totals.totalDiscount > 0 && (
                <Row
                  label="Discount"
                  value={-totals.totalDiscount}
                  symbol={invoice.currencySymbol}
                />
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
                <Row
                  label="Shipping"
                  value={totals.shippingCharge}
                  symbol={invoice.currencySymbol}
                />
              )}
              <div className="border-t border-slate-300 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total</span>
                <span
                  className="font-bold text-lg text-blue-700"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
                </span>
              </div>
              {totals.amountPaid > 0 && (
                <>
                  <Row
                    label="Amount Paid"
                    value={-totals.amountPaid}
                    symbol={invoice.currencySymbol}
                  />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-slate-900">Balance Due</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {formatCurrency(totals.balanceDue, invoice.currencySymbol)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {invoice.reverseCharge && (
          <p className="text-[10px] text-slate-400 mt-4 italic">
            Tax payable on reverse charge basis.
          </p>
        )}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-auto pt-8 flex items-end justify-between">
          <div>
            {invoice.termsAndConditions && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Terms & Conditions
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                  {invoice.termsAndConditions}
                </p>
              </>
            )}
          </div>
          <div className="text-right">
            <div className="h-12 border-b border-slate-300 w-40 mb-1" />
            <p className="text-xs text-slate-500">Authorized Signatory</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Small presentational helpers ───────────────────────────────────────

function statusClasses(status: string) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";
    case "Overdue":
      return "bg-red-100 text-red-700";
    case "Partially Paid":
      return "bg-amber-100 text-amber-700";
    case "Draft":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

function MetaCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-slate-800 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function PartyBlock({
  title,
  party,
  accent,
}: {
  title: string;
  party: { name: string; addressLines: string[]; gstin?: string; email?: string };
  accent: string;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold text-${accent}-700 uppercase tracking-wide mb-1.5`}>
        {title}
      </p>
      <p className="font-semibold text-slate-900">{party.name}</p>
      {party.addressLines.map((line, i) => (
        <p key={i} className="text-xs text-slate-500 leading-snug">
          {line}
        </p>
      ))}
      {party.gstin && (
        <p className="text-xs text-slate-500 font-mono mt-1">
          GSTIN: {party.gstin}
        </p>
      )}
      {party.email && <p className="text-xs text-slate-500">{party.email}</p>}
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
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-mono">{formatCurrency(value, symbol)}</span>
    </div>
  );
}
