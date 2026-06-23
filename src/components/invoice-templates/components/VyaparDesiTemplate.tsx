import React from "react";
import {
  InvoiceData,
  computeInvoiceTotals,
  formatCurrency,
  numberToWords,
} from "../data/invoiceTypes";

interface Props {
  invoice: InvoiceData;
  className?: string;
}

/**
 * TEMPLATE 4 — "Vyapar Desi"
 * Inspired by: Vyapar
 * Identity: compact, data-dense layout built specifically for
 * GST-heavy Indian SMB invoicing — tight grid, saffron/maroon accent,
 * boxed border frame (common in Indian billing software), amount in
 * words, and a HSN-wise tax summary block. Noto Sans for broad script
 * compatibility.
 *
 * Usage:
 *   <VyaparDesiTemplate invoice={myInvoiceData} />
 */
export default function VyaparDesiTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const maroon = "#8B1E3F";
  const saffron = "#E08B2C";

  return (
    <div
      className={`invoice-page bg-white text-stone-900 mx-auto ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: "12px",
      }}
    >
      <div
        className="flex flex-col h-full m-4"
        style={{ border: `1.5px solid ${maroon}` }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1.5px solid ${maroon}`, backgroundColor: "#FDF6EC" }}
        >
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="logo" className="h-12 w-12 object-contain rounded-full" />
            ) : (
              <div
                className="h-12 w-12 flex items-center justify-center text-white font-bold rounded-full"
                style={{ backgroundColor: maroon }}
              >
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-base" style={{ color: maroon }}>
                {company.name}
              </p>
              <p className="text-[10px] text-stone-600 leading-tight">
                {company.addressLines.join(", ")}
              </p>
              <p className="text-[10px] text-stone-600">
                {company.phone}
                {company.phone && company.email ? " | " : ""}
                {company.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2
              className="text-lg font-extrabold uppercase tracking-wide"
              style={{ color: saffron }}
            >
              {invoice.documentType || "TAX INVOICE"}
            </h2>
            {company.gstin && (
              <p className="text-[10px] font-semibold text-stone-700">
                GSTIN: {company.gstin}
              </p>
            )}
          </div>
        </header>

        {/* ── Invoice meta strip ─────────────────────────────────── */}
        <div
          className="grid grid-cols-4 text-[11px]"
          style={{ borderBottom: `1px solid ${maroon}` }}
        >
          <MetaBox label="Invoice #" value={invoice.invoiceNumber} maroon={maroon} />
          <MetaBox label="Invoice Date" value={invoice.invoiceDate} maroon={maroon} />
          <MetaBox label="Due Date" value={invoice.dueDate || "—"} maroon={maroon} />
          <MetaBox
            label="Place of Supply"
            value={billTo.placeOfSupply || "—"}
            maroon={maroon}
            last
          />
        </div>

        {/* ── Bill To ────────────────────────────────────────────── */}
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${maroon}` }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: maroon }}>
            Bill To
          </p>
          <p className="font-semibold">{billTo.name}</p>
          <p className="text-[11px] text-stone-600">{billTo.addressLines.join(", ")}</p>
          {billTo.gstin && gstMode !== "none" && (
            <p className="text-[11px] text-stone-600">GSTIN: {billTo.gstin}</p>
          )}
        </div>

        {/* ── Line items ─────────────────────────────────────────── */}
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: maroon, color: "white" }}>
              <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">#</th>
              <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">
                Item Description
              </th>
              {gstMode !== "none" && (
                <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">
                  HSN
                </th>
              )}
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">Qty</th>
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">Rate</th>
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">
                Taxable Val
              </th>
              {gstMode === "split" && (
                <>
                  <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">
                    CGST
                  </th>
                  <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">
                    SGST
                  </th>
                </>
              )}
              {gstMode === "single" && (
                <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">
                  GST
                </th>
              )}
              <th className="text-right font-semibold py-1.5 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #E5DDD0" }}>
                <td className="py-1.5 px-2 border-r border-stone-200 text-stone-500">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-2 border-r border-stone-200">{item.description}</td>
                {gstMode !== "none" && (
                  <td className="py-1.5 px-2 border-r border-stone-200 text-stone-500">
                    {item.hsnSac || "—"}
                  </td>
                )}
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </td>
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                  {formatCurrency(item.rate, invoice.currencySymbol)}
                </td>
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                  {formatCurrency(item.taxableValue, invoice.currencySymbol)}
                </td>
                {gstMode === "split" && (
                  <>
                    <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                      {item.cgstPercent ?? 0}%<br />
                      <span className="text-stone-400">
                        {formatCurrency(item.cgstAmount, invoice.currencySymbol)}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                      {item.sgstPercent ?? 0}%<br />
                      <span className="text-stone-400">
                        {formatCurrency(item.sgstAmount, invoice.currencySymbol)}
                      </span>
                    </td>
                  </>
                )}
                {gstMode === "single" && (
                  <td className="py-1.5 px-2 border-r border-stone-200 text-right">
                    {item.gstPercent ?? 0}%<br />
                    <span className="text-stone-400">
                      {formatCurrency(item.gstAmount, invoice.currencySymbol)}
                    </span>
                  </td>
                )}
                <td className="py-1.5 px-2 text-right font-semibold">
                  {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Totals + words ─────────────────────────────────────── */}
        <div className="flex flex-1" style={{ borderTop: `1px solid ${maroon}` }}>
          <div className="flex-1 px-5 py-3 text-[11px] space-y-2">
            <div>
              <p className="font-bold" style={{ color: maroon }}>
                Amount in Words
              </p>
              <p className="text-stone-600 italic">
                {numberToWords(totals.grandTotal, invoice.currencySymbol === "₹" ? "Rupees" : "")}
              </p>
            </div>
            {invoice.bankDetails && (
              <div>
                <p className="font-bold" style={{ color: maroon }}>
                  Bank Details
                </p>
                <p className="text-stone-600">
                  {invoice.bankDetails.bankName}, A/C: {invoice.bankDetails.accountNumber}, IFSC:{" "}
                  {invoice.bankDetails.ifsc}
                </p>
                {invoice.bankDetails.upiId && (
                  <p className="text-stone-600">UPI: {invoice.bankDetails.upiId}</p>
                )}
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <p className="font-bold" style={{ color: maroon }}>
                  Terms & Conditions
                </p>
                <p className="text-stone-600 leading-snug">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
          <div
            className="w-64 px-5 py-3 space-y-1.5 text-[11px]"
            style={{ borderLeft: `1px solid ${maroon}`, backgroundColor: "#FDF6EC" }}
          >
            <Row label="Taxable Amount" value={totals.subTotal - totals.totalDiscount} symbol={invoice.currencySymbol} />
            {gstMode === "split" && (
              <>
                <Row label="Total CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} />
                <Row label="Total SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} />
                {totals.totalIgst > 0 && (
                  <Row label="Total IGST" value={totals.totalIgst} symbol={invoice.currencySymbol} />
                )}
              </>
            )}
            {gstMode === "single" && (
              <Row label="Total GST" value={totals.totalGst} symbol={invoice.currencySymbol} />
            )}
            {totals.shippingCharge > 0 && (
              <Row label="Shipping" value={totals.shippingCharge} symbol={invoice.currencySymbol} />
            )}
            <div
              className="flex justify-between items-baseline pt-2 mt-1 font-bold"
              style={{ borderTop: `1.5px solid ${maroon}`, color: maroon }}
            >
              <span>Grand Total</span>
              <span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Received" value={-totals.amountPaid} symbol={invoice.currencySymbol} />
                <div className="flex justify-between items-baseline font-bold" style={{ color: saffron }}>
                  <span>Balance Due</span>
                  <span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.reverseCharge && (
          <p className="text-[10px] text-stone-500 px-5 py-1 italic" style={{ borderTop: `1px solid ${maroon}` }}>
            Tax payable on reverse charge: Yes
          </p>
        )}

        {/* ── Signature ──────────────────────────────────────────── */}
        <footer
          className="flex justify-between items-end px-5 py-4 mt-auto"
          style={{ borderTop: `1.5px solid ${maroon}` }}
        >
          <p className="text-[10px] text-stone-400">
            This is a computer-generated invoice.
          </p>
          <div className="text-center">
            {company.signatureUrl ? (
              <img src={company.signatureUrl} alt="Signature" className="h-10 object-contain mx-auto mb-1" />
            ) : (
              <p className="text-[11px] font-semibold mb-8" style={{ color: maroon }}>
                For {company.name}
              </p>
            )}
            <p className="text-[10px] text-stone-500 border-t border-stone-300 pt-1 px-4 inline-block">
              Authorized Signatory
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MetaBox({
  label,
  value,
  maroon,
  last,
}: {
  label: string;
  value: string;
  maroon: string;
  last?: boolean;
}) {
  return (
    <div className={`px-3 py-2 ${last ? "" : "border-r"}`} style={{ borderColor: maroon }}>
      <p className="text-[9px] uppercase tracking-wide text-stone-400">{label}</p>
      <p className="font-semibold text-stone-800">{value}</p>
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
