import React from "react";
import { SectionProps } from "./types";

export const CustomerSection: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const { billTo, shipTo } = data;
  const isDark = theme?.isDark ?? false;
  const primaryText = theme?.primaryText || "text-indigo-600";
  const cardStyle = theme?.cardStyle ?? false;

  const renderParty = (party: typeof billTo, title: string) => {
    return (
      <div
        className={`flex-1 p-3 rounded-lg ${
          cardStyle
            ? isDark
              ? "bg-stone-800 border border-stone-700"
              : "bg-stone-50 border border-stone-100"
            : ""
        }`}
      >
        <p className={`font-semibold uppercase text-xs tracking-wider mb-1.5 ${primaryText}`} style={{ color: theme?.styles?.primaryHex }}>
          {title}
        </p>
        <div className={`space-y-0.5 ${isDark ? "text-stone-300" : "text-stone-600"}`}>
          <p className={`font-bold text-sm ${isDark ? "text-stone-100" : "text-stone-900"}`}>
            {party.name}
          </p>
          {party.addressLines.map((line, idx) => (
            <p key={idx} className="text-xs leading-relaxed">
              {line}
            </p>
          ))}
          {(party.phone || party.email) && (
            <div className="pt-1 text-[11px] space-y-0.5">
              {party.phone && <p>Phone: {party.phone}</p>}
              {party.email && <p>Email: {party.email}</p>}
            </div>
          )}
          {party.gstin && (
            <p className="mt-1 text-[10px] font-semibold">
              GSTIN: <span className={isDark ? "text-stone-200" : "text-stone-800"}>{party.gstin}</span>
            </p>
          )}
          {party.placeOfSupply && (
            <p className="text-[10px]">
              Place of Supply: <span className={isDark ? "text-stone-200" : "text-stone-800"}>{party.placeOfSupply}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      {renderParty(billTo, "Bill To")}
      {shipTo && renderParty(shipTo, "Ship To")}
    </div>
  );
};

export default CustomerSection;
