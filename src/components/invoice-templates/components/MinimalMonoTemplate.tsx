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
 * TEMPLATE 5 — "Minimal Mono"
 * Identity: zero-ornamentation agency/freelancer invoice. Pure
 * black-on-white, single hairline-rule system (no fills, no
 * rounded corners, no zebra striping), all figures set in JetBrains
 * Mono for a precise, technical register. Status renders as a
 * rotated stamp mark rather than a pill badge — the one signature
 * flourish in an otherwise restrained design.
 *
 * Usage:
 *   <MinimalMonoTemplate invoice={myInvoiceData} />
 */
export default function MinimalMonoTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page bg-white text-black mx-auto relative ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {invoice.status && (
        <div
          className="absolute top-16 right-16 border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
          style={{
            transform: "rotate(8deg)",
            borderColor: invoice.status === "Paid" ? "#000" : "#000",
            opacity: 0.85,
          }}
        >
          {invoice.status}
        </div>
      )}

      <div className="flex flex-col h-full px-14 py-12">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between pb-8">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="logo" className="h-10 w-10 object-contain grayscale" />
            ) : (
              <div className="h-10 w-10 border-2 border-black flex items-center justify-center font-bold">
                {company.name.charAt(0)}
              </div>
            )}
            <p className="font-bold tracking-tight text-lg">{company.name}</p>
          </div>
          <p
            className="text-xs tracking-widest uppercase text-black/50"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Invoice
          </p>
        </header>

        <div className="h-px bg-black w-full" />

        {/* ── Identity block ─────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-8 py-8 text-xs">
          <div>
            <p className="text-black/40 uppercase tracking-widest mb-1.5">From</p>
            <p className="font-medium">{company.name}</p>
            {company.addressLines.map((l, i) => (
              <p key={i} className="text-black/60">
                {l}
              </p>
            ))}
            {company.gstin && (
              <p
                className="text-black/60 mt-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                GSTIN {company.gstin}
              </p>
            )}
          </div>
          <div>
            <p className="text-black/40 uppercase tracking-widest mb-1.5">Bill To</p>
            <p className="font-medium">{billTo.name}</p>
            {billTo.addressLines.map((l, i) => (
              <p key={i} className="text-black/60">
                {l}
              </p>
            ))}
            {billTo.gstin && gstMode !== "none" && (
              <p
                className="text-black/60 mt-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                GSTIN {billTo.gstin}
              </p>
            )}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <KV label="No." value={invoice.invoiceNumber} />
            <KV label="Date" value={invoice.invoiceDate} />
            <KV label="Due" value={invoice.dueDate || "—"} />
            {billTo.placeOfSupply && <KV label="POS" value={billTo.placeOfSupply} />}
          </div>
        </section>

        <div className="h-px bg-black w-full" />

        {/* ── Line items ─────────────────────────────────────────── */}
        <section className="flex-1">
          <div
            className="grid text-[10px] uppercase tracking-widest text-black/40 py-3"
            style={{
              gridTemplateColumns:
                gstMode === "split"
                  ? "1fr 70px 90px 60px 60px 100px"
                  : gstMode === "single"
                  ? "1fr 70px 90px 60px 100px"
                  : "1fr 70px 90px 100px",
            }}
          >
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            {gstMode === "split" && (
              <>
                <span className="text-right">CGST</span>
                <span className="text-right">SGST</span>
              </>
            )}
            {gstMode === "single" && <span className="text-right">GST</span>}
            <span className="text-right">Amount</span>
          </div>
          <div className="h-px bg-black w-full" />

          {totals.items.map((item) => (
            <React.Fragment key={item.id}>
              <div
                className="grid items-start py-3 text-sm"
                style={{
                  gridTemplateColumns:
                    gstMode === "split"
                      ? "1fr 70px 90px 60px 60px 100px"
                      : gstMode === "single"
                      ? "1fr 70px 90px 60px 100px"
                      : "1fr 70px 90px 100px",
                }}
              >
                <div>
                  <p>{item.description}</p>
                  {item.hsnSac && (
                    <p
                      className="text-[10px] text-black/40 mt-0.5"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.hsnSac}
                    </p>
                  )}
                </div>
                <span
                  className="text-right text-black/70"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </span>
                <span
                  className="text-right text-black/70"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatCurrency(item.rate, invoice.currencySymbol)}
                </span>
                {gstMode === "split" && (
                  <>
                    <span
                      className="text-right text-black/50 text-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.cgstPercent ?? 0}%
                    </span>
                    <span
                      className="text-right text-black/50 text-xs"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.sgstPercent ?? 0}%
                    </span>
                  </>
                )}
                {gstMode === "single" && (
                  <span
                    className="text-right text-black/50 text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {item.gstPercent ?? 0}%
                  </span>
                )}
                <span
                  className="text-right font-medium"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                </span>
              </div>
              <div className="h-px bg-black/15 w-full" />
            </React.Fragment>
          ))}
        </section>

        {/* ── Totals ─────────────────────────────────────────────── */}
        <section className="flex justify-end pt-6">
          <div
            className="w-72 space-y-1.5 text-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
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
            <div className="h-px bg-black w-full my-2" />
            <div className="flex justify-between items-baseline font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} />
                <div className="flex justify-between items-baseline font-bold">
                  <span>Balance</span>
                  <span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-auto pt-10">
          <div className="h-px bg-black w-full mb-4" />
          <div className="grid grid-cols-2 gap-10 text-[11px] text-black/60 items-end">
            <div>
              {invoice.notes && <p className="mb-2">{invoice.notes}</p>}
              {invoice.bankDetails && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {invoice.bankDetails.bankName && `${invoice.bankDetails.bankName} · `}
                  {invoice.bankDetails.accountNumber}
                  {invoice.bankDetails.ifsc && ` · ${invoice.bankDetails.ifsc}`}
                </p>
              )}
            </div>
            <div className="text-right flex flex-col items-end justify-end">
              {company.signatureUrl ? (
                <img src={company.signatureUrl} alt="Signature" className="h-12 object-contain mb-1" />
              ) : (
                <div className="h-10"></div>
              )}
              <p className="border-t border-black/20 pt-1 px-4 inline-block">Authorized Signatory</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs py-0.5">
      <span className="text-black/40">{label}</span>
      <span>{value}</span>
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
    <div className="flex justify-between text-black/60">
      <span>{label}</span>
      <span>{formatCurrency(value, symbol)}</span>
    </div>
  );
}
