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
  primaryColor: "violet-600",
  primaryText: "text-violet-600",
  primaryBg: "bg-violet-600",
  primaryBorder: "border-violet-600",
  fontFamily: "font-sans",
  borderColor: "border-stone-200",
  tableHeaderBg: "bg-stone-900 text-white",
  tableHeaderTextColor: "text-white",
  tableRowStriped: true,
  cardStyle: true,
  styles: {
    primaryHex: "#7c3aed",
  },
};

export const Agency: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-8">
      <div className="space-y-6">
        <div className="bg-violet-600 text-white rounded-lg p-6">
          <InvoiceHeader data={data} theme={{ ...theme, primaryText: "text-white", headerBg: "bg-transparent" }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border-r border-stone-200 pr-6 space-y-4">
            <CompanySection data={data} theme={theme} />
            <InvoiceMeta data={data} theme={theme} className="bg-stone-50 border-none grid-cols-1 md:grid-cols-1" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <CustomerSection data={data} theme={theme} />
            <ItemsTable data={data} totals={totals} theme={theme} />
            <TotalsSection data={data} totals={totals} theme={theme} />
          </div>
        </div>
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Agency;
