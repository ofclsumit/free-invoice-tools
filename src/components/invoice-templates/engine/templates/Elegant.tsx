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
  primaryColor: "emerald-950",
  primaryText: "text-emerald-950",
  primaryBg: "bg-emerald-950",
  primaryBorder: "border-emerald-950",
  fontFamily: "font-serif",
  borderColor: "border-stone-200",
  tableHeaderBg: "bg-emerald-950/5",
  tableHeaderTextColor: "text-emerald-950 font-bold",
  tableRowStriped: false,
  cardStyle: false,
  styles: {
    primaryHex: "#022c22",
  },
};

export const Elegant: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-12">
      <div className="space-y-8">
        <div className="text-center pb-6 border-b border-stone-200">
          <InvoiceHeader data={data} theme={theme} className="justify-center flex-col text-center" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CompanySection data={data} theme={theme} />
          <CustomerSection data={data} theme={theme} />
        </div>

        <InvoiceMeta data={data} theme={theme} className="rounded-none bg-stone-50 border-t-2 border-b-2 border-emerald-950" />
        
        <ItemsTable data={data} totals={totals} theme={theme} className="border-t border-b border-l-0 border-r-0 rounded-none" />
        
        <TotalsSection data={data} totals={totals} theme={theme} />
        
        <NotesSection data={data} theme={theme} />
      </div>
      <Footer data={data} theme={theme} />
    </BaseInvoice>
  );
};

export default Elegant;
