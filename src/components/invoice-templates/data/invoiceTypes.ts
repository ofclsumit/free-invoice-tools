// ──────────────────────────────────────────────────────────────────────────
// Shared invoice data contract — every template consumes this same shape.
// Keeping one contract means swapping templates never means rewriting data.
// ──────────────────────────────────────────────────────────────────────────

export type GstMode = "none" | "single" | "split";

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  signatureUrl?: string;
  addressLines: string[];
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface PartyInfo {
  name: string;
  addressLines: string[];
  gstin?: string;
  email?: string;
  phone?: string;
  placeOfSupply?: string;
}

export interface LineItem {
  id: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unit?: string; // e.g. "pcs", "hrs", "kg"
  rate: number;
  /** Single-mode GST % (used when gstMode === "single") */
  gstPercent?: number;
  /** Split-mode rates (used when gstMode === "split") */
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  discountPercent?: number;
}

export interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  branch?: string;
  upiId?: string;
}

export interface TransportDetails {
  transporterName?: string;
  vehicleNumber?: string;
  vehicleType?: string; // e.g. "Regular", "ODC"
  modeOfTransport?: string; // e.g. "Road", "Rail", "Air", "Ship"
  distance?: string;
  transportDocNo?: string;
  transactionType?: string; // e.g. "Regular", "Job Work", etc.
  shippedFromAddress?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string; // ISO or display string
  dueDate?: string;
  documentType?: string;
  status?: "Paid" | "Unpaid" | "Overdue" | "Draft" | "Partially Paid";
  currencySymbol: string; // "₹", "$", "€"
  gstMode: GstMode;

  company: CompanyInfo;
  billTo: PartyInfo;
  shipTo?: PartyInfo;

  items: LineItem[];

  /** Flat discount applied after line totals, before tax (optional) */
  globalDiscountPercent?: number;
  /** Additional charges like shipping (optional) */
  shippingCharge?: number;

  notes?: string;
  terms?: string;
  termsAndConditions?: string;
  bankDetails?: BankDetails;
  watermarkUrl?: string;

  amountPaid?: number;
  /** Whether to render reverse-charge note (Indian GST requirement) */
  reverseCharge?: boolean;

  transportDetails?: TransportDetails;
}


// ──────────────────────────────────────────────────────────────────────────
// Calculation engine — shared by all templates so totals are always
// consistent regardless of which visual component renders them.
// ──────────────────────────────────────────────────────────────────────────

export interface LineItemComputed extends LineItem {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstAmount: number;
  lineTotal: number;
}

export interface InvoiceTotals {
  items: LineItemComputed[];
  subTotal: number;
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  shippingCharge: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  hasSplitGst: boolean;
}

export function computeInvoiceTotals(invoice: InvoiceData): InvoiceTotals {
  const { items, gstMode, globalDiscountPercent = 0, shippingCharge = 0, amountPaid = 0 } = invoice;

  let subTotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const computedItems: LineItemComputed[] = items.map((item) => {
    const gross = item.quantity * item.rate;
    const discountAmt = gross * ((item.discountPercent ?? 0) / 100);
    const taxableValue = gross - discountAmt;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (gstMode === "single") {
      const pct = item.gstPercent ?? 0;
      // Split evenly into CGST/SGST for display purposes when in single mode
      cgstAmount = (taxableValue * pct) / 100 / 2;
      sgstAmount = (taxableValue * pct) / 100 / 2;
    } else if (gstMode === "split") {
      cgstAmount = (taxableValue * (item.cgstPercent ?? 0)) / 100;
      sgstAmount = (taxableValue * (item.sgstPercent ?? 0)) / 100;
      igstAmount = (taxableValue * (item.igstPercent ?? 0)) / 100;
    }

    const gstAmount = cgstAmount + sgstAmount + igstAmount;
    const lineTotal = taxableValue + gstAmount;

    subTotal += gross;
    totalDiscount += discountAmt;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    return {
      ...item,
      taxableValue,
      cgstAmount,
      sgstAmount,
      igstAmount,
      gstAmount,
      lineTotal,
    };
  });

  const afterLineDiscount = subTotal - totalDiscount;
  const globalDiscountAmt = afterLineDiscount * (globalDiscountPercent / 100);
  const totalGst = totalCgst + totalSgst + totalIgst;

  const grandTotal =
    afterLineDiscount - globalDiscountAmt + totalGst + shippingCharge;

  const balanceDue = grandTotal - amountPaid;

  return {
    items: computedItems,
    subTotal,
    totalDiscount: totalDiscount + globalDiscountAmt,
    totalCgst,
    totalSgst,
    totalIgst,
    totalGst,
    shippingCharge,
    grandTotal,
    amountPaid,
    balanceDue,
    hasSplitGst: gstMode === "split" && totalIgst === 0 && (totalCgst > 0 || totalSgst > 0),
  };
}

export function formatCurrency(amount: number, symbol: string): string {
  const fixed = amount.toFixed(2);
  const [whole, decimal] = fixed.split(".");
  // Indian-style grouping (e.g. 1,23,456.00) when symbol is ₹, else standard grouping
  if (symbol === "₹") {
    const lastThree = whole.slice(-3);
    const otherNumbers = whole.slice(0, -3);
    const formatted =
      otherNumbers !== ""
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
        : lastThree;
    return `${symbol}${formatted}.${decimal}`;
  }
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${formatted}.${decimal}`;
}

export function numberToWords(num: number, currencyName = "Rupees", subUnit = "Paise"): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }

  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);

  let result = `${currencyName} ${inWords(whole) || "Zero"} Only`;
  if (fraction > 0) {
    result = `${currencyName} ${inWords(whole) || "Zero"} and ${subUnit} ${inWords(fraction)} Only`;
  }
  return result;
}
