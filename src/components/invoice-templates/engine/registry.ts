import React from "react";
import { InvoiceData, InvoiceTotals } from "../data/invoiceTypes";

// Lazy-loaded or directly imported components
import Modern from "./templates/Modern";
import Minimal from "./templates/Minimal";
import Corporate from "./templates/Corporate";
import Creative from "./templates/Creative";
import Elegant from "./templates/Elegant";
import GST from "./templates/GST";
import Dark from "./templates/Dark";
import Agency from "./templates/Agency";
import Classic from "./templates/Classic";
import Premium from "./templates/Premium";

export interface TemplateProps {
  data: InvoiceData;
  totals: InvoiceTotals;
}

export type TemplateType = React.ComponentType<TemplateProps>;

export const templateRegistry: Record<string, TemplateType> = {
  modern: Modern,
  minimal: Minimal,
  corporate: Corporate,
  creative: Creative,
  elegant: Elegant,
  gst: GST,
  dark: Dark,
  agency: Agency,
  classic: Classic,
  premium: Premium,
};

/**
 * Helper to retrieve a template component by its registered identifier.
 * Defaults to the 'modern' template if the requested key is not found.
 */
export function getTemplate(templateName: string): TemplateType {
  const normalized = templateName.toLowerCase();
  return templateRegistry[normalized] || Modern;
}

export default templateRegistry;
