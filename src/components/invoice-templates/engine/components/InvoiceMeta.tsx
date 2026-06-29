import React from "react";
import { SectionProps } from "./types";

export const InvoiceMeta: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const { invoiceNumber, invoiceDate, dueDate, transportDetails } = data;
  const isDark = theme?.isDark ?? false;
  const primaryText = theme?.primaryText || "text-indigo-600";
  const labelClass = `text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-stone-400" : "text-stone-500"}`;
  const valClass = `text-sm font-bold ${isDark ? "text-stone-100" : "text-stone-900"}`;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border ${isDark ? "border-stone-850 bg-stone-850/50" : "border-stone-100 bg-stone-50/50"} ${className}`}>
      <div>
        <span className={labelClass}>Invoice No</span>
        <p className={`${valClass} ${primaryText}`} style={{ color: theme?.styles?.primaryHex }}>{invoiceNumber}</p>
      </div>
      <div>
        <span className={labelClass}>Date</span>
        <p className={valClass}>{invoiceDate}</p>
      </div>
      <div>
        <span className={labelClass}>Due Date</span>
        <p className={valClass}>{dueDate || "N/A"}</p>
      </div>
      {transportDetails?.vehicleNumber ? (
        <div>
          <span className={labelClass}>Vehicle No</span>
          <p className={valClass}>{transportDetails.vehicleNumber}</p>
        </div>
      ) : (
        <div>
          <span className={labelClass}>Terms</span>
          <p className={valClass}>Due on Receipt</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceMeta;
