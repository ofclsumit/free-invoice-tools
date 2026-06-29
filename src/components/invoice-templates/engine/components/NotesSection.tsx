import React from "react";
import { SectionProps } from "./types";

export const NotesSection: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const { notes, termsAndConditions, bankDetails, reverseCharge, company } = data;
  const isDark = theme?.isDark ?? false;
  const primaryText = theme?.primaryText || "text-indigo-600";
  const primaryBorder = theme?.primaryBorder || "border-indigo-600";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-stone-800 ${className}`}>
      {/* Terms, Notes, and Banking details */}
      <div className="space-y-4 text-[11px] leading-relaxed">
        {bankDetails && (bankDetails.bankName || bankDetails.accountNumber) && (
          <div className={`p-3 rounded-lg border ${isDark ? "border-stone-800 bg-stone-850/20" : "border-stone-100 bg-stone-50/30"}`}>
            <p className={`font-semibold uppercase tracking-wider text-[10px] mb-1.5 ${primaryText}`} style={{ color: theme?.styles?.primaryHex }}>
              Bank Payment Details
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              {bankDetails.bankName && <p className="col-span-2 font-bold">{bankDetails.bankName}</p>}
              {bankDetails.accountName && (
                <>
                  <span className="text-stone-400">Account Name:</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{bankDetails.accountName}</span>
                </>
              )}
              {bankDetails.accountNumber && (
                <>
                  <span className="text-stone-400">Account No:</span>
                  <span className="font-mono font-medium text-stone-700 dark:text-stone-300">{bankDetails.accountNumber}</span>
                </>
              )}
              {bankDetails.ifsc && (
                <>
                  <span className="text-stone-400">IFSC Code:</span>
                  <span className="font-mono font-medium text-stone-700 dark:text-stone-300">{bankDetails.ifsc}</span>
                </>
              )}
              {bankDetails.upiId && (
                <>
                  <span className="text-stone-400">UPI ID:</span>
                  <span className="font-mono font-medium text-stone-700 dark:text-stone-300">{bankDetails.upiId}</span>
                </>
              )}
            </div>
          </div>
        )}

        {notes && (
          <div>
            <p className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Notes</p>
            <p className="text-stone-600 dark:text-stone-400 whitespace-pre-line">{notes}</p>
          </div>
        )}

        {termsAndConditions && (
          <div>
            <p className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Terms & Conditions</p>
            <p className="text-stone-600 dark:text-stone-400 whitespace-pre-line">{termsAndConditions}</p>
          </div>
        )}

        {reverseCharge && (
          <p className="text-[10px] italic font-semibold text-stone-500">
            * Reverse Charge: Applicable (Tax payable under reverse charge on supply received from unregistered person).
          </p>
        )}
      </div>

      {/* Signature section */}
      <div className="flex flex-col justify-end items-end h-full min-h-[100px] text-right">
        {company.signatureUrl ? (
          <img
            src={company.signatureUrl}
            alt="Authorized Signature"
            className="h-14 max-w-[180px] object-contain mb-1"
          />
        ) : (
          <div className="h-14 flex items-end justify-center mb-1 text-[11px] text-stone-400 italic">
            Sign here
          </div>
        )}
        <div className={`w-44 border-t-2 ${primaryBorder}`} style={{ borderColor: theme?.styles?.primaryHex }} />
        <p className="text-xs font-bold mt-1 text-stone-850 dark:text-stone-200">Authorized Signatory</p>
        <p className="text-[10px] text-stone-500">{company.name}</p>
      </div>
    </div>
  );
};

export default NotesSection;
