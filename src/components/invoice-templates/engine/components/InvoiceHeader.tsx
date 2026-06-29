import React from "react";
import { SectionProps } from "./types";

export const InvoiceHeader: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const { company, documentType = "INVOICE", status } = data;
  const isDark = theme?.isDark ?? false;
  const primaryText = theme?.primaryText || "text-indigo-600";
  const primaryBg = theme?.primaryBg || "bg-indigo-600";
  const headerBg = theme?.headerBg || (isDark ? "bg-stone-800" : "bg-transparent");

  const getStatusColor = (statusStr?: string) => {
    if (!statusStr) return "bg-gray-100 text-gray-800";
    switch (statusStr.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "unpaid":
        return "bg-red-100 text-red-800 border-red-200";
      case "overdue":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "partially paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <header className={`flex items-center justify-between p-4 rounded-lg ${headerBg} ${className}`}>
      <div className="flex items-center gap-4">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt="Company Logo"
            className="h-16 w-16 object-contain"
          />
        ) : (
          <div
            className={`h-16 w-16 flex items-center justify-center text-white font-extrabold rounded-lg shadow-sm text-2xl ${primaryBg}`}
            style={{
              backgroundColor: theme?.styles?.primaryHex,
            }}
          >
            {company.name ? company.name.charAt(0).toUpperCase() : "I"}
          </div>
        )}
        <div>
          <h1 className={`text-2xl font-bold uppercase tracking-tight ${isDark ? "text-stone-100" : "text-stone-900"}`}>
            {company.name}
          </h1>
          {company.website && (
            <p className={`text-xs ${isDark ? "text-stone-400" : "text-stone-500"}`}>
              {company.website}
            </p>
          )}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <h2
          className={`text-2xl font-black uppercase tracking-wide ${primaryText}`}
          style={{ color: theme?.styles?.primaryHex }}
        >
          {documentType}
        </h2>
        {status && (
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        )}
      </div>
    </header>
  );
};

export default InvoiceHeader;
