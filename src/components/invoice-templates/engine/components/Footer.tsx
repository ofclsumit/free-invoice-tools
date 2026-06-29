import React from "react";
import { SectionProps } from "./types";

export const Footer: React.FC<SectionProps> = ({
  data,
  theme,
  className = "",
}) => {
  const isDark = theme?.isDark ?? false;

  return (
    <footer className={`mt-8 pt-4 border-t border-stone-100 dark:border-stone-850 text-center ${className}`}>
      <p className={`text-[10px] ${isDark ? "text-stone-400" : "text-stone-500"} leading-normal`}>
        Thank you for your business. For any queries regarding this document, please reach out to us at{" "}
        <span className="font-semibold text-stone-700 dark:text-stone-300">
          {data.company.email || "support@company.com"}
        </span>
        .
      </p>
      <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1">
        Generated electronically via QuoteFlow.
      </p>
    </footer>
  );
};

export default Footer;
