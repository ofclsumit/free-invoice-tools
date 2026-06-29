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
  primaryColor: "indigo-600",
  primaryText: "text-indigo-600",
  primaryBg: "bg-indigo-600",
  primaryBorder: "border-indigo-600",
  accentColor: "violet-500",
  accentText: "text-violet-500",
  accentBg: "bg-violet-50",
  fontFamily: "font-sans",
  borderColor: "border-slate-200",
  tableHeaderBg: "bg-gradient-to-r from-indigo-50 to-violet-50",
  tableHeaderTextColor: "text-indigo-900",
  tableRowStriped: true,
  cardStyle: true,
  styles: {
    primaryHex: "#4F46E5",
    accentHex: "#8B5CF6",
  },
};

export const Modern: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-10">
      <div className="space-y-6">
        <InvoiceHeader data={data} theme={theme} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <CompanySection data={data} theme={theme} className="md:col-span-1" />
          <CustomerSection data={data} theme={theme} className="md:col-span-2" />
        </div>

        <InvoiceMeta data={data} theme={theme} />
        
        <ItemsTable data={data} totals={totals} theme={theme} />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Modern;
