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
  primaryColor: "emerald-400",
  primaryText: "text-emerald-400",
  primaryBg: "bg-emerald-500",
  primaryBorder: "border-emerald-500",
  fontFamily: "font-sans",
  borderColor: "border-stone-800",
  tableHeaderBg: "bg-stone-850",
  tableHeaderTextColor: "text-stone-200",
  tableRowStriped: true,
  cardStyle: true,
  isDark: true,
  styles: {
    primaryHex: "#34d399",
  },
};

export const Dark: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-8">
      <div className="space-y-6">
        <InvoiceHeader data={data} theme={theme} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanySection data={data} theme={theme} />
          <CustomerSection data={data} theme={theme} />
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

export default Dark;
