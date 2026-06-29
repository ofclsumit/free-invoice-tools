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
  primaryColor: "rose-500",
  primaryText: "text-rose-500",
  primaryBg: "bg-rose-500",
  primaryBorder: "border-rose-500",
  accentColor: "amber-500",
  accentText: "text-amber-500",
  fontFamily: "font-sans",
  borderColor: "border-rose-100",
  tableHeaderBg: "bg-rose-500 text-white rounded-t-lg",
  tableHeaderTextColor: "text-white",
  tableRowStriped: true,
  cardStyle: true,
  styles: {
    primaryHex: "#f43f5e",
  },
};

export const Creative: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-8 bg-rose-50/10">
      <div className="space-y-6">
        <InvoiceHeader data={data} theme={theme} className="bg-rose-50" />
        
        {/* Creative two-column flex layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 p-4 bg-amber-50/50 rounded-lg space-y-4">
            <CompanySection data={data} theme={theme} />
          </div>
          <div className="md:col-span-2 space-y-4">
            <CustomerSection data={data} theme={theme} />
            <InvoiceMeta data={data} theme={theme} />
          </div>
        </div>
        
        <ItemsTable data={data} totals={totals} theme={theme} />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Creative;
