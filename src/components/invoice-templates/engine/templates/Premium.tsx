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
  primaryColor: "amber-600",
  primaryText: "text-amber-700",
  primaryBg: "bg-amber-700",
  primaryBorder: "border-amber-700",
  accentColor: "stone-900",
  accentText: "text-stone-900",
  fontFamily: "font-serif",
  borderColor: "border-amber-100",
  tableHeaderBg: "bg-stone-900 text-amber-400",
  tableHeaderTextColor: "text-amber-400",
  tableRowStriped: true,
  cardStyle: true,
  styles: {
    primaryHex: "#b45309",
  },
};

export const Premium: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-12 border-t-8 border-amber-700 bg-amber-50/5">
      <div className="space-y-8">
        <InvoiceHeader data={data} theme={theme} className="pb-4 border-b border-amber-200" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CompanySection data={data} theme={theme} className="md:col-span-1" />
          <CustomerSection data={data} theme={theme} className="md:col-span-2" />
        </div>

        <InvoiceMeta data={data} theme={theme} className="bg-amber-50/20 border-amber-100" />
        
        <ItemsTable data={data} totals={totals} theme={theme} />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Premium;
