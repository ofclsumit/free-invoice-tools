import React from "react";
import { InvoiceData, InvoiceTotals } from "../../data/invoiceTypes";
import BaseInvoice from "../components/BaseInvoice";
import InvoiceHeader from "../components/InvoiceHeader";
import CompanySection from "../components/CompanySection";
import CustomerSection from "../components/CustomerSection";
import InvoiceMeta from "../components/InvoiceMeta";
import ItemsTable from "../components/ItemsTable";
import TotalsSection from "../components/TotalsSection";
import NotesSection from "../components/NotesSection";
import Footer from "../components/Footer";
import { ThemeConfig } from "../components/types";

interface TemplateProps {
  data: InvoiceData;
  totals: InvoiceTotals;
}

const theme: ThemeConfig = {
  primaryColor: "stone-900",
  primaryText: "text-stone-900",
  primaryBg: "bg-stone-900",
  primaryBorder: "border-stone-900",
  fontFamily: "font-mono",
  borderColor: "border-stone-200",
  tableHeaderBg: "bg-transparent",
  tableHeaderTextColor: "text-stone-900 font-bold border-b-2 border-stone-900",
  tableRowStriped: false,
  cardStyle: false,
  styles: {
    primaryHex: "#1c1917",
  },
};

export const Minimal: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-8 border border-stone-200">
      <div className="space-y-8">
        <InvoiceHeader data={data} theme={theme} className="border-b border-stone-200 pb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CompanySection data={data} theme={theme} />
          <CustomerSection data={data} theme={theme} />
        </div>

        <InvoiceMeta data={data} theme={theme} className="border-t border-b border-stone-200 py-4 bg-transparent rounded-none" />
        
        <ItemsTable data={data} totals={totals} theme={theme} className="border-none rounded-none" />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} className="border-t border-stone-200" />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Minimal;
