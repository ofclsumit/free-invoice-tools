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

export default function StudioTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const coral = "#E8633C";
  const cream = "#FBF7F2";

  return (
    <div
      className={`invoice-page mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        backgroundColor: cream,
        color: "#2A2622",
      }}
    >
      {invoice.watermarkUrl && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
          <img src={invoice.watermarkUrl} alt="" className="max-w-[70%] max-h-[70%] object-contain" />
        </div>
      )}
      <div className="flex flex-col h-full px-12 py-10 relative z-[1]">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <div
                className="h-12 w-12 flex items-center justify-center text-white font-bold text-lg rounded-2xl"
                style={{ backgroundColor: coral }}
              >
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-lg">{company.name}</p>
              <p className="text-xs text-stone-500">{company.email}</p>
            </div>
          </div>
          <div
            className="px-5 py-2.5 rounded-2xl text-white text-right"
            style={{ backgroundColor: coral }}
          >
            <p className="text-[10px] uppercase tracking-widest opacity-90">{invoice.documentType || "QUOTATION"}</p>
            <p className="font-bold">{invoice.invoiceNumber}</p>
          </div>
        </header>

        {/* ── Hero summary card ─────────────────────────────────── */}
        <section className="bg-white rounded-3xl p-7 mb-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 mb-1">Quote Amount</p>
            <p className="text-4xl font-extrabold" style={{ color: coral }}>
              {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
            </p>
            {invoice.dueDate && (
              <p className="text-xs text-stone-500 mt-1">Valid until {invoice.dueDate}</p>
            )}
          </div>
        </section>

        {/* ── From / To cards ────────────────────────────────────── */}
        <section className={`grid gap-4 mb-6 ${invoice.shipTo ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              From
            </p>
            <p className="font-semibold">{company.name}</p>
            <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
              {company.addressLines.join(", ")}
            </p>
            {company.gstin && (
              <p className="text-xs text-stone-500 mt-1">GSTIN {company.gstin}</p>
            )}
            {company.pan && (
              <p className="text-xs text-stone-500">PAN {company.pan}</p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Billed To
            </p>
            <p className="font-semibold">{billTo.name}</p>
            <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
              {billTo.addressLines.join(", ")}
            </p>
            {billTo.gstin && gstMode !== "none" && (
              <p className="text-xs text-stone-500 mt-1">GSTIN {billTo.gstin}</p>
            )}
          </div>
          {invoice.shipTo && (
            <div className="bg-white rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Shipped To
              </p>
              <p className="font-semibold">{invoice.shipTo.name}</p>
              <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                {invoice.shipTo.addressLines.join(", ")}
              </p>
              {invoice.shipTo.gstin && (
                <p className="text-xs text-stone-500 mt-1">GSTIN {invoice.shipTo.gstin}</p>
              )}
            </div>
          )}
        </section>

        {invoice.transportDetails && (
          <section className="bg-white rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {invoice.transportDetails.transporterName && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transporter</p>
                <p className="font-semibold">{invoice.transportDetails.transporterName}</p>
              </div>
            )}
            {invoice.transportDetails.vehicleNumber && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Vehicle No</p>
                <p className="font-semibold font-mono">{invoice.transportDetails.vehicleNumber}</p>
              </div>
            )}
            {invoice.transportDetails.modeOfTransport && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Mode</p>
                <p className="font-semibold">{invoice.transportDetails.modeOfTransport}</p>
              </div>
            )}
            {invoice.transportDetails.vehicleType && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Vehicle Type</p>
                <p className="font-semibold">{invoice.transportDetails.vehicleType}</p>
              </div>
            )}
            {invoice.transportDetails.distance && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Distance (km)</p>
                <p className="font-semibold">{invoice.transportDetails.distance}</p>
              </div>
            )}
            {invoice.transportDetails.transportDocNo && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Doc No</p>
                <p className="font-semibold">{invoice.transportDetails.transportDocNo}</p>
              </div>
            )}
            {invoice.transportDetails.transactionType && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Transaction Type</p>
                <p className="font-semibold">{invoice.transportDetails.transactionType}</p>
              </div>
            )}
            {invoice.transportDetails.shippedFromAddress && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Shipped From</p>
                <p className="font-semibold">{invoice.transportDetails.shippedFromAddress}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Line items as cards ────────────────────────────────── */}
        <section className="bg-white rounded-2xl overflow-hidden flex-1">

          <div
            className="grid text-[10px] font-bold uppercase tracking-widest text-stone-400 px-5 py-3"
            style={{
              gridTemplateColumns:
                gstMode === "split"
                  ? "1fr 60px 70px 60px 60px 90px"
                  : gstMode === "single"
                  ? "1fr 60px 70px 60px 90px"
                  : "1fr 60px 70px 90px",
            }}
          >
            <span>Item</span>
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
          {totals.items.map((item, idx) => (
            <div
              key={item.id}
              className="grid items-start px-5 py-4 text-sm"
              style={{
                borderTop: "1px solid #F2EDE6",
                gridTemplateColumns:
                  gstMode === "split"
                    ? "1fr 60px 70px 60px 60px 90px"
                    : gstMode === "single"
                    ? "1fr 60px 70px 60px 90px"
                    : "1fr 60px 70px 90px",
              }}
            >
              <div>
                <p className="font-medium">{item.description}</p>
                {item.hsnSac && (
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    HSN/SAC {item.hsnSac}
                  </p>
                )}
              </div>
              <span className="text-right text-stone-600">
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
              </span>
              <span className="text-right text-stone-600">
                {formatCurrency(item.rate, invoice.currencySymbol)}
              </span>
              {gstMode === "split" && (
                <>
                  <span className="text-right text-stone-500 text-xs">
                    {item.cgstPercent ?? 0}%
                  </span>
                  <span className="text-right text-stone-500 text-xs">
                    {item.sgstPercent ?? 0}%
                  </span>
                </>
              )}
              {gstMode === "single" && (
                <span className="text-right text-stone-500 text-xs">
                  {item.gstPercent ?? 0}%
                </span>
              )}
              <span className="text-right font-semibold">
                {formatCurrency(item.lineTotal, invoice.currencySymbol)}
              </span>
            </div>
          ))}
        </section>

        {/* ── Totals card ────────────────────────────────────────── */}
        <section className="flex justify-end mt-5">
          <div className="bg-white rounded-2xl p-5 w-80 space-y-2 text-sm">
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
            <div className="border-t pt-2 mt-1 flex justify-between items-baseline" style={{ borderColor: "#F2EDE6" }}>
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-lg" style={{ color: coral }}>
                {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Notes ──────────────────────────────────────────────── */}
        {(invoice.notes || invoice.bankDetails) && (
          <section className="grid grid-cols-2 gap-4 mt-6">
            {invoice.notes && (
              <div className="bg-white rounded-2xl p-5 text-xs text-stone-500 leading-relaxed">
                <p className="font-bold text-stone-700 mb-1 text-[10px] uppercase tracking-widest">
                  Notes
                </p>
                {invoice.notes}
              </div>
            )}
            {invoice.bankDetails && (
              <div className="bg-white rounded-2xl p-5 text-xs text-stone-500 leading-relaxed">
                <p className="font-bold text-stone-700 mb-1 text-[10px] uppercase tracking-widest">
                  Payment Details
                </p>
                {invoice.bankDetails.accountName && <p>{invoice.bankDetails.accountName}</p>}
                {invoice.bankDetails.bankName && <p>{invoice.bankDetails.bankName}{invoice.bankDetails.branch ? `, ${invoice.bankDetails.branch}` : ""}</p>}
                {invoice.bankDetails.accountNumber && <p>A/C: {invoice.bankDetails.accountNumber}</p>}
                {invoice.bankDetails.ifsc && <p>IFSC: {invoice.bankDetails.ifsc}</p>}
                {invoice.bankDetails.upiId && <p>UPI: {invoice.bankDetails.upiId}</p>}
              </div>
            )}
          </section>
        )}

        {/* ── Signature ──────────────────────────────────────────── */}
        {company.signatureUrl ? (
          <div className="mt-8 flex justify-end">
            <div className="text-center">
              <img src={company.signatureUrl} alt="Signature" className="h-16 object-contain mb-1" />
              <p className="text-[10px] text-stone-500 border-t border-stone-300 pt-1 px-4">
                Authorized Signatory
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex justify-end">
            <div className="text-center pt-8">
              <p className="text-[10px] text-stone-500 border-t border-stone-300 pt-1 px-4">
                Authorized Signatory
              </p>
            </div>
          </div>
        )}

        <footer className="mt-auto pt-8 text-center text-xs text-stone-400">
          This quotation is valid until {invoice.dueDate || "15 days from issue"} · Thank you!
        </footer>
      </div>
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
    <div className="flex justify-between text-stone-500">
      <span>{label}</span>
      <span>{formatCurrency(value, symbol)}</span>
    </div>
  );
}
