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
  primaryColor: "slate-700",
  primaryText: "text-slate-700",
  primaryBg: "bg-slate-700",
  primaryBorder: "border-slate-700",
  fontFamily: "font-serif",
  borderColor: "border-slate-300",
  tableHeaderBg: "bg-slate-100",
  tableHeaderTextColor: "text-slate-800 font-bold",
  tableRowStriped: true,
  cardStyle: false,
  styles: {
    primaryHex: "#334155",
  },
};

export const Classic: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-10 border-4 border-double border-slate-400">
      <div className="space-y-6">
        <InvoiceHeader data={data} theme={theme} className="border-b-2 border-slate-300 pb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanySection data={data} theme={theme} />
          <CustomerSection data={data} theme={theme} />
        </div>

        <InvoiceMeta data={data} theme={theme} className="bg-transparent border-t border-b border-slate-300 py-2 rounded-none" />
        
        <ItemsTable data={data} totals={totals} theme={theme} className="rounded-none border-t border-b border-l-0 border-r-0" />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} className="border-t border-slate-300" />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Classic;
