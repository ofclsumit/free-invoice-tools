import { InvoiceData } from "./invoiceTypes";

export const sampleInvoiceSplitGst: InvoiceData = {
  invoiceNumber: "INV-2026-0143",
  invoiceDate: "2026-06-21",
  dueDate: "2026-07-05",
  status: "Unpaid",
  currencySymbol: "₹",
  gstMode: "split",
  company: {
    name: "Northwind Design Studio",
    addressLines: ["402, Sunrise Business Park", "S.G. Highway, Ahmedabad", "Gujarat, India – 380015"],
    gstin: "24AAAPL1234C1ZV",
    pan: "AAAPL1234C",
    email: "billing@northwindstudio.in",
    phone: "+91 98765 43210",
    website: "www.northwindstudio.in",
  },
  billTo: {
    name: "Verve Retail Pvt. Ltd.",
    addressLines: ["14th Floor, Cosmos Tower", "Vastrapur, Ahmedabad", "Gujarat, India – 380054"],
    gstin: "24AABCV5678D1ZP",
    email: "accounts@ververetail.com",
    placeOfSupply: "24-Gujarat",
  },
  items: [
    {
      id: "1",
      description: "Brand Identity Design — logo, palette, typography system",
      hsnSac: "998314",
      quantity: 1,
      unit: "project",
      rate: 45000,
      cgstPercent: 9,
      sgstPercent: 9,
    },
    {
      id: "2",
      description: "Website UI/UX Design (12 screens)",
      hsnSac: "998314",
      quantity: 12,
      unit: "screens",
      rate: 3500,
      cgstPercent: 9,
      sgstPercent: 9,
    },
    {
      id: "3",
      description: "Stationery & Collateral Design (business cards, letterhead)",
      hsnSac: "998314",
      quantity: 1,
      unit: "set",
      rate: 8000,
      cgstPercent: 9,
      sgstPercent: 9,
      discountPercent: 10,
    },
  ],
  shippingCharge: 0,
  notes: "Thank you for your business. Files will be delivered in editable + production-ready formats.",
  termsAndConditions:
    "Payment due within 14 days of invoice date. Late payments may attract 1.5% monthly interest. All design files remain property of Northwind Design Studio until full payment is received.",
  bankDetails: {
    accountName: "Northwind Design Studio",
    accountNumber: "50100123456789",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "S.G. Highway, Ahmedabad",
    upiId: "northwind@hdfcbank",
  },
  amountPaid: 0,
};

export const sampleInvoiceSingleGst: InvoiceData = {
  ...sampleInvoiceSplitGst,
  invoiceNumber: "INV-2026-0144",
  gstMode: "single",
  status: "Paid",
  items: sampleInvoiceSplitGst.items.map((item) => ({
    ...item,
    gstPercent: (item.cgstPercent ?? 0) + (item.sgstPercent ?? 0),
    cgstPercent: undefined,
    sgstPercent: undefined,
  })),
  amountPaid: 56700,
};

export const sampleInvoiceNoGst: InvoiceData = {
  ...sampleInvoiceSplitGst,
  invoiceNumber: "INV-2026-0145",
  gstMode: "none",
  company: {
    ...sampleInvoiceSplitGst.company,
    gstin: undefined,
  },
  items: sampleInvoiceSplitGst.items.map((item) => ({
    ...item,
    cgstPercent: undefined,
    sgstPercent: undefined,
    gstPercent: undefined,
  })),
};
