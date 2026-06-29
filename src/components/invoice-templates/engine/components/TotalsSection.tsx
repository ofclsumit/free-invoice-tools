import React from "react";
import { SectionProps } from "./types";
import { formatCurrency, computeInvoiceTotals, numberToWords } from "../../data/invoiceTypes";

export const TotalsSection: React.FC<SectionProps> = ({
  data,
  totals,
  theme,
  className = "",
}) => {
  const isDark = theme?.isDark ?? false;
  const currencySymbol = data.currencySymbol;
  const activeTotals = totals || computeInvoiceTotals(data);
  const primaryText = theme?.primaryText || "text-indigo-600";
  const primaryBg = theme?.primaryBg || "bg-indigo-600";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start ${className}`}>
      {/* Amount in words & tax summaries */}
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${isDark ? "border-stone-800 bg-stone-850/30" : "border-stone-100 bg-stone-50/50"}`}>
          <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            Amount In Words
          </p>
          <p className="text-xs font-bold leading-relaxed">
            {numberToWords(activeTotals.grandTotal, currencySymbol === "₹" ? "Rupees" : "Dollars")}
          </p>
        </div>

        {/* Short GST Mode Indicator */}
        {data.gstMode !== "none" && (
          <div className="text-[10px] text-stone-500 space-y-1">
            <p>Tax Scheme: <span className="font-semibold text-stone-700 dark:text-stone-300">GST ({data.gstMode.toUpperCase()})</span></p>
            {activeTotals.hasSplitGst && (
              <p className="italic text-stone-400">Intra-state supply transaction. CGST and SGST splits applied.</p>
            )}
          </div>
        )}
      </div>

      {/* Financial calculations */}
      <div className={`flex flex-col gap-2 p-4 rounded-lg ${isDark ? "bg-stone-850/40" : "bg-stone-50/20"}`}>
        <div className="flex justify-between items-center text-xs">
          <span className={isDark ? "text-stone-400" : "text-stone-500"}>Subtotal</span>
          <span className="font-semibold font-mono">{formatCurrency(activeTotals.subTotal, currencySymbol)}</span>
        </div>

        {activeTotals.totalDiscount > 0 && (
          <div className="flex justify-between items-center text-xs text-red-500">
            <span>Total Discount</span>
            <span className="font-semibold font-mono">-{formatCurrency(activeTotals.totalDiscount, currencySymbol)}</span>
          </div>
        )}

        {data.gstMode !== "none" && activeTotals.totalGst > 0 && (
          <div className="flex flex-col gap-1 border-t border-b border-dashed border-stone-200 dark:border-stone-700 py-2 my-1 text-xs">
            {data.gstMode === "split" ? (
              <>
                {activeTotals.totalCgst > 0 && (
                  <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                    <span>Central GST (CGST)</span>
                    <span className="font-mono">{formatCurrency(activeTotals.totalCgst, currencySymbol)}</span>
                  </div>
                )}
                {activeTotals.totalSgst > 0 && (
                  <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                    <span>State GST (SGST)</span>
                    <span className="font-mono">{formatCurrency(activeTotals.totalSgst, currencySymbol)}</span>
                  </div>
                )}
                {activeTotals.totalIgst > 0 && (
                  <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                    <span>Integrated GST (IGST)</span>
                    <span className="font-mono">{formatCurrency(activeTotals.totalIgst, currencySymbol)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                <span>Goods & Services Tax (GST)</span>
                <span className="font-mono">{formatCurrency(activeTotals.totalGst, currencySymbol)}</span>
              </div>
            )}
          </div>
        )}

        {activeTotals.shippingCharge > 0 && (
          <div className="flex justify-between items-center text-xs">
            <span className={isDark ? "text-stone-400" : "text-stone-500"}>Shipping / Charges</span>
            <span className="font-semibold font-mono">{formatCurrency(activeTotals.shippingCharge, currencySymbol)}</span>
          </div>
        )}

        <div className={`flex justify-between items-center px-3 py-2 rounded mt-2 text-white ${primaryBg}`} style={{ backgroundColor: theme?.styles?.primaryHex }}>
          <span className="text-sm font-bold">Grand Total</span>
          <span className="text-base font-black font-mono">{formatCurrency(activeTotals.grandTotal, currencySymbol)}</span>
        </div>

        {activeTotals.amountPaid > 0 && (
          <div className="flex justify-between items-center text-xs mt-2">
            <span className="text-green-600 font-semibold">Amount Paid</span>
            <span className="font-bold text-green-600 font-mono">{formatCurrency(activeTotals.amountPaid, currencySymbol)}</span>
          </div>
        )}

        {activeTotals.balanceDue !== activeTotals.grandTotal && (
          <div className="flex justify-between items-center text-xs border-t border-stone-200 dark:border-stone-700 pt-2 mt-1">
            <span className="font-bold">Balance Due</span>
            <span className={`text-sm font-bold font-mono ${activeTotals.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(activeTotals.balanceDue, currencySymbol)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalsSection;
