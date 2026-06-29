import React from "react";
import { InvoiceData, InvoiceTotals } from "../../data/invoiceTypes";

export interface ThemeConfig {
  primaryColor?: string;       // e.g. "indigo-600" or custom hex / tailwind classes
  primaryText?: string;        // text class e.g. "text-indigo-600"
  primaryBg?: string;          // background class e.g. "bg-indigo-600"
  primaryBorder?: string;      // border class e.g. "border-indigo-600"
  accentColor?: string;        // e.g. "amber-500"
  accentText?: string;
  accentBg?: string;
  accentBorder?: string;
  fontFamily?: string;         // e.g. "font-sans", "font-serif", "font-mono"
  borderColor?: string;        // e.g. "border-gray-200"
  headerBg?: string;           // background for header section
  tableHeaderBg?: string;      // e.g. "bg-gray-50"
  tableHeaderTextColor?: string; // e.g. "text-gray-700"
  tableRowStriped?: boolean;   // alternating table row backgrounds
  cardStyle?: boolean;         // whether billing sections look like cards
  badgeColor?: string;         // background/text for status
  isDark?: boolean;            // Dark mode template flag
  styles?: {
    primaryHex?: string;
    accentHex?: string;
    border?: React.CSSProperties;
    container?: React.CSSProperties;
  };
}

export interface SectionProps {
  data: InvoiceData;
  totals?: InvoiceTotals;
  theme?: ThemeConfig;
  className?: string;
}
