import React from "react";
import { SectionProps } from "./types";
import { formatCurrency, computeInvoiceTotals } from "../../data/invoiceTypes";

export const ItemsTable: React.FC<SectionProps> = ({
  data,
  totals,
  theme,
  className = "",
}) => {
  const isDark = theme?.isDark ?? false;
  const currencySymbol = data.currencySymbol;
  const activeTotals = totals || computeInvoiceTotals(data);
  const { items, gstMode } = data;

  const tableHeaderBg = theme?.tableHeaderBg || (isDark ? "bg-stone-850" : "bg-stone-50");
  const tableHeaderTextColor = theme?.tableHeaderTextColor || (isDark ? "text-stone-300" : "text-stone-700");
  const borderColor = theme?.borderColor || (isDark ? "border-stone-800" : "border-stone-100");

  const showGst = gstMode !== "none";
  const isSplitGst = gstMode === "split";

  return (
    <div className={`overflow-hidden rounded-lg border ${borderColor} ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`text-xs font-bold uppercase tracking-wider ${tableHeaderBg} ${tableHeaderTextColor}`}>
            <th className="py-3 px-4 w-10">#</th>
            <th className="py-3 px-4">Item Description</th>
            {showGst && <th className="py-3 px-4 text-center">HSN/SAC</th>}
            <th className="py-3 px-4 text-center w-20">Qty</th>
            <th className="py-3 px-4 text-right w-28">Rate</th>
            {showGst && (
              <>
                {isSplitGst ? (
                  <>
                    <th className="py-3 px-2 text-right w-20">CGST</th>
                    <th className="py-3 px-2 text-right w-20">SGST</th>
                    <th className="py-3 px-2 text-right w-20">IGST</th>
                  </>
                ) : (
                  <th className="py-3 px-4 text-right w-20">GST</th>
                )}
              </>
            )}
            <th className="py-3 px-4 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody className={`text-xs divide-y ${borderColor}`}>
          {activeTotals.items.map((item, index) => {
            const isEven = index % 2 === 0;
            const rowBg = theme?.tableRowStriped
              ? isEven
                ? isDark
                  ? "bg-stone-900/50"
                  : "bg-stone-50/30"
                : isDark
                ? "bg-stone-850/30"
                : "bg-stone-50/80"
              : "bg-transparent";

            return (
              <tr key={item.id || index} className={`${rowBg} hover:bg-stone-100/10 transition-colors`}>
                <td className="py-3 px-4 text-stone-400 font-medium">{index + 1}</td>
                <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                  {item.description}
                </td>
                {showGst && (
                  <td className="py-3 px-4 text-center text-stone-500 font-mono">
                    {item.hsnSac || "-"}
                  </td>
                )}
                <td className="py-3 px-4 text-center font-semibold text-stone-700 dark:text-stone-300">
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-stone-700 dark:text-stone-300 font-mono">
                  {formatCurrency(item.rate, currencySymbol)}
                </td>
                {showGst && (
                  <>
                    {isSplitGst ? (
                      <>
                        <td className="py-3 px-2 text-right font-mono text-stone-600 dark:text-stone-400">
                          <div>{item.cgstPercent}%</div>
                          <div className="text-[10px] text-stone-400">
                            ({formatCurrency(item.cgstAmount, currencySymbol)})
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-stone-600 dark:text-stone-400">
                          <div>{item.sgstPercent}%</div>
                          <div className="text-[10px] text-stone-400">
                            ({formatCurrency(item.sgstAmount, currencySymbol)})
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-stone-600 dark:text-stone-400">
                          <div>{item.igstPercent}%</div>
                          <div className="text-[10px] text-stone-400">
                            ({formatCurrency(item.igstAmount, currencySymbol)})
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="py-3 px-4 text-right font-mono text-stone-600 dark:text-stone-400">
                        <div>{item.gstPercent}%</div>
                        <div className="text-[10px] text-stone-400">
                          ({formatCurrency(item.gstAmount, currencySymbol)})
                        </div>
                      </td>
                    )}
                  </>
                )}
                <td className="py-3 px-4 text-right font-bold text-stone-900 dark:text-stone-100 font-mono">
                  {formatCurrency(item.lineTotal, currencySymbol)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
