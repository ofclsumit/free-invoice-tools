import React from "react";
import { SectionProps } from "./types";

export const CompanySection: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const { company } = data;
  const isDark = theme?.isDark ?? false;
  const primaryText = theme?.primaryText || "text-indigo-600";

  return (
    <div className={`space-y-1.5 ${isDark ? "text-stone-300" : "text-stone-600"} ${className}`}>
      <p className={`font-semibold uppercase text-xs tracking-wider ${primaryText}`} style={{ color: theme?.styles?.primaryHex }}>
        From
      </p>
      <div className="space-y-1">
        <p className={`font-bold text-sm ${isDark ? "text-stone-100" : "text-stone-900"}`}>
          {company.name}
        </p>
        {company.addressLines.map((line, idx) => (
          <p key={idx} className="text-xs leading-relaxed">
            {line}
          </p>
        ))}
        {(company.email || company.phone) && (
          <div className="pt-1 text-[11px] space-y-0.5">
            {company.phone && <p>Phone: {company.phone}</p>}
            {company.email && <p>Email: {company.email}</p>}
          </div>
        )}
        {(company.gstin || company.pan) && (
          <div className="mt-1 pt-1 border-t border-dashed border-stone-200 dark:border-stone-700 text-[10px]">
            {company.gstin && (
              <p className="font-medium">
                GSTIN: <span className={isDark ? "text-stone-200" : "text-stone-800"}>{company.gstin}</span>
              </p>
            )}
            {company.pan && (
              <p className="font-medium">
                PAN: <span className={isDark ? "text-stone-200" : "text-stone-800"}>{company.pan}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySection;
