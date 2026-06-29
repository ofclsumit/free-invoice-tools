import React from "react";
import { InvoiceData, computeInvoiceTotals } from "../data/invoiceTypes";
import { getTemplate } from "./registry";

interface InvoiceRendererProps {
  template: string;
  data: InvoiceData;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({
  template,
  data,
}) => {
  // Compute invoice totals once using the single calculation engine
  const totals = computeInvoiceTotals(data);

  // Retrieve the requested template component from the registry
  const SelectedTemplate = getTemplate(template);

  // Render the selected template with the structured data and calculated totals
  return <SelectedTemplate data={data} totals={totals} />;
};

export default InvoiceRenderer;
