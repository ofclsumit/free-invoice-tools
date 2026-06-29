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
  primaryColor: "blue-900",
  primaryText: "text-blue-900",
  primaryBg: "bg-blue-900",
  primaryBorder: "border-blue-900",
  fontFamily: "font-sans",
  borderColor: "border-blue-100",
  tableHeaderBg: "bg-blue-900 text-white",
  tableHeaderTextColor: "text-white",
  tableRowStriped: true,
  cardStyle: true,
  styles: {
    primaryHex: "#1e3a8a",
  },
};

export const Corporate: React.FC<TemplateProps> = ({ data, totals }) => {
  return (
    <BaseInvoice data={data} theme={theme} className="p-8">
      <div className="space-y-6">
        <InvoiceHeader data={data} theme={theme} className="bg-blue-50 border-l-4 border-blue-900" />
        
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

export default Corporate;
