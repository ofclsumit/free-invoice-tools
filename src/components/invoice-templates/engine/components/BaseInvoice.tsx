import React from "react";
import { InvoiceData } from "../../data/invoiceTypes";
import { ThemeConfig } from "./types";

interface BaseInvoiceProps {
  data: InvoiceData;
  theme?: ThemeConfig;
  className?: string;
  children: React.ReactNode;
}

export const BaseInvoice: React.FC<BaseInvoiceProps> = ({
  data,
  theme,
  className = "",
  children,
}) => {
  const isDark = theme?.isDark ?? false;
  const fontFamilyClass = theme?.fontFamily || "font-sans";

  return (
    <div
      className={`invoice-page relative w-[210mm] min-h-[297mm] mx-auto p-8 shadow-lg print:shadow-none print:p-0 flex flex-col justify-between overflow-hidden ${
        isDark ? "bg-stone-900 text-stone-100" : "bg-white text-stone-900"
      } ${fontFamilyClass} ${className}`}
      style={{
        boxSizing: "border-box",
        ...theme?.styles?.container,
      }}
    >
      {/* Watermark handling */}
      {data.watermarkUrl && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.06] z-0">
          <img
            src={data.watermarkUrl}
            alt=""
            className="max-w-[70%] max-h-[70%] object-contain"
          />
        </div>
      )}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[275mm]">
        {children}
      </div>
    </div>
  );
};

export default BaseInvoice;
