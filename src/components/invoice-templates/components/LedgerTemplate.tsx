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

export default function LedgerTemplate({ invoice, className = "" }: Props) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;

  return (
    <div
      className={`invoice-page bg-white text-gray-900 mx-auto relative overflow-hidden ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {invoice.watermarkUrl && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.08] z-0">
          <img src={invoice.watermarkUrl} alt="" className="max-w-[70%] max-h-[70%] object-contain" />
        </div>
      )}
      <div className="flex flex-col min-h-[297mm] relative z-[1]" style={{ padding: "8mm 10mm" }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between pb-5">
          <div className="flex items-start gap-4 max-w-[65%]">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="h-20 w-20 object-contain shrink-0"
              />
            ) : company.name ? (
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center font-bold shrink-0" style={{ fontSize: "32px" }}>
                {company.name.charAt(0).toUpperCase()}
              </div>
            ) : null}
            <div className="pt-1">
              <h1 className="text-xl font-bold text-gray-900 leading-tight" style={{ fontSize: "20px" }}>
                {company.name || "Your Business Name"}
              </h1>
              {company.gstin && (
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  GSTIN: {company.gstin}
                </p>
              )}
              {company.pan && (
                <p className="text-[10px] text-gray-500 font-medium">
                  PAN: {company.pan}
                </p>
              )}
              {company.addressLines.length > 0 && (
                <div className="mt-1 text-[11px] text-gray-600 leading-snug">
                  {company.addressLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              {(company.email || company.phone) && (
                <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-gray-500">
                  {company.email && <span>{company.email}</span>}
                  {company.phone && <span>{company.phone}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <h2 className="font-extrabold tracking-tight text-blue-700 leading-none" style={{ fontSize: "32px" }}>
              {invoice.documentType || "INVOICE"}
            </h2>
            <p className="mt-1.5 font-semibold text-gray-800" style={{ fontSize: "13px", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
              {invoice.invoiceNumber || "INV-001"}
            </p>
            {invoice.status && (
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                  statusClasses(invoice.status)
                }`}
              >
                {invoice.status}
              </span>
            )}
          </div>
        </header>

        {/* ── Accent Divider ─────────────────────────────────────── */}
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400 mb-5" />

        {/* ── Invoice Info Cards ─────────────────────────────────── */}
        <section className="grid grid-cols-4 gap-4 mb-5">
          <InfoCard label="Invoice Number" value={invoice.invoiceNumber || "—"} />
          <InfoCard label="Invoice Date" value={invoice.invoiceDate || "—"} />
          <InfoCard label="Due Date" value={invoice.dueDate || "—"} />
          <InfoCard label="Place of Supply" value={billTo.placeOfSupply || "—"} />
        </section>

        {/* ── Party Section ──────────────────────────────────────── */}
        <section className={`grid gap-5 mb-6 ${invoice.shipTo ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <PartyCard
            title="Bill From"
            name={company.name}
            addressLines={company.addressLines}
            gstin={company.gstin}
            email={company.email}
            phone={company.phone}
          />
          <PartyCard
            title="Bill To"
            name={billTo.name}
            addressLines={billTo.addressLines}
            gstin={billTo.gstin}
            email={billTo.email}
            phone={billTo.phone}
          />
          {invoice.shipTo && (
            <PartyCard
              title="Shipped To"
              name={invoice.shipTo.name}
              addressLines={invoice.shipTo.addressLines}
              gstin={invoice.shipTo.gstin}
              email={invoice.shipTo.email}
              phone={invoice.shipTo.phone}
            />
          )}
        </section>

        {invoice.transportDetails && (
          <section className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-gray-700 shadow-sm">
            {invoice.transportDetails.transporterName && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Transporter</p>
                <p className="font-semibold">{invoice.transportDetails.transporterName}</p>
              </div>
            )}
            {invoice.transportDetails.vehicleNumber && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Vehicle No</p>
                <p className="font-semibold font-mono">{invoice.transportDetails.vehicleNumber}</p>
              </div>
            )}
            {invoice.transportDetails.modeOfTransport && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Mode</p>
                <p className="font-semibold">{invoice.transportDetails.modeOfTransport}</p>
              </div>
            )}
            {invoice.transportDetails.vehicleType && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Vehicle Type</p>
                <p className="font-semibold">{invoice.transportDetails.vehicleType}</p>
              </div>
            )}
            {invoice.transportDetails.distance && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Distance</p>
                <p className="font-semibold">{invoice.transportDetails.distance} km</p>
              </div>
            )}
            {invoice.transportDetails.transportDocNo && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Doc No</p>
                <p className="font-semibold">{invoice.transportDetails.transportDocNo}</p>
              </div>
            )}
            {invoice.transportDetails.transactionType && (
              <div>
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Transaction Type</p>
                <p className="font-semibold">{invoice.transportDetails.transactionType}</p>
              </div>
            )}
            {invoice.transportDetails.shippedFromAddress && (
              <div className="col-span-2">
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Shipped From</p>
                <p className="font-semibold">{invoice.transportDetails.shippedFromAddress}</p>
              </div>
            )}
          </section>
        )}


        {/* ── Line Items Table ───────────────────────────────────── */}
        <section className="mb-5">
          <table className="w-full border-collapse" style={{ fontSize: "10.5px" }}>
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="text-left font-semibold py-3 px-3 w-[5%] rounded-tl-lg">#</th>
                <th className="text-left font-semibold py-3 px-3 w-[38%]">Description</th>
                {gstMode !== "none" && (
                  <th className="text-left font-semibold py-3 px-3 w-[12%]">HSN/SAC</th>
                )}
                <th className="text-center font-semibold py-3 px-3 w-[10%]">Qty</th>
                <th className="text-right font-semibold py-3 px-3 w-[12%]">Rate</th>
                {gstMode === "split" && (
                  <>
                    <th className="text-right font-semibold py-3 px-3 w-[8%]">CGST</th>
                    <th className="text-right font-semibold py-3 px-3 w-[8%]">SGST</th>
                  </>
                )}
                {gstMode === "single" && (
                  <th className="text-right font-semibold py-3 px-3 w-[8%]">GST</th>
                )}
                <th className="text-right font-semibold py-3 px-3 w-[15%] rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  <td className="py-3 px-3 text-gray-400 align-top">{idx + 1}</td>
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-gray-800" style={{ fontSize: "11px" }}>
                      {item.description}
                    </p>
                    {item.discountPercent ? (
                      <p className="text-[9px] text-blue-600 mt-0.5 font-medium">
                        {item.discountPercent}% discount applied
                      </p>
                    ) : null}
                  </td>
                  {gstMode !== "none" && (
                    <td className="py-3 px-3 align-top text-gray-500" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: "10px" }}>
                      {item.hsnSac || "—"}
                    </td>
                  )}
                  <td className="py-3 px-3 align-top text-center font-medium text-gray-700" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
                    {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                  </td>
                  <td className="py-3 px-3 align-top text-right font-medium text-gray-700" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
                    {formatCurrency(item.rate, invoice.currencySymbol)}
                  </td>
                  {gstMode === "split" && (
                    <>
                      <td className="py-3 px-3 align-top text-right text-gray-500" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: "10px" }}>
                        {item.cgstPercent ?? 0}%
                      </td>
                      <td className="py-3 px-3 align-top text-right text-gray-500" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: "10px" }}>
                        {item.sgstPercent ?? 0}%
                      </td>
                    </>
                  )}
                  {gstMode === "single" && (
                    <td className="py-3 px-3 align-top text-right text-gray-500" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: "10px" }}>
                      {item.gstPercent ?? 0}%
                    </td>
                  )}
                  <td className="py-3 px-3 align-top text-right font-bold text-gray-800" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", fontSize: "11px" }}>
                    {formatCurrency(item.lineTotal, invoice.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Totals + Amount in Words ─────────────────────────────── */}
        <section className="grid grid-cols-5 gap-6 mb-5">
          <div className="col-span-3">
            {totals.grandTotal > 0 && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4">
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1.5">
                  Amount in Words
                </p>
                <p className="text-[11px] text-gray-700 leading-relaxed font-medium italic">
                  {numberToWords(totals.grandTotal)}
                </p>
              </div>
            )}
            {invoice.notes && (
              <div className="mt-3">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Notes
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 space-y-2">
                <TotalsRow label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} strong={false} />
                {totals.totalDiscount > 0 && (
                  <TotalsRow label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} strong={false} negative />
                )}
                {gstMode === "split" && (
                  <>
                    {totals.totalCgst > 0 && <TotalsRow label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} strong={false} />}
                    {totals.totalSgst > 0 && <TotalsRow label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} strong={false} />}
                    {totals.totalIgst > 0 && <TotalsRow label="IGST" value={totals.totalIgst} symbol={invoice.currencySymbol} strong={false} />}
                  </>
                )}
                {gstMode === "single" && totals.totalGst > 0 && (
                  <TotalsRow label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} strong={false} />
                )}
                {totals.shippingCharge > 0 && (
                  <TotalsRow label="Shipping" value={totals.shippingCharge} symbol={invoice.currencySymbol} strong={false} />
                )}
              </div>
              <div className="bg-blue-700 px-5 py-3.5 flex justify-between items-center">
                <span className="font-bold text-white" style={{ fontSize: "15px" }}>Total Amount</span>
                <span
                  className="font-bold text-white"
                  style={{ fontSize: "20px", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
                >
                  {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
                </span>
              </div>
              {totals.amountPaid > 0 && (
                <div className="px-5 py-2.5 border-t border-gray-200 space-y-1.5 bg-white">
                  <TotalsRow label="Amount Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} strong={false} negative />
                  <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-300">
                    <span className="font-bold text-gray-800" style={{ fontSize: "13px" }}>Balance Due</span>
                    <span className="font-bold text-blue-700" style={{ fontSize: "15px", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
                      {formatCurrency(totals.balanceDue, invoice.currencySymbol)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {invoice.reverseCharge && (
          <p className="text-[9px] text-gray-400 italic mb-3">
            * Tax payable on reverse charge basis.
          </p>
        )}

        {/* ── Terms & Signature ───────────────────────────────────── */}
        <footer className="mt-auto pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-6 items-end">
            <div>
              {invoice.termsAndConditions && (
                <div className="mb-3">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Terms & Conditions
                  </p>
                  <p className="text-[10.5px] text-gray-600 leading-relaxed">
                    {invoice.termsAndConditions}
                  </p>
                </div>
              )}
              {invoice.bankDetails && (
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Payment Details
                  </p>
                  <div className="text-[10px] text-gray-600 grid grid-cols-2 gap-x-4 gap-y-0.5" style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
                    {invoice.bankDetails.accountName && <span>{invoice.bankDetails.accountName}</span>}
                    {invoice.bankDetails.bankName && <span>{invoice.bankDetails.bankName}{invoice.bankDetails.branch ? `, ${invoice.bankDetails.branch}` : ""}</span>}
                    {invoice.bankDetails.accountNumber && <span>A/C: {invoice.bankDetails.accountNumber}</span>}
                    {invoice.bankDetails.ifsc && <span>IFSC: {invoice.bankDetails.ifsc}</span>}
                    {invoice.bankDetails.upiId && <span>UPI: {invoice.bankDetails.upiId}</span>}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block text-center min-w-[176px]">
                {company.signatureUrl ? (
                  <img src={company.signatureUrl} alt="Signature" className="h-12 object-contain mx-auto mb-1" />
                ) : (
                  <div className="border-b-2 border-gray-400 w-44 mb-1.5" style={{ height: "36px" }} />
                )}
                <p className="text-[10px] text-gray-500 font-medium border-t border-gray-300 pt-1">Authorized Signatory</p>
                <p className="text-[11px] text-gray-700 font-semibold mt-0.5">{company.name || "Business Name"}</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-5 pt-3 border-t border-gray-100">
            <p className="text-[9px] text-gray-400">
              Thank you for your business! · Generated by Turnivo
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────

function statusClasses(status: string) {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Overdue":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Partially Paid":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Draft":
      return "bg-gray-100 text-gray-600 border border-gray-200";
    default:
      return "bg-blue-100 text-blue-700 border border-blue-200";
  }
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-lg px-3.5 py-2.5">
      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-[11px] font-semibold text-gray-800 truncate">
        {value}
      </p>
    </div>
  );
}

function PartyCard({
  title,
  name,
  addressLines,
  gstin,
  email,
  phone,
}: {
  title: string;
  name: string;
  addressLines: string[];
  gstin?: string;
  email?: string;
  phone?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className="font-bold text-gray-900" style={{ fontSize: "13px" }}>
        {name || "—"}
      </p>
      {gstin && (
        <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
          GSTIN: {gstin}
        </p>
      )}
      {addressLines.length > 0 && (
        <div className="mt-1 text-[11px] text-gray-600 leading-snug">
          {addressLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      {(email || phone) && (
        <div className="mt-1.5 text-[10px] text-gray-500 space-y-0.5">
          {email && <p>{email}</p>}
          {phone && <p>{phone}</p>}
        </div>
      )}
    </div>
  );
}

function TotalsRow({
  label,
  value,
  symbol,
  strong,
  negative,
}: {
  label: string;
  value: number;
  symbol: string;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-gray-600">{label}</span>
      <span
        className={`${strong ? "font-bold" : "font-medium"} ${negative ? "text-red-600" : "text-gray-800"}`}
        style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
      >
        {negative ? "−" : ""}{formatCurrency(Math.abs(value), symbol)}
      </span>
    </div>
  );
}
