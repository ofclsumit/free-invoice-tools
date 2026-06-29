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
  primaryColor: "amber-700",
  primaryText: "text-amber-700",
  primaryBg: "bg-amber-700",
  primaryBorder: "border-amber-700",
  accentColor: "red-800",
  accentText: "text-red-800",
  fontFamily: "font-sans",
  borderColor: "border-stone-300",
  tableHeaderBg: "bg-amber-50",
  tableHeaderTextColor: "text-amber-900 font-bold",
  tableRowStriped: true,
  cardStyle: false,
  styles: {
    primaryHex: "#b45309",
  },
};

export const GST: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-6 border-2 border-amber-700">
      <div className="space-y-4">
        <InvoiceHeader data={data} theme={theme} className="bg-amber-50/50 border-b border-amber-700 rounded-none p-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-stone-200 p-3 rounded">
          <CompanySection data={data} theme={theme} />
          <CustomerSection data={data} theme={theme} />
        </div>

        <InvoiceMeta data={data} theme={theme} className="bg-amber-50/30 border-amber-200" />
        
        <ItemsTable data={data} totals={totals} theme={theme} />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default GST;
