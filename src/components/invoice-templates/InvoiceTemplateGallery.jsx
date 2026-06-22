import React, { useState } from "react";

/* ============================================================================
   SHARED DATA LAYER — same contract as data/invoiceTypes.ts in the file pack
   ============================================================================ */

function computeInvoiceTotals(invoice) {
  const { items, gstMode, globalDiscountPercent = 0, shippingCharge = 0, amountPaid = 0 } = invoice;
  let subTotal = 0, totalDiscount = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;

  const computedItems = items.map((item) => {
    const gross = item.quantity * item.rate;
    const discountAmt = gross * ((item.discountPercent ?? 0) / 100);
    const taxableValue = gross - discountAmt;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    if (gstMode === "single") {
      const pct = item.gstPercent ?? 0;
      cgstAmount = (taxableValue * pct) / 100 / 2;
      sgstAmount = (taxableValue * pct) / 100 / 2;
    } else if (gstMode === "split") {
      cgstAmount = (taxableValue * (item.cgstPercent ?? 0)) / 100;
      sgstAmount = (taxableValue * (item.sgstPercent ?? 0)) / 100;
      igstAmount = (taxableValue * (item.igstPercent ?? 0)) / 100;
    }

    const gstAmount = cgstAmount + sgstAmount + igstAmount;
    const lineTotal = taxableValue + gstAmount;

    subTotal += gross;
    totalDiscount += discountAmt;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    return { ...item, taxableValue, cgstAmount, sgstAmount, igstAmount, gstAmount, lineTotal };
  });

  const afterLineDiscount = subTotal - totalDiscount;
  const globalDiscountAmt = afterLineDiscount * (globalDiscountPercent / 100);
  const totalGst = totalCgst + totalSgst + totalIgst;
  const grandTotal = afterLineDiscount - globalDiscountAmt + totalGst + shippingCharge;
  const balanceDue = grandTotal - amountPaid;

  return {
    items: computedItems, subTotal, totalDiscount: totalDiscount + globalDiscountAmt,
    totalCgst, totalSgst, totalIgst, totalGst, shippingCharge, grandTotal, amountPaid, balanceDue,
  };
}

function formatCurrency(amount, symbol) {
  const fixed = amount.toFixed(2);
  const [whole, decimal] = fixed.split(".");
  if (symbol === "₹") {
    const lastThree = whole.slice(-3);
    const otherNumbers = whole.slice(0, -3);
    const formatted = otherNumbers !== ""
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
    return `${symbol}${formatted}.${decimal}`;
  }
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${formatted}.${decimal}`;
}

function numberToWords(num, currencyName = "Rupees") {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }
  const whole = Math.floor(num);
  return `${currencyName} ${inWords(whole) || "Zero"} Only`;
}

/* ============================================================================
   SAMPLE DATA
   ============================================================================ */

const baseInvoice = {
  invoiceNumber: "INV-2026-0143",
  invoiceDate: "21 Jun 2026",
  dueDate: "05 Jul 2026",
  status: "Unpaid",
  currencySymbol: "₹",
  company: {
    name: "Northwind Design Studio",
    addressLines: ["402, Sunrise Business Park", "S.G. Highway, Ahmedabad, Gujarat – 380015"],
    gstin: "24AAAPL1234C1ZV",
    email: "billing@northwindstudio.in",
    phone: "+91 98765 43210",
    website: "www.northwindstudio.in",
  },
  billTo: {
    name: "Verve Retail Pvt. Ltd.",
    addressLines: ["14th Floor, Cosmos Tower", "Vastrapur, Ahmedabad, Gujarat – 380054"],
    gstin: "24AABCV5678D1ZP",
    email: "accounts@ververetail.com",
    placeOfSupply: "24-Gujarat",
  },
  notes: "Thank you for your business. Files will be delivered in editable + production-ready formats.",
  termsAndConditions: "Payment due within 14 days of invoice date. Late payments may attract 1.5% monthly interest.",
  bankDetails: {
    accountName: "Northwind Design Studio",
    accountNumber: "50100123456789",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "S.G. Highway, Ahmedabad",
    upiId: "northwind@hdfcbank",
  },
  amountPaid: 0,
};

const itemsSplit = [
  { id: "1", description: "Brand Identity Design — logo, palette, typography system", hsnSac: "998314", quantity: 1, unit: "project", rate: 45000, cgstPercent: 9, sgstPercent: 9 },
  { id: "2", description: "Website UI/UX Design (12 screens)", hsnSac: "998314", quantity: 12, unit: "screens", rate: 3500, cgstPercent: 9, sgstPercent: 9 },
  { id: "3", description: "Stationery & Collateral Design (cards, letterhead)", hsnSac: "998314", quantity: 1, unit: "set", rate: 8000, cgstPercent: 9, sgstPercent: 9, discountPercent: 10 },
];

function buildInvoice(gstMode) {
  if (gstMode === "split") {
    return { ...baseInvoice, gstMode, items: itemsSplit };
  }
  if (gstMode === "single") {
    return {
      ...baseInvoice, gstMode, status: "Paid", amountPaid: 56700,
      items: itemsSplit.map((it) => ({ ...it, gstPercent: (it.cgstPercent ?? 0) + (it.sgstPercent ?? 0), cgstPercent: undefined, sgstPercent: undefined })),
    };
  }
  return {
    ...baseInvoice, gstMode,
    company: { ...baseInvoice.company, gstin: undefined },
    items: itemsSplit.map((it) => ({ ...it, cgstPercent: undefined, sgstPercent: undefined, gstPercent: undefined })),
  };
}

/* ============================================================================
   SMALL SHARED PRESENTATIONAL HELPERS
   ============================================================================ */

function Row({ label, value, symbol, className = "text-slate-600" }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{formatCurrency(value, symbol)}</span>
    </div>
  );
}

/* ============================================================================
   TEMPLATE 1 — LEDGER (Zoho-inspired)
   ============================================================================ */

function LedgerTemplate({ invoice }) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const statusClasses = {
    Paid: "bg-emerald-100 text-emerald-700",
    Overdue: "bg-red-100 text-red-700",
    "Partially Paid": "bg-amber-100 text-amber-700",
    Draft: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="invoice-page bg-white text-slate-900 mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex flex-col h-full px-12 py-10">
        <header className="flex items-start justify-between pb-6 border-b-[3px] border-blue-700">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xl">{company.name.charAt(0)}</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{company.name}</h1>
              {company.addressLines.map((line, i) => <p key={i} className="text-xs text-slate-500 leading-snug">{line}</p>)}
              <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-slate-500">
                {company.email && <span>{company.email}</span>}
                {company.phone && <span>{company.phone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-700">INVOICE</h2>
            <p className="text-sm font-semibold text-slate-700 mt-1 font-mono">{invoice.invoiceNumber}</p>
            {invoice.status && <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusClasses[invoice.status] || "bg-blue-100 text-blue-700"}`}>{invoice.status}</span>}
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 py-5 text-sm border-b border-slate-200">
          <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Invoice Date</p><p className="text-slate-800">{invoice.invoiceDate}</p></div>
          <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Due Date</p><p className="text-slate-800">{invoice.dueDate || "—"}</p></div>
          <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">GSTIN</p><p className="text-slate-800 font-mono text-xs">{company.gstin || "—"}</p></div>
          <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Place of Supply</p><p className="text-slate-800">{billTo.placeOfSupply || "—"}</p></div>
        </section>

        <section className="grid grid-cols-2 gap-8 py-6">
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Bill To</p>
            <p className="font-semibold text-slate-900">{billTo.name}</p>
            {billTo.addressLines.map((l, i) => <p key={i} className="text-xs text-slate-500 leading-snug">{l}</p>)}
            {billTo.gstin && <p className="text-xs text-slate-500 font-mono mt-1">GSTIN: {billTo.gstin}</p>}
          </div>
        </section>

        <section className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white text-xs uppercase tracking-wide">
                <th className="text-left font-semibold py-2.5 px-3 rounded-l">#</th>
                <th className="text-left font-semibold py-2.5 px-3">Item & Description</th>
                {gstMode !== "none" && <th className="text-left font-semibold py-2.5 px-3">HSN/SAC</th>}
                <th className="text-right font-semibold py-2.5 px-3">Qty</th>
                <th className="text-right font-semibold py-2.5 px-3">Rate</th>
                {gstMode === "split" && <><th className="text-right font-semibold py-2.5 px-3">CGST</th><th className="text-right font-semibold py-2.5 px-3">SGST</th></>}
                {gstMode === "single" && <th className="text-right font-semibold py-2.5 px-3">GST</th>}
                <th className="text-right font-semibold py-2.5 px-3 rounded-r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-3 px-3 text-slate-400 align-top">{idx + 1}</td>
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-slate-800">{item.description}</p>
                    {item.discountPercent ? <p className="text-xs text-blue-600 mt-0.5">{item.discountPercent}% discount applied</p> : null}
                  </td>
                  {gstMode !== "none" && <td className="py-3 px-3 align-top text-slate-500 font-mono text-xs">{item.hsnSac || "—"}</td>}
                  <td className="py-3 px-3 align-top text-right font-mono">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</td>
                  <td className="py-3 px-3 align-top text-right font-mono">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                  {gstMode === "split" && <><td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">{item.cgstPercent ?? 0}%</td><td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">{item.sgstPercent ?? 0}%</td></>}
                  {gstMode === "single" && <td className="py-3 px-3 align-top text-right font-mono text-xs text-slate-500">{item.gstPercent ?? 0}%</td>}
                  <td className="py-3 px-3 align-top text-right font-mono font-semibold">{formatCurrency(item.lineTotal, invoice.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid grid-cols-5 gap-8 pt-6 mt-2 border-t border-slate-200">
          <div className="col-span-3 space-y-4">
            {invoice.notes && <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p><p className="text-xs text-slate-600 leading-relaxed">{invoice.notes}</p></div>}
            {invoice.bankDetails && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Payment Details</p>
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono">
                  <span>A/C Name: {invoice.bankDetails.accountName}</span>
                  <span>A/C No: {invoice.bankDetails.accountNumber}</span>
                  <span>IFSC: {invoice.bankDetails.ifsc}</span>
                  <span>UPI: {invoice.bankDetails.upiId}</span>
                </div>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} />
              {totals.totalDiscount > 0 && <Row label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} />}
              {gstMode === "split" && <><Row label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} /><Row label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} /></>}
              {gstMode === "single" && <Row label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} />}
              <div className="border-t border-slate-300 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-blue-700 font-mono">{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
              </div>
              {totals.amountPaid > 0 && (
                <>
                  <Row label="Amount Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} />
                  <div className="flex justify-between items-baseline pt-1"><span className="font-bold text-slate-900">Balance Due</span><span className="font-bold text-blue-700 font-mono">{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span></div>
                </>
              )}
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-8 flex items-end justify-between">
          <div>
            {invoice.termsAndConditions && <><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Terms & Conditions</p><p className="text-[11px] text-slate-500 leading-relaxed max-w-md">{invoice.termsAndConditions}</p></>}
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

/* ============================================================================
   TEMPLATE 2 — CLASSIC BOOKS (QuickBooks-inspired)
   ============================================================================ */

function ClassicBooksTemplate({ invoice }) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const green = "#1B4D3E";

  return (
    <div className="invoice-page bg-white text-stone-900 mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex flex-col h-full px-12 py-10">
        <header className="flex items-start justify-between pb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex items-center justify-center text-white text-2xl" style={{ backgroundColor: green, fontFamily: "Georgia, serif" }}>{company.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "Georgia, serif", color: green }}>{company.name}</h1>
              <p className="text-xs text-stone-500 mt-0.5">{company.addressLines.join(" · ")}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "Georgia, serif", color: green }}>Invoice</h2>
            {invoice.status && <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border" style={{ borderColor: green, color: green }}>{invoice.status}</span>}
          </div>
        </header>

        <div className="h-[2px]" style={{ backgroundColor: green }} />
        <div className="h-px bg-stone-300 mt-1 mb-6" />

        <section className="grid grid-cols-2 gap-10 mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: green }}>Billed To</p>
              <p className="font-semibold text-stone-900">{billTo.name}</p>
              <p className="text-xs text-stone-500 leading-snug">{billTo.addressLines.join(", ")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-dotted border-stone-300 pb-1"><span className="text-stone-500">Invoice No.</span><span className="font-medium text-stone-800">{invoice.invoiceNumber}</span></div>
            <div className="flex justify-between border-b border-dotted border-stone-300 pb-1"><span className="text-stone-500">Invoice Date</span><span className="font-medium text-stone-800">{invoice.invoiceDate}</span></div>
            <div className="flex justify-between border-b border-dotted border-stone-300 pb-1"><span className="text-stone-500">Due Date</span><span className="font-medium text-stone-800">{invoice.dueDate || "—"}</span></div>
            {company.gstin && <div className="flex justify-between border-b border-dotted border-stone-300 pb-1"><span className="text-stone-500">Seller GSTIN</span><span className="font-medium text-stone-800">{company.gstin}</span></div>}
            {billTo.gstin && gstMode !== "none" && <div className="flex justify-between border-b border-dotted border-stone-300 pb-1"><span className="text-stone-500">Buyer GSTIN</span><span className="font-medium text-stone-800">{billTo.gstin}</span></div>}
          </div>
        </section>

        <section className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-stone-600" style={{ borderBottom: `2px solid ${green}` }}>
                <th className="text-left font-semibold py-2 pr-2">Description</th>
                {gstMode !== "none" && <th className="text-left font-semibold py-2 px-2">HSN/SAC</th>}
                <th className="text-right font-semibold py-2 px-2">Qty</th>
                <th className="text-right font-semibold py-2 px-2">Rate</th>
                {gstMode === "split" && <><th className="text-right font-semibold py-2 px-2">CGST</th><th className="text-right font-semibold py-2 px-2">SGST</th></>}
                {gstMode === "single" && <th className="text-right font-semibold py-2 px-2">GST</th>}
                <th className="text-right font-semibold py-2 pl-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item) => (
                <tr key={item.id} className="border-b border-stone-200">
                  <td className="py-3 pr-2 align-top">
                    <p className="text-stone-800">{item.description}</p>
                    {item.discountPercent ? <p className="text-xs text-stone-400 mt-0.5">Less {item.discountPercent}% discount</p> : null}
                  </td>
                  {gstMode !== "none" && <td className="py-3 px-2 align-top text-stone-500 text-xs">{item.hsnSac || "—"}</td>}
                  <td className="py-3 px-2 align-top text-right">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</td>
                  <td className="py-3 px-2 align-top text-right">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                  {gstMode === "split" && <><td className="py-3 px-2 align-top text-right text-xs text-stone-500">{item.cgstPercent ?? 0}%</td><td className="py-3 px-2 align-top text-right text-xs text-stone-500">{item.sgstPercent ?? 0}%</td></>}
                  {gstMode === "single" && <td className="py-3 px-2 align-top text-right text-xs text-stone-500">{item.gstPercent ?? 0}%</td>}
                  <td className="py-3 pl-2 align-top text-right font-medium">{formatCurrency(item.lineTotal, invoice.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex justify-end mt-4">
          <div className="w-72 space-y-1.5 text-sm">
            <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} />
            {totals.totalDiscount > 0 && <Row label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} />}
            {gstMode === "split" && <><Row label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} /><Row label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} /></>}
            {gstMode === "single" && <Row label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} />}
            <div className="flex justify-between items-baseline pt-2 mt-1" style={{ borderTop: `2px solid ${green}` }}>
              <span className="font-bold text-base" style={{ fontFamily: "Georgia, serif", color: green }}>Total Due</span>
              <span className="font-bold text-lg" style={{ color: green }}>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} />
                <div className="flex justify-between items-baseline text-stone-800 font-semibold pt-1"><span>Balance</span><span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span></div>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-10 mt-8 pt-6 border-t border-stone-200 text-xs text-stone-500">
          <div className="space-y-3">
            {invoice.notes && <div><p className="font-semibold text-stone-700 mb-1">Notes</p><p className="leading-relaxed">{invoice.notes}</p></div>}
            {invoice.termsAndConditions && <div><p className="font-semibold text-stone-700 mb-1">Terms</p><p className="leading-relaxed">{invoice.termsAndConditions}</p></div>}
          </div>
          {invoice.bankDetails && (
            <div>
              <p className="font-semibold text-stone-700 mb-1">Remit Payment To</p>
              <div className="space-y-0.5">
                <p>{invoice.bankDetails.accountName}</p>
                <p>{invoice.bankDetails.bankName}, {invoice.bankDetails.branch}</p>
                <p>A/C: {invoice.bankDetails.accountNumber}</p>
                <p>IFSC: {invoice.bankDetails.ifsc}</p>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-auto pt-8 text-center text-[10px] text-stone-400">{company.name} · {company.website}</footer>
      </div>
    </div>
  );
}

/* ============================================================================
   TEMPLATE 3 — STUDIO (FreshBooks-inspired)
   ============================================================================ */

function StudioTemplate({ invoice }) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const coral = "#E8633C";
  const cream = "#FBF7F2";
  const gridCols = gstMode === "split" ? "1fr 60px 70px 60px 60px 90px" : gstMode === "single" ? "1fr 60px 70px 60px 90px" : "1fr 60px 70px 90px";

  return (
    <div className="invoice-page mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", backgroundColor: cream, color: "#2A2622" }}>
      <div className="flex flex-col h-full px-12 py-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: coral }}>{company.name.charAt(0)}</div>
            <div><p className="font-bold text-lg">{company.name}</p><p className="text-xs text-stone-500">{company.email}</p></div>
          </div>
          <div className="px-5 py-2.5 rounded-2xl text-white text-right" style={{ backgroundColor: coral }}>
            <p className="text-[10px] uppercase tracking-widest opacity-90">Invoice</p>
            <p className="font-bold">{invoice.invoiceNumber}</p>
          </div>
        </header>

        <section className="bg-white rounded-3xl p-7 mb-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400 mb-1">Amount Due</p>
            <p className="text-4xl font-extrabold" style={{ color: coral }}>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</p>
            {invoice.dueDate && <p className="text-xs text-stone-500 mt-1">Due {invoice.dueDate}</p>}
          </div>
          {invoice.status && (
            <span className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full" style={{ backgroundColor: invoice.status === "Paid" ? "#DCF5E8" : "#FDEAE2", color: invoice.status === "Paid" ? "#1C7C4F" : coral }}>{invoice.status}</span>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">From</p>
            <p className="font-semibold">{company.name}</p>
            <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{company.addressLines.join(", ")}</p>
            {company.gstin && <p className="text-xs text-stone-500 mt-1">GSTIN {company.gstin}</p>}
          </div>
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Billed To</p>
            <p className="font-semibold">{billTo.name}</p>
            <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{billTo.addressLines.join(", ")}</p>
            {billTo.gstin && gstMode !== "none" && <p className="text-xs text-stone-500 mt-1">GSTIN {billTo.gstin}</p>}
          </div>
        </section>

        <section className="bg-white rounded-2xl overflow-hidden flex-1">
          <div className="grid text-[10px] font-bold uppercase tracking-widest text-stone-400 px-5 py-3" style={{ gridTemplateColumns: gridCols }}>
            <span>Item</span><span className="text-right">Qty</span><span className="text-right">Rate</span>
            {gstMode === "split" && <><span className="text-right">CGST</span><span className="text-right">SGST</span></>}
            {gstMode === "single" && <span className="text-right">GST</span>}
            <span className="text-right">Amount</span>
          </div>
          {totals.items.map((item) => (
            <div key={item.id} className="grid items-start px-5 py-4 text-sm" style={{ borderTop: "1px solid #F2EDE6", gridTemplateColumns: gridCols }}>
              <div><p className="font-medium">{item.description}</p>{item.hsnSac && <p className="text-[11px] text-stone-400 mt-0.5">HSN/SAC {item.hsnSac}</p>}</div>
              <span className="text-right text-stone-600">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</span>
              <span className="text-right text-stone-600">{formatCurrency(item.rate, invoice.currencySymbol)}</span>
              {gstMode === "split" && <><span className="text-right text-stone-500 text-xs">{item.cgstPercent ?? 0}%</span><span className="text-right text-stone-500 text-xs">{item.sgstPercent ?? 0}%</span></>}
              {gstMode === "single" && <span className="text-right text-stone-500 text-xs">{item.gstPercent ?? 0}%</span>}
              <span className="text-right font-semibold">{formatCurrency(item.lineTotal, invoice.currencySymbol)}</span>
            </div>
          ))}
        </section>

        <section className="flex justify-end mt-5">
          <div className="bg-white rounded-2xl p-5 w-80 space-y-2 text-sm">
            <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} className="text-stone-500" />
            {totals.totalDiscount > 0 && <Row label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} className="text-stone-500" />}
            {gstMode === "split" && <><Row label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} className="text-stone-500" /><Row label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} className="text-stone-500" /></>}
            {gstMode === "single" && <Row label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} className="text-stone-500" />}
            <div className="border-t pt-2 mt-1 flex justify-between items-baseline" style={{ borderColor: "#F2EDE6" }}>
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-lg" style={{ color: coral }}>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.amountPaid > 0 && <Row label="Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} className="text-stone-500" />}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 mt-6">
          {invoice.notes && (
            <div className="bg-white rounded-2xl p-5 text-xs text-stone-500 leading-relaxed">
              <p className="font-bold text-stone-700 mb-1 text-[10px] uppercase tracking-widest">A note for you</p>
              {invoice.notes}
            </div>
          )}
          {invoice.bankDetails && (
            <div className="bg-white rounded-2xl p-5 text-xs text-stone-500 leading-relaxed">
              <p className="font-bold text-stone-700 mb-1 text-[10px] uppercase tracking-widest">How to pay</p>
              <p>UPI: {invoice.bankDetails.upiId}</p>
              <p>A/C: {invoice.bankDetails.accountNumber}</p>
              <p>IFSC: {invoice.bankDetails.ifsc}</p>
            </div>
          )}
        </section>

        <footer className="mt-auto pt-8 text-center text-xs text-stone-400">Thanks for working with {company.name} 🙂</footer>
      </div>
    </div>
  );
}

/* ============================================================================
   TEMPLATE 4 — VYAPAR DESI (Vyapar-inspired)
   ============================================================================ */

function VyaparDesiTemplate({ invoice }) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const maroon = "#8B1E3F";
  const saffron = "#E08B2C";

  return (
    <div className="invoice-page bg-white text-stone-900 mx-auto" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Noto Sans', system-ui, sans-serif", fontSize: "12px" }}>
      <div className="flex flex-col h-full m-4" style={{ border: `1.5px solid ${maroon}` }}>
        <header className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1.5px solid ${maroon}`, backgroundColor: "#FDF6EC" }}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center text-white font-bold rounded" style={{ backgroundColor: maroon }}>{company.name.charAt(0)}</div>
            <div>
              <p className="font-bold text-base" style={{ color: maroon }}>{company.name}</p>
              <p className="text-[10px] text-stone-600 leading-tight">{company.addressLines.join(", ")}</p>
              <p className="text-[10px] text-stone-600">{company.phone} | {company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: saffron }}>Tax Invoice</h2>
            {company.gstin && <p className="text-[10px] font-semibold text-stone-700">GSTIN: {company.gstin}</p>}
          </div>
        </header>

        <div className="grid grid-cols-4 text-[11px]" style={{ borderBottom: `1px solid ${maroon}` }}>
          <div className="px-3 py-2 border-r" style={{ borderColor: maroon }}><p className="text-[9px] uppercase tracking-wide text-stone-400">Invoice #</p><p className="font-semibold text-stone-800">{invoice.invoiceNumber}</p></div>
          <div className="px-3 py-2 border-r" style={{ borderColor: maroon }}><p className="text-[9px] uppercase tracking-wide text-stone-400">Invoice Date</p><p className="font-semibold text-stone-800">{invoice.invoiceDate}</p></div>
          <div className="px-3 py-2 border-r" style={{ borderColor: maroon }}><p className="text-[9px] uppercase tracking-wide text-stone-400">Due Date</p><p className="font-semibold text-stone-800">{invoice.dueDate || "—"}</p></div>
          <div className="px-3 py-2"><p className="text-[9px] uppercase tracking-wide text-stone-400">Place of Supply</p><p className="font-semibold text-stone-800">{billTo.placeOfSupply || "—"}</p></div>
        </div>

        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${maroon}` }}>
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: maroon }}>Bill To</p>
          <p className="font-semibold">{billTo.name}</p>
          <p className="text-[11px] text-stone-600">{billTo.addressLines.join(", ")}</p>
          {billTo.gstin && gstMode !== "none" && <p className="text-[11px] text-stone-600">GSTIN: {billTo.gstin}</p>}
        </div>

        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: maroon, color: "white" }}>
              <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">#</th>
              <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">Item Description</th>
              {gstMode !== "none" && <th className="text-left font-semibold py-1.5 px-2 border-r border-white/20">HSN</th>}
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">Qty</th>
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">Rate</th>
              <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">Taxable Val</th>
              {gstMode === "split" && <><th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">CGST</th><th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">SGST</th></>}
              {gstMode === "single" && <th className="text-right font-semibold py-1.5 px-2 border-r border-white/20">GST</th>}
              <th className="text-right font-semibold py-1.5 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #E5DDD0" }}>
                <td className="py-1.5 px-2 border-r border-stone-200 text-stone-500">{idx + 1}</td>
                <td className="py-1.5 px-2 border-r border-stone-200">{item.description}</td>
                {gstMode !== "none" && <td className="py-1.5 px-2 border-r border-stone-200 text-stone-500">{item.hsnSac || "—"}</td>}
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</td>
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">{formatCurrency(item.rate, invoice.currencySymbol)}</td>
                <td className="py-1.5 px-2 border-r border-stone-200 text-right">{formatCurrency(item.taxableValue, invoice.currencySymbol)}</td>
                {gstMode === "split" && (
                  <>
                    <td className="py-1.5 px-2 border-r border-stone-200 text-right">{item.cgstPercent ?? 0}%<br /><span className="text-stone-400">{formatCurrency(item.cgstAmount, invoice.currencySymbol)}</span></td>
                    <td className="py-1.5 px-2 border-r border-stone-200 text-right">{item.sgstPercent ?? 0}%<br /><span className="text-stone-400">{formatCurrency(item.sgstAmount, invoice.currencySymbol)}</span></td>
                  </>
                )}
                {gstMode === "single" && <td className="py-1.5 px-2 border-r border-stone-200 text-right">{item.gstPercent ?? 0}%<br /><span className="text-stone-400">{formatCurrency(item.gstAmount, invoice.currencySymbol)}</span></td>}
                <td className="py-1.5 px-2 text-right font-semibold">{formatCurrency(item.lineTotal, invoice.currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-1" style={{ borderTop: `1px solid ${maroon}` }}>
          <div className="flex-1 px-5 py-3 text-[11px] space-y-2">
            <div>
              <p className="font-bold" style={{ color: maroon }}>Amount in Words</p>
              <p className="text-stone-600 italic">{numberToWords(totals.grandTotal, invoice.currencySymbol === "₹" ? "Rupees" : "")}</p>
            </div>
            {invoice.bankDetails && (
              <div>
                <p className="font-bold" style={{ color: maroon }}>Bank Details</p>
                <p className="text-stone-600">{invoice.bankDetails.bankName}, A/C: {invoice.bankDetails.accountNumber}, IFSC: {invoice.bankDetails.ifsc}</p>
                <p className="text-stone-600">UPI: {invoice.bankDetails.upiId}</p>
              </div>
            )}
            {invoice.termsAndConditions && <div><p className="font-bold" style={{ color: maroon }}>Terms & Conditions</p><p className="text-stone-600 leading-snug">{invoice.termsAndConditions}</p></div>}
          </div>
          <div className="w-64 px-5 py-3 space-y-1.5 text-[11px]" style={{ borderLeft: `1px solid ${maroon}`, backgroundColor: "#FDF6EC" }}>
            <Row label="Taxable Amount" value={totals.subTotal - totals.totalDiscount} symbol={invoice.currencySymbol} className="text-stone-600" />
            {gstMode === "split" && <><Row label="Total CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} className="text-stone-600" /><Row label="Total SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} className="text-stone-600" /></>}
            {gstMode === "single" && <Row label="Total GST" value={totals.totalGst} symbol={invoice.currencySymbol} className="text-stone-600" />}
            <div className="flex justify-between items-baseline pt-2 mt-1 font-bold" style={{ borderTop: `1.5px solid ${maroon}`, color: maroon }}>
              <span>Grand Total</span><span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span>
            </div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Received" value={-totals.amountPaid} symbol={invoice.currencySymbol} className="text-stone-600" />
                <div className="flex justify-between items-baseline font-bold" style={{ color: saffron }}><span>Balance Due</span><span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span></div>
              </>
            )}
          </div>
        </div>

        <footer className="flex justify-between items-end px-5 py-4 mt-auto" style={{ borderTop: `1.5px solid ${maroon}` }}>
          <p className="text-[10px] text-stone-400">This is a computer-generated invoice.</p>
          <div className="text-center">
            <p className="text-[11px] font-semibold mb-8" style={{ color: maroon }}>For {company.name}</p>
            <p className="text-[10px] text-stone-500 border-t border-stone-300 pt-1">Authorized Signatory</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================================
   TEMPLATE 5 — MINIMAL MONO
   ============================================================================ */

function MinimalMonoTemplate({ invoice }) {
  const totals = computeInvoiceTotals(invoice);
  const { company, billTo, gstMode } = invoice;
  const gridCols = gstMode === "split" ? "1fr 70px 90px 60px 60px 100px" : gstMode === "single" ? "1fr 70px 90px 60px 100px" : "1fr 70px 90px 100px";
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div className="invoice-page bg-white text-black mx-auto relative" style={{ width: "210mm", minHeight: "297mm", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {invoice.status && (
        <div className="absolute top-16 right-16 border-2 border-black px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]" style={{ transform: "rotate(8deg)", opacity: 0.85 }}>
          {invoice.status}
        </div>
      )}
      <div className="flex flex-col h-full px-14 py-12">
        <header className="flex items-start justify-between pb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border-2 border-black flex items-center justify-center font-bold">{company.name.charAt(0)}</div>
            <p className="font-bold tracking-tight text-lg">{company.name}</p>
          </div>
          <p className="text-xs tracking-widest uppercase text-black/50" style={mono}>Invoice</p>
        </header>

        <div className="h-px bg-black w-full" />

        <section className="grid grid-cols-3 gap-8 py-8 text-xs">
          <div>
            <p className="text-black/40 uppercase tracking-widest mb-1.5">From</p>
            <p className="font-medium">{company.name}</p>
            {company.addressLines.map((l, i) => <p key={i} className="text-black/60">{l}</p>)}
            {company.gstin && <p className="text-black/60 mt-1" style={mono}>GSTIN {company.gstin}</p>}
          </div>
          <div>
            <p className="text-black/40 uppercase tracking-widest mb-1.5">Bill To</p>
            <p className="font-medium">{billTo.name}</p>
            {billTo.addressLines.map((l, i) => <p key={i} className="text-black/60">{l}</p>)}
            {billTo.gstin && gstMode !== "none" && <p className="text-black/60 mt-1" style={mono}>GSTIN {billTo.gstin}</p>}
          </div>
          <div style={mono}>
            <div className="flex justify-between gap-4 text-xs py-0.5"><span className="text-black/40">No.</span><span>{invoice.invoiceNumber}</span></div>
            <div className="flex justify-between gap-4 text-xs py-0.5"><span className="text-black/40">Date</span><span>{invoice.invoiceDate}</span></div>
            <div className="flex justify-between gap-4 text-xs py-0.5"><span className="text-black/40">Due</span><span>{invoice.dueDate || "—"}</span></div>
            {billTo.placeOfSupply && <div className="flex justify-between gap-4 text-xs py-0.5"><span className="text-black/40">POS</span><span>{billTo.placeOfSupply}</span></div>}
          </div>
        </section>

        <div className="h-px bg-black w-full" />

        <section className="flex-1">
          <div className="grid text-[10px] uppercase tracking-widest text-black/40 py-3" style={{ gridTemplateColumns: gridCols }}>
            <span>Description</span><span className="text-right">Qty</span><span className="text-right">Rate</span>
            {gstMode === "split" && <><span className="text-right">CGST</span><span className="text-right">SGST</span></>}
            {gstMode === "single" && <span className="text-right">GST</span>}
            <span className="text-right">Amount</span>
          </div>
          <div className="h-px bg-black w-full" />
          {totals.items.map((item) => (
            <React.Fragment key={item.id}>
              <div className="grid items-start py-3 text-sm" style={{ gridTemplateColumns: gridCols }}>
                <div>
                  <p>{item.description}</p>
                  {item.hsnSac && <p className="text-[10px] text-black/40 mt-0.5" style={mono}>{item.hsnSac}</p>}
                </div>
                <span className="text-right text-black/70" style={mono}>{item.quantity}{item.unit ? ` ${item.unit}` : ""}</span>
                <span className="text-right text-black/70" style={mono}>{formatCurrency(item.rate, invoice.currencySymbol)}</span>
                {gstMode === "split" && <><span className="text-right text-black/50 text-xs" style={mono}>{item.cgstPercent ?? 0}%</span><span className="text-right text-black/50 text-xs" style={mono}>{item.sgstPercent ?? 0}%</span></>}
                {gstMode === "single" && <span className="text-right text-black/50 text-xs" style={mono}>{item.gstPercent ?? 0}%</span>}
                <span className="text-right font-medium" style={mono}>{formatCurrency(item.lineTotal, invoice.currencySymbol)}</span>
              </div>
              <div className="h-px bg-black/15 w-full" />
            </React.Fragment>
          ))}
        </section>

        <section className="flex justify-end pt-6">
          <div className="w-72 space-y-1.5 text-sm" style={mono}>
            <Row label="Subtotal" value={totals.subTotal} symbol={invoice.currencySymbol} className="text-black/60" />
            {totals.totalDiscount > 0 && <Row label="Discount" value={-totals.totalDiscount} symbol={invoice.currencySymbol} className="text-black/60" />}
            {gstMode === "split" && <><Row label="CGST" value={totals.totalCgst} symbol={invoice.currencySymbol} className="text-black/60" /><Row label="SGST" value={totals.totalSgst} symbol={invoice.currencySymbol} className="text-black/60" /></>}
            {gstMode === "single" && <Row label="GST" value={totals.totalGst} symbol={invoice.currencySymbol} className="text-black/60" />}
            <div className="h-px bg-black w-full my-2" />
            <div className="flex justify-between items-baseline font-bold text-base"><span>Total</span><span>{formatCurrency(totals.grandTotal, invoice.currencySymbol)}</span></div>
            {totals.amountPaid > 0 && (
              <>
                <Row label="Paid" value={-totals.amountPaid} symbol={invoice.currencySymbol} className="text-black/60" />
                <div className="flex justify-between items-baseline font-bold"><span>Balance</span><span>{formatCurrency(totals.balanceDue, invoice.currencySymbol)}</span></div>
              </>
            )}
          </div>
        </section>

        <footer className="mt-auto pt-10">
          <div className="h-px bg-black w-full mb-4" />
          <div className="grid grid-cols-2 gap-10 text-[11px] text-black/60">
            {invoice.notes && <p>{invoice.notes}</p>}
            {invoice.bankDetails && <p style={mono}>{invoice.bankDetails.bankName} · {invoice.bankDetails.accountNumber} · {invoice.bankDetails.ifsc}</p>}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================================
   DEMO APP — switcher + GST mode toggle + mobile preview toggle
   ============================================================================ */

const TEMPLATES = [
  { id: "ledger", name: "Ledger", inspired: "Zoho Invoice", Component: LedgerTemplate },
  { id: "classic", name: "Classic Books", inspired: "QuickBooks", Component: ClassicBooksTemplate },
  { id: "studio", name: "Studio", inspired: "FreshBooks", Component: StudioTemplate },
  { id: "vyapar", name: "Vyapar Desi", inspired: "Vyapar", Component: VyaparDesiTemplate },
  { id: "mono", name: "Minimal Mono", inspired: "Original", Component: MinimalMonoTemplate },
];

export default function InvoiceTemplateGallery() {
  const [activeId, setActiveId] = useState("ledger");
  const [gstMode, setGstMode] = useState("split");
  const [mobilePreview, setMobilePreview] = useState(false);

  const active = TEMPLATES.find((t) => t.id === activeId);
  const invoice = buildInvoice(gstMode);
  const ActiveComponent = active.Component;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #invoice-print-root, #invoice-print-root * { visibility: visible; }
          #invoice-print-root { position: absolute; left: 0; top: 0; }
          .invoice-page { box-shadow: none !important; }
        }
        .invoice-page { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeId === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.name}
                <span className={`block text-[10px] font-normal ${activeId === t.id ? "text-slate-300" : "text-slate-400"}`}>
                  {t.inspired}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm">
              {[
                { id: "none", label: "No GST" },
                { id: "single", label: "Single GST" },
                { id: "split", label: "CGST/SGST" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setGstMode(m.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    gstMode === m.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobilePreview((v) => !v)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                mobilePreview ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {mobilePreview ? "📱 Mobile" : "🖥️ Desktop"}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="py-10 px-4 flex justify-center">
        <div
          id="invoice-print-root"
          style={
            mobilePreview
              ? { transform: "scale(0.45)", transformOrigin: "top center", width: "210mm", height: `${297 * 0.45 * 3.7795}px` }
              : { transform: "scale(0.82)", transformOrigin: "top center", height: `${297 * 0.82 * 3.7795}px` }
          }
        >
          <ActiveComponent invoice={invoice} />
        </div>
      </div>

      <p className="no-print text-center text-xs text-slate-400 pb-8">
        {mobilePreview ? "Mobile preview — scaled to fit a phone viewport" : "Desktop preview — scaled to fit window. Prints at true A4 size."}
      </p>
    </div>
  );
}
